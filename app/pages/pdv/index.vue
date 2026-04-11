<script setup lang="ts">
useBreadcrumb().set([{ label: "PDV" }]);

import type { FormaPagamento, ItemVendaPayload } from "~/types/pdv";
import type { Produto } from "~/types/estoque";
import type { Servico } from "~/types/servico";

const {
  fecharVenda,
  vendas,
  total,
  loading,
  fetchVendas,
  fetchResumoDia,
  cancelarVenda,
  resumo,
} = usePdv();
const { fetchProdutos, produtos } = useEstoque();
const { fetchAll: fetchServicos, servicos } = useServicos();
const toast = useToast();

// ─── Datas ────────────────────────────────────────────────────────────────────
const hoje = (() => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
})();
const filtroData = ref(hoje);

const carregar = async () => {
  await Promise.all([
    fetchVendas({ dataInicio: filtroData.value, dataFim: filtroData.value }),
    fetchResumoDia(filtroData.value),
  ]);
};

onMounted(async () => {
  await Promise.all([carregar(), fetchProdutos(), fetchServicos()]);
});
watch(filtroData, carregar);

// ─── Carrinho ─────────────────────────────────────────────────────────────────
const itens = ref<ItemVendaPayload[]>([]);
const formaPagamento = ref<FormaPagamento>("Dinheiro");
const desconto = ref<string>("");
const valorPago = ref<string>("");
const observacoes = ref("");
const salvando = ref(false);

const totalBruto = computed(() =>
  itens.value.reduce((acc, i) => acc + i.quantidade * i.precoUnitario, 0),
);
const descontoNum = computed(() => Number(desconto.value) || 0);
const totalLiquido = computed(() =>
  Math.max(0, totalBruto.value - descontoNum.value),
);
const trocoCalc = computed(() => {
  const pago = Number(valorPago.value) || 0;
  return formaPagamento.value === "Dinheiro" && pago > totalLiquido.value
    ? pago - totalLiquido.value
    : null;
});

// ─── Adicionar item ───────────────────────────────────────────────────────────
const tipoBusca = ref<"produto" | "servico">("produto");
const busca = ref("");

const produtosFiltrados = computed(() => {
  if (!busca.value) return produtos.value.slice(0, 8);
  return produtos.value
    .filter(
      (p) =>
        p.nome.toLowerCase().includes(busca.value.toLowerCase()) ||
        (p.codigoBarras && p.codigoBarras.includes(busca.value)),
    )
    .slice(0, 8);
});

const servicosFiltrados = computed(() => {
  if (!busca.value) return servicos.value.slice(0, 8);
  return servicos.value
    .filter((s) => s.nome.toLowerCase().includes(busca.value.toLowerCase()))
    .slice(0, 8);
});

const adicionarProduto = (p: Produto) => {
  if (!p.precoVenda) {
    toast.add({
      title: "Produto sem preço de venda definido",
      color: "warning",
    });
    return;
  }
  const existente = itens.value.find((i) => i.produtoId === p.id);
  if (existente) {
    existente.quantidade++;
  } else {
    itens.value.push({
      tipo: "Produto",
      nome: p.nome,
      quantidade: 1,
      precoUnitario: p.precoVenda,
      produtoId: p.id,
    });
  }
  busca.value = "";
};

const onBuscaEnter = () => {
  if (tipoBusca.value === "produto") {
    // Tenta match exato por código de barras primeiro, depois nome
    const exato =
      produtos.value.find(
        (p) => p.codigoBarras && p.codigoBarras === busca.value.trim(),
      ) ??
      (produtosFiltrados.value.length === 1
        ? produtosFiltrados.value[0]
        : null);
    if (exato) adicionarProduto(exato);
  } else if (servicosFiltrados.value.length === 1) {
    adicionarServico(servicosFiltrados.value[0]!);
  }
};

const adicionarServico = (s: Servico) => {
  const existente = itens.value.find((i) => i.servicoId === s.id);
  if (existente) {
    existente.quantidade++;
  } else {
    itens.value.push({
      tipo: "Servico",
      nome: s.nome,
      quantidade: 1,
      precoUnitario: Number(s.preco),
      servicoId: s.id,
    });
  }
  busca.value = "";
};

const removerItem = (idx: number) => {
  itens.value.splice(idx, 1);
};

const limparCarrinho = () => {
  itens.value = [];
  desconto.value = "";
  valorPago.value = "";
  observacoes.value = "";
  formaPagamento.value = "Dinheiro";
};

// ─── Fechar venda ─────────────────────────────────────────────────────────────
const confirmarVenda = async () => {
  if (itens.value.length === 0) {
    toast.add({ title: "Adicione ao menos um item", color: "warning" });
    return;
  }
  salvando.value = true;
  try {
    await fecharVenda({
      formaPagamento: formaPagamento.value,
      itens: itens.value,
      desconto: descontoNum.value > 0 ? descontoNum.value : undefined,
      valorPago: valorPago.value ? Number(valorPago.value) : undefined,
      observacoes: observacoes.value || undefined,
    });
    toast.add({ title: "Venda concluída com sucesso!", color: "success" });
    limparCarrinho();
    await carregar();
  } catch (e: unknown) {
    const msg =
      (e as { data?: { message?: string } })?.data?.message ??
      "Erro ao registrar venda";
    toast.add({ title: msg, color: "error" });
  } finally {
    salvando.value = false;
  }
};

// ─── Cancelar venda ────────────────────────────────────────────────────────────
const cancelando = ref<string | null>(null);
const isModalCancelar = ref(false);
const vendaParaCancelarId = ref<string | null>(null);

const abrirModalCancelar = (id: string) => {
  vendaParaCancelarId.value = id;
  isModalCancelar.value = true;
};

const confirmarCancelar = async () => {
  const id = vendaParaCancelarId.value;
  if (!id) return;
  isModalCancelar.value = false;
  cancelando.value = id;
  try {
    await cancelarVenda(id);
    toast.add({ title: "Venda cancelada", color: "neutral" });
    await carregar();
  } catch {
    toast.add({ title: "Erro ao cancelar venda", color: "error" });
  } finally {
    cancelando.value = null;
    vendaParaCancelarId.value = null;
  }
};

// ─── Formatação ───────────────────────────────────────────────────────────────
const fmt = (v: number) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const fmtData = (d: string) =>
  new Date(d).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

const labelForma: Record<FormaPagamento, string> = {
  Dinheiro: "Dinheiro",
  Cartao: "Cartão",
  Pix: "PIX",
  Outro: "Outro",
};

const formaOptions: {
  label: string;
  value: FormaPagamento;
  shortcut: string;
  key: string;
}[] = [
  { label: "Dinheiro", value: "Dinheiro", shortcut: "F1", key: "F1" },
  { label: "Cartão", value: "Cartao", shortcut: "F2", key: "F2" },
  { label: "PIX", value: "Pix", shortcut: "F3", key: "F3" },
  { label: "Outro", value: "Outro", shortcut: "F4", key: "F4" },
];

const onKeydown = (e: KeyboardEvent) => {
  const found = formaOptions.find((o) => o.key === e.key);
  if (found) {
    e.preventDefault();
    formaPagamento.value = found.value;
  }
};

onMounted(() => document.addEventListener("keydown", onKeydown));
onUnmounted(() => document.removeEventListener("keydown", onKeydown));
</script>

<template>
  <div class="flex flex-col gap-4">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-xl font-bold text-gray-800 dark:text-gray-100">
          Ponto de Venda
        </h1>
        <p class="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
          Registre vendas de produtos e serviços no balcão
        </p>
      </div>
    </div>

    <!-- Resumo do dia -->
    <div v-if="resumo" class="grid grid-cols-2 sm:grid-cols-4 gap-3">
      <div
        class="bg-white dark:bg-neutral-800 rounded-2xl p-4 shadow-sm flex items-center justify-between gap-3"
      >
        <div>
          <p class="text-xs text-gray-500 dark:text-gray-400">Total do Dia</p>
          <p
            class="text-lg font-extrabold text-gray-800 dark:text-gray-100 mt-0.5"
          >
            {{ fmt(resumo.totalVendas) }}
          </p>
        </div>
        <div
          class="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
          style="background: #d1fae5"
        >
          <UIcon
            name="i-lucide-shopping-cart"
            class="text-emerald-600 text-lg"
          />
        </div>
      </div>

      <div
        class="bg-white dark:bg-neutral-800 rounded-2xl p-4 shadow-sm flex items-center justify-between gap-3"
      >
        <div>
          <p class="text-xs text-gray-500 dark:text-gray-400">Vendas</p>
          <p
            class="text-lg font-extrabold text-gray-800 dark:text-gray-100 mt-0.5"
          >
            {{ resumo.quantidadeVendas }}
          </p>
        </div>
        <div
          class="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
          style="background: #e0f2fe"
        >
          <UIcon name="i-lucide-receipt" class="text-sky-600 text-lg" />
        </div>
      </div>

      <div
        v-for="(valor, forma) in resumo.porFormaPagamento"
        :key="forma"
        class="bg-white dark:bg-neutral-800 rounded-2xl p-4 shadow-sm flex items-center justify-between gap-3"
      >
        <div>
          <p class="text-xs text-gray-500 dark:text-gray-400">
            {{ labelForma[forma as FormaPagamento] ?? forma }}
          </p>
          <p
            class="text-lg font-extrabold text-gray-800 dark:text-gray-100 mt-0.5"
          >
            {{ fmt(valor) }}
          </p>
        </div>
        <div
          class="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
          style="background: #fff3e0"
        >
          <UIcon name="i-lucide-banknote" class="text-amber-600 text-lg" />
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <!-- ── Caixa / Carrinho ─────────────────────────────────────────── -->
      <div
        class="bg-white dark:bg-neutral-800 rounded-2xl shadow-sm p-4 flex flex-col gap-4"
      >
        <h2
          class="font-semibold text-gray-800 dark:text-gray-100 flex items-center gap-2"
        >
          <UIcon name="i-lucide-shopping-cart" />
          Carrinho
        </h2>

        <!-- Tipo de item + busca -->
        <div class="flex gap-2">
          <UButtonGroup class="shrink-0">
            <UButton
              :color="tipoBusca === 'produto' ? 'secondary' : 'neutral'"
              :variant="tipoBusca === 'produto' ? 'solid' : 'outline'"
              size="sm"
              label="Produto"
              @click="
                tipoBusca = 'produto';
                busca = '';
              "
            />
            <UButton
              :color="tipoBusca === 'servico' ? 'secondary' : 'neutral'"
              :variant="tipoBusca === 'servico' ? 'solid' : 'outline'"
              size="sm"
              label="Serviço"
              @click="
                tipoBusca = 'servico';
                busca = '';
              "
            />
          </UButtonGroup>
          <UInput
            v-model="busca"
            placeholder="Buscar por nome ou código de barras..."
            icon="i-lucide-search"
            class="flex-1"
            size="sm"
            @keydown.enter="onBuscaEnter"
          />
        </div>

        <!-- Resultados da busca -->
        <div
          v-if="
            busca ||
            (tipoBusca === 'produto' ? produtosFiltrados : servicosFiltrados)
              .length > 0
          "
          class="border border-gray-200 dark:border-neutral-700 rounded-xl overflow-auto max-h-40"
        >
          <template v-if="tipoBusca === 'produto'">
            <button
              v-for="p in produtosFiltrados"
              :key="p.id"
              class="w-full flex items-center gap-2.5 px-3 py-2 hover:bg-gray-50 dark:hover:bg-neutral-700 text-left text-sm transition-colors"
              :disabled="!p.precoVenda || p.quantidadeAtual === 0"
              :class="{
                'opacity-40 cursor-not-allowed':
                  !p.precoVenda || p.quantidadeAtual === 0,
              }"
              @click="adicionarProduto(p)"
            >
              <div
                class="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                style="background: #fff7ed"
              >
                <UIcon
                  name="i-lucide-package"
                  class="size-3.5"
                  style="color: #f97316"
                />
              </div>
              <span
                class="font-medium text-gray-800 dark:text-gray-100 truncate flex-1"
                >{{ p.nome }}</span
              >
              <span class="text-xs text-gray-500 dark:text-gray-400 shrink-0">
                {{ p.precoVenda ? fmt(Number(p.precoVenda)) : "sem preço" }} ·
                estoque: {{ p.quantidadeAtual }}
              </span>
            </button>
            <p
              v-if="produtosFiltrados.length === 0"
              class="text-center text-xs text-gray-400 py-3"
            >
              Nenhum produto encontrado
            </p>
          </template>
          <template v-else>
            <button
              v-for="s in servicosFiltrados"
              :key="s.id"
              class="w-full flex items-center gap-2.5 px-3 py-2 hover:bg-gray-50 dark:hover:bg-neutral-700 text-left text-sm transition-colors"
              @click="adicionarServico(s)"
            >
              <div
                class="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                style="background: #f0fdff"
              >
                <UIcon
                  name="i-lucide-scissors"
                  class="size-3.5"
                  style="color: #0891b2"
                />
              </div>
              <span
                class="font-medium text-gray-800 dark:text-gray-100 truncate flex-1"
                >{{ s.nome }}</span
              >
              <span class="text-xs text-gray-500 dark:text-gray-400 shrink-0">{{
                fmt(Number(s.preco))
              }}</span>
            </button>
            <p
              v-if="servicosFiltrados.length === 0"
              class="text-center text-xs text-gray-400 py-3"
            >
              Nenhum serviço encontrado
            </p>
          </template>
        </div>

        <!-- Itens no carrinho -->
        <div class="flex flex-col gap-2 min-h-30">
          <p
            v-if="itens.length === 0"
            class="text-center text-sm text-gray-400 dark:text-gray-500 py-6"
          >
            Nenhum item adicionado
          </p>
          <div
            v-for="(item, idx) in itens"
            :key="idx"
            class="flex items-center gap-2 bg-gray-50 dark:bg-neutral-700 rounded-xl px-3 py-2"
          >
            <div
              class="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
              :style="
                item.tipo === 'Produto'
                  ? 'background:#fff7ed'
                  : 'background:#f0fdff'
              "
            >
              <UIcon
                :name="
                  item.tipo === 'Produto'
                    ? 'i-lucide-package'
                    : 'i-lucide-scissors'
                "
                class="size-4"
                :style="
                  item.tipo === 'Produto' ? 'color:#f97316' : 'color:#0891b2'
                "
              />
            </div>
            <div class="flex-1 min-w-0">
              <p
                class="text-sm font-medium text-gray-800 dark:text-gray-100 truncate"
              >
                {{ item.nome }}
              </p>
              <p class="text-xs text-gray-500 dark:text-gray-400">
                {{ fmt(item.precoUnitario) }} × {{ item.quantidade }} =
                {{ fmt(item.precoUnitario * item.quantidade) }}
              </p>
            </div>
            <div class="flex items-center gap-1 shrink-0">
              <UButton
                icon="i-lucide-minus"
                size="xs"
                color="neutral"
                variant="ghost"
                :disabled="item.quantidade <= 1"
                @click="item.quantidade--"
              />
              <span class="text-sm font-semibold w-5 text-center">{{
                item.quantidade
              }}</span>
              <UButton
                icon="i-lucide-plus"
                size="xs"
                color="neutral"
                variant="ghost"
                @click="item.quantidade++"
              />
              <UButton
                icon="i-lucide-trash-2"
                size="xs"
                color="error"
                variant="ghost"
                @click="removerItem(idx)"
              />
            </div>
          </div>
        </div>

        <!-- Totais -->
        <div
          class="border-t border-gray-100 dark:border-neutral-700 pt-3 flex flex-col gap-2"
        >
          <div
            class="flex justify-between text-sm text-gray-500 dark:text-gray-400"
          >
            <span>Subtotal</span>
            <span>{{ fmt(totalBruto) }}</span>
          </div>
          <div class="flex items-center gap-2">
            <span class="text-sm text-gray-500 dark:text-gray-400 shrink-0"
              >Desconto</span
            >
            <UInput
              v-model="desconto"
              placeholder="0,00"
              size="sm"
              class="flex-1"
              type="number"
              min="0"
            />
          </div>
          <div
            class="flex justify-between text-base font-bold text-gray-800 dark:text-gray-100"
          >
            <span>Total</span>
            <span>{{ fmt(totalLiquido) }}</span>
          </div>
        </div>

        <!-- Forma de pagamento + valor pago -->
        <div class="flex flex-col gap-2">
          <div class="grid grid-cols-4 gap-1.5">
            <button
              v-for="opt in formaOptions"
              :key="opt.value"
              type="button"
              class="flex flex-col items-center justify-center gap-0.5 px-2 py-2 rounded-xl border-2 text-xs font-semibold transition-all focus:outline-none"
              :class="
                formaPagamento === opt.value
                  ? 'border-secondary-400 bg-secondary-50 dark:bg-secondary-900/20 text-secondary-600 dark:text-secondary-400'
                  : 'border-gray-200 dark:border-neutral-600 text-gray-500 dark:text-gray-400 hover:border-gray-300'
              "
              @click="formaPagamento = opt.value"
            >
              <span>{{ opt.label }}</span>
              <kbd
                class="text-[11px] font-bold font-mono px-1.5 py-0.5 rounded border border-gray-300 dark:border-neutral-500 bg-white dark:bg-neutral-700 text-gray-600 dark:text-gray-200 shadow-sm"
                >{{ opt.shortcut }}</kbd
              >
            </button>
          </div>
          <UInput
            v-if="formaPagamento === 'Dinheiro'"
            v-model="valorPago"
            placeholder="Valor recebido (opcional)"
            type="number"
            min="0"
            size="sm"
          />
          <p
            v-if="trocoCalc !== null"
            class="text-sm font-semibold text-emerald-600 dark:text-emerald-400"
          >
            Troco: {{ fmt(trocoCalc) }}
          </p>
          <UInput
            v-model="observacoes"
            placeholder="Observações (opcional)"
            size="sm"
          />
        </div>

        <!-- Botões de ação -->
        <div class="flex gap-2">
          <UButton
            label="Limpar"
            color="neutral"
            variant="outline"
            icon="i-lucide-eraser"
            class="flex-1"
            :disabled="itens.length === 0 || salvando"
            @click="limparCarrinho"
          />
          <UButton
            label="Confirmar Venda"
            color="secondary"
            icon="i-lucide-check"
            class="flex-1"
            :loading="salvando"
            :disabled="itens.length === 0"
            @click="confirmarVenda"
          />
        </div>
      </div>

      <!-- ── Histórico de vendas ──────────────────────────────────────── -->
      <div
        class="bg-white dark:bg-neutral-800 rounded-2xl shadow-sm p-4 flex flex-col gap-4"
      >
        <div class="flex items-center justify-between">
          <h2
            class="font-semibold text-gray-800 dark:text-gray-100 flex items-center gap-2"
          >
            <UIcon name="i-lucide-history" />
            Histórico
          </h2>
          <UInput v-model="filtroData" type="date" size="sm" class="w-40" />
        </div>

        <div v-if="loading" class="flex flex-col gap-2">
          <USkeleton v-for="i in 4" :key="i" class="h-16 w-full rounded-xl" />
        </div>

        <div
          v-else-if="vendas.length === 0"
          class="text-center text-sm text-gray-400 py-8"
        >
          Nenhuma venda nesta data
        </div>

        <div v-else class="flex flex-col gap-2 overflow-auto max-h-130">
          <div
            v-for="v in vendas"
            :key="v.id"
            class="border border-gray-100 dark:border-neutral-700 rounded-xl p-3 flex flex-col gap-1"
            :class="{ 'opacity-50': v.status === 'Cancelada' }"
          >
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <span class="text-xs font-bold text-gray-500 dark:text-gray-400"
                  >#{{ v.numero }}</span
                >
                <UBadge
                  :label="v.status === 'Concluida' ? 'Concluída' : 'Cancelada'"
                  :color="v.status === 'Concluida' ? 'success' : 'error'"
                  variant="subtle"
                  size="xs"
                />
                <UBadge
                  :label="labelForma[v.formaPagamento]"
                  color="neutral"
                  variant="outline"
                  size="xs"
                />
              </div>
              <UButton
                v-if="v.status === 'Concluida'"
                icon="i-lucide-x"
                size="xs"
                color="error"
                variant="ghost"
                :loading="cancelando === v.id"
                @click="abrirModalCancelar(v.id)"
              />
            </div>
            <div class="flex items-center justify-between">
              <p class="text-xs text-gray-500 dark:text-gray-400">
                {{ fmtData(v.createdAt) }}
                <span v-if="v.cliente"> · {{ v.cliente.nome }}</span>
              </p>
              <p class="text-sm font-bold text-gray-800 dark:text-gray-100">
                {{ fmt(Number(v.valorTotal)) }}
              </p>
            </div>
            <p class="text-xs text-gray-400 dark:text-gray-500">
              {{ v.itens.map((i) => `${i.nome} ×${i.quantidade}`).join(", ") }}
            </p>
          </div>
        </div>

        <p
          v-if="total > vendas.length"
          class="text-xs text-gray-400 text-center"
        >
          Exibindo {{ vendas.length }} de {{ total }} vendas
        </p>
      </div>
    </div>
  </div>

  <!-- Modal de confirmação de cancelamento -->
  <UModal v-model:open="isModalCancelar">
    <template #content>
      <UCard>
        <template #header>
          <div class="flex items-center gap-2">
            <UIcon name="i-lucide-alert-triangle" class="text-red-500 size-5" />
            <span class="font-semibold text-gray-800 dark:text-gray-100"
              >Cancelar venda?</span
            >
          </div>
        </template>

        <div
          class="flex flex-col gap-2 text-sm text-gray-600 dark:text-gray-300"
        >
          <p>Tem certeza que deseja cancelar esta venda? Ao confirmar:</p>
          <ul
            class="list-disc list-inside space-y-1 text-gray-500 dark:text-gray-400"
          >
            <li>
              A venda será marcada como <strong>Cancelada</strong> no histórico.
            </li>
            <li>
              O estoque dos produtos vendidos será
              <strong>devolvido automaticamente</strong>.
            </li>
            <li>
              Um <strong>estorno financeiro</strong> será registrado no
              financeiro.
            </li>
          </ul>
        </div>

        <template #footer>
          <div class="flex justify-end gap-2">
            <UButton
              color="neutral"
              variant="ghost"
              @click="isModalCancelar = false"
              >Voltar</UButton
            >
            <UButton color="error" @click="confirmarCancelar"
              >Sim, cancelar venda</UButton
            >
          </div>
        </template>
      </UCard>
    </template>
  </UModal>
</template>
