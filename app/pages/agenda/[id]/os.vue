<script setup lang="ts">
import type {
  OrdemServico,
  FormaPagamento,
  ItemOrdemServico,
} from "~/types/ordemServico";
import type { Produto } from "~/types/estoque";
import { useAuthStore } from "~/stores/auth";

const route = useRoute();
const router = useRouter();
const toast = useToast();
const auth = useAuthStore();

const agendamentoId = route.params.id as string;

const { abrirOuBuscar, addItem, removeItem, finalizar } = useOrdemServico();
const { fetchProdutos } = useEstoque();

useBreadcrumb().set([
  { label: "Agenda", to: "/agenda" },
  { label: "Ordem de Serviço" },
]);

// -- Estado -----------------------------------------------------------------
const os = ref<OrdemServico | null>(null);
const carregando = ref(true);
const salvando = ref(false);
const finalizando = ref(false);

// -- Busca de produtos para adicionar à OS -----------------------------------
const buscaProduto = ref("");
const produtosBusca = ref<Produto[]>([]);
const buscandoProduto = ref(false);

const buscarProdutos = async () => {
  if (!buscaProduto.value.trim()) {
    produtosBusca.value = [];
    return;
  }
  buscandoProduto.value = true;
  try {
    produtosBusca.value = (await fetchProdutos(buscaProduto.value)) ?? [];
  } finally {
    buscandoProduto.value = false;
  }
};

let buscaTimer: ReturnType<typeof setTimeout>;
watch(buscaProduto, () => {
  clearTimeout(buscaTimer);
  buscaTimer = setTimeout(buscarProdutos, 350);
});

// -- Produto sendo adicionado -----------------------------------------------
const produtoSelecionado = ref<Produto | null>(null);
const qtdProduto = ref(1);

const selecionarProduto = (produto: Produto) => {
  produtoSelecionado.value = produto;
  buscaProduto.value = produto.nome;
  produtosBusca.value = [];
};

const adicionarProduto = async () => {
  if (!os.value || !produtoSelecionado.value) return;
  salvando.value = true;
  try {
    const novoItem = await addItem(os.value.id, {
      tipo: "Produto",
      nome: produtoSelecionado.value.nome,
      quantidade: qtdProduto.value,
      precoUnitario:
        produtoSelecionado.value.precoVenda ??
        produtoSelecionado.value.precoCompra,
      produtoId: produtoSelecionado.value.id,
    });
    os.value.itens.push(novoItem as ItemOrdemServico);
    buscaProduto.value = "";
    produtoSelecionado.value = null;
    qtdProduto.value = 1;
    toast.add({ title: "Produto adicionado", color: "success" });
  } catch {
    toast.add({ title: "Erro ao adicionar produto", color: "error" });
  } finally {
    salvando.value = false;
  }
};

const removerItem = async (itemId: string) => {
  if (!os.value) return;
  salvando.value = true;
  try {
    await removeItem(os.value.id, itemId);
    os.value.itens = os.value.itens.filter((i) => i.id !== itemId);
    toast.add({ title: "Item removido", color: "neutral" });
  } catch {
    toast.add({ title: "Erro ao remover item", color: "error" });
  } finally {
    salvando.value = false;
  }
};

// -- Finalizar OS -----------------------------------------------------------
const formaPagamento = ref<FormaPagamento>("Pix");
const desconto = ref(0);
const observacoes = ref("");

const opcoesForma: { label: string; value: FormaPagamento }[] = [
  { label: "Pix", value: "Pix" },
  { label: "Dinheiro", value: "Dinheiro" },
  { label: "Cartão", value: "Cartao" },
  { label: "Fiado", value: "Fiado" },
  { label: "Outro", value: "Outro" },
];

const totalItens = computed(() => {
  if (!os.value) return 0;
  return os.value.itens.reduce((sum, i) => sum + Number(i.subtotal), 0);
});

const taxaBusca = computed(() =>
  os.value?.agendamento.taxaBusca ? Number(os.value.agendamento.taxaBusca) : 0,
);

const totalFinal = computed(() =>
  Math.max(0, totalItens.value + taxaBusca.value - (desconto.value || 0)),
);

const confirmarFinalizar = ref(false);

const executarFinalizar = async () => {
  if (!os.value) return;
  finalizando.value = true;
  confirmarFinalizar.value = false;
  try {
    os.value = await finalizar(os.value.id, {
      formaPagamento: formaPagamento.value,
      desconto: desconto.value || undefined,
      observacoes: observacoes.value || undefined,
    });
    toast.add({ title: "✅ OS finalizada com sucesso!", color: "success" });
    await refreshNuxtData("agenda");
  } catch {
    toast.add({ title: "Erro ao finalizar OS", color: "error" });
  } finally {
    finalizando.value = false;
  }
};

// -- Impressão --------------------------------------------------------------
const imprimir = () => globalThis.window?.print();

// -- Formatação -------------------------------------------------------------
const fmtMoeda = (v: number) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const fmtData = (iso: string) =>
  new Date(iso).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

const fmtDataCurta = (iso: string) => new Date(iso).toLocaleDateString("pt-BR");

// -- Carregamento inicial ---------------------------------------------------
onMounted(async () => {
  try {
    os.value = await abrirOuBuscar(agendamentoId);
    if (os.value.observacoes) observacoes.value = os.value.observacoes;
    if (os.value.formaPagamento) formaPagamento.value = os.value.formaPagamento;
    if (os.value.desconto) desconto.value = Number(os.value.desconto);
  } catch {
    toast.add({ title: "Erro ao carregar OS", color: "error" });
    router.push("/agenda");
  } finally {
    carregando.value = false;
  }
});
</script>

<template>
  <div class="pb-24 print:pb-0">
    <!-- Skeleton de carregamento -->
    <div v-if="carregando" class="flex justify-center items-center h-64">
      <UIcon
        name="i-lucide-loader-2"
        class="size-8 animate-spin text-gray-400"
      />
    </div>

    <template v-else-if="os">
      <!-- ── Cabeçalho (oculto na impressão) ─────────────────────────── -->
      <div
        class="print:hidden flex items-center justify-between mb-6 gap-4 flex-wrap"
      >
        <div class="flex items-center gap-3">
          <UButton
            icon="i-lucide-arrow-left"
            variant="ghost"
            color="neutral"
            to="/agenda"
          />
          <div>
            <h1 class="text-xl font-semibold text-gray-900 dark:text-white">
              Ordem de Serviço #{{ os.numero }}
            </h1>
            <p class="text-sm text-gray-500 dark:text-gray-400">
              {{ fmtData(os.agendamento.dataHora) }}
            </p>
          </div>
          <span
            class="text-xs font-semibold px-2.5 py-1 rounded-full"
            :class="{
              'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-400':
                os.status === 'Aberta',
              'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400':
                os.status === 'Concluida',
              'bg-gray-100 text-gray-500 dark:bg-neutral-700 dark:text-gray-400':
                os.status === 'Cancelada',
            }"
          >
            {{
              os.status === "Aberta"
                ? "Em Atendimento"
                : os.status === "Concluida"
                  ? "Concluída"
                  : "Cancelada"
            }}
          </span>
        </div>

        <div class="flex items-center gap-2">
          <UButton
            icon="i-lucide-printer"
            variant="outline"
            color="neutral"
            label="Imprimir"
            @click="imprimir"
          />
        </div>
      </div>

      <!-- ── LAYOUT DE IMPRESSÃO ──────────────────────────────────────── -->
      <div class="print-container">
        <!-- Cabeçalho do documento impresso -->
        <div class="hidden print:block mb-6 border-b-2 border-gray-800 pb-4">
          <div class="flex justify-between items-start">
            <div>
              <h1 class="text-2xl font-bold text-gray-900">
                {{ auth.usuario?.nomePetshop }}
              </h1>
              <p class="text-sm text-gray-600 mt-1">Ordem de Serviço</p>
            </div>
            <div class="text-right text-sm text-gray-600">
              <p class="font-semibold text-base">OS #{{ os.numero }}</p>
              <p>Data: {{ fmtData(os.agendamento.dataHora) }}</p>
              <p>Emitida em: {{ fmtDataCurta(os.createdAt) }}</p>
            </div>
          </div>
        </div>

        <!-- Grid: Cliente + Pet -->
        <div
          class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 print:grid-cols-2 print:mb-4"
        >
          <!-- Card Cliente -->
          <div
            class="bg-white dark:bg-neutral-800 rounded-xl border border-gray-200 dark:border-neutral-700 p-4 print:border print:border-gray-300 print:rounded"
          >
            <h3
              class="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3 print:text-gray-600"
            >
              👤 Cliente
            </h3>
            <p
              class="font-semibold text-gray-900 dark:text-white print:text-gray-900"
            >
              {{ os.agendamento.cliente.nome }}
            </p>
            <p
              class="text-sm text-gray-500 dark:text-gray-400 print:text-gray-600 mt-1"
            >
              {{ os.agendamento.cliente.telefonePrincipal }}
            </p>
          </div>

          <!-- Card Pet -->
          <div
            class="bg-white dark:bg-neutral-800 rounded-xl border border-gray-200 dark:border-neutral-700 p-4 print:border print:border-gray-300 print:rounded"
          >
            <h3
              class="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3 print:text-gray-600"
            >
              🐾 Pet
            </h3>
            <p
              class="font-semibold text-gray-900 dark:text-white print:text-gray-900"
            >
              {{ os.agendamento.pet.nome }}
            </p>
            <p
              class="text-sm text-gray-500 dark:text-gray-400 print:text-gray-600 mt-1"
            >
              {{ os.agendamento.pet.especie }}
              <span v-if="os.agendamento.pet.raca">
                · {{ os.agendamento.pet.raca }}</span
              >
            </p>
          </div>
        </div>

        <!-- Tabela de itens -->
        <div
          class="bg-white dark:bg-neutral-800 rounded-xl border border-gray-200 dark:border-neutral-700 overflow-hidden mb-6 print:border print:border-gray-300 print:mb-4"
        >
          <div
            class="px-4 py-3 border-b border-gray-100 dark:border-neutral-700 flex items-center justify-between print:border-gray-300"
          >
            <h3
              class="font-semibold text-sm text-gray-700 dark:text-gray-300 print:text-gray-900"
            >
              Serviços e Produtos
            </h3>
          </div>

          <table class="w-full text-sm">
            <thead>
              <tr class="bg-gray-50 dark:bg-neutral-700/50 print:bg-gray-100">
                <th
                  class="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 print:text-gray-600"
                >
                  Item
                </th>
                <th
                  class="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 print:text-gray-600"
                >
                  Tipo
                </th>
                <th
                  class="px-4 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-400 print:text-gray-600"
                >
                  Qtd
                </th>
                <th
                  class="px-4 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-400 print:text-gray-600"
                >
                  Unitário
                </th>
                <th
                  class="px-4 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-400 print:text-gray-600"
                >
                  Subtotal
                </th>
                <th
                  v-if="os.status === 'Aberta'"
                  class="px-4 py-2 print:hidden"
                />
              </tr>
            </thead>
            <tbody
              class="divide-y divide-gray-100 dark:divide-neutral-700 print:divide-gray-200"
            >
              <tr v-for="item in os.itens" :key="item.id">
                <td
                  class="px-4 py-3 text-gray-900 dark:text-white print:text-gray-900 font-medium"
                >
                  {{ item.nome }}
                </td>
                <td class="px-4 py-3">
                  <span
                    class="text-xs px-2 py-0.5 rounded-full font-medium"
                    :class="
                      item.tipo === 'Servico'
                        ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400 print:bg-transparent print:text-gray-600'
                        : 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-400 print:bg-transparent print:text-gray-600'
                    "
                  >
                    {{ item.tipo === "Servico" ? "Serviço" : "Produto" }}
                  </span>
                </td>
                <td
                  class="px-4 py-3 text-right text-gray-700 dark:text-gray-300 print:text-gray-900"
                >
                  {{ item.quantidade }}
                </td>
                <td
                  class="px-4 py-3 text-right text-gray-700 dark:text-gray-300 print:text-gray-900"
                >
                  {{ fmtMoeda(Number(item.precoUnitario)) }}
                </td>
                <td
                  class="px-4 py-3 text-right font-semibold text-gray-900 dark:text-white print:text-gray-900"
                >
                  {{ fmtMoeda(Number(item.subtotal)) }}
                </td>
                <td
                  v-if="os.status === 'Aberta'"
                  class="px-4 py-3 print:hidden"
                >
                  <UButton
                    v-if="item.tipo === 'Produto'"
                    icon="i-lucide-trash-2"
                    color="error"
                    variant="ghost"
                    size="xs"
                    :loading="salvando"
                    @click="removerItem(item.id)"
                  />
                </td>
              </tr>
              <tr v-if="os.itens.length === 0">
                <td
                  colspan="6"
                  class="px-4 py-6 text-center text-gray-400 text-sm"
                >
                  Nenhum item na OS
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Resumo financeiro -->
        <div
          class="bg-white dark:bg-neutral-800 rounded-xl border border-gray-200 dark:border-neutral-700 overflow-hidden mb-6 print:border print:border-gray-300 print:mb-4"
        >
          <div
            class="px-4 py-3 border-b border-gray-100 dark:border-neutral-700 print:border-gray-300"
          >
            <h3
              class="font-semibold text-sm text-gray-700 dark:text-gray-300 print:text-gray-900"
            >
              Resumo financeiro
            </h3>
          </div>
          <table class="w-full text-sm">
            <tbody>
              <tr
                class="border-b border-gray-50 dark:border-neutral-700 print:border-gray-200"
              >
                <td
                  class="px-4 py-3 text-gray-600 dark:text-gray-400 print:text-gray-600"
                >
                  Subtotal serviços/produtos
                </td>
                <td
                  class="px-4 py-3 text-right font-medium text-gray-900 dark:text-white print:text-gray-900"
                >
                  {{ fmtMoeda(totalItens) }}
                </td>
              </tr>
              <tr
                v-if="taxaBusca > 0"
                class="border-b border-gray-50 dark:border-neutral-700 print:border-gray-200"
              >
                <td
                  class="px-4 py-3 text-gray-600 dark:text-gray-400 print:text-gray-600"
                >
                  🚗 Taxa de busca
                </td>
                <td
                  class="px-4 py-3 text-right font-medium text-gray-900 dark:text-white print:text-gray-900"
                >
                  {{ fmtMoeda(taxaBusca) }}
                </td>
              </tr>
              <tr
                v-if="
                  (os.status === 'Aberta' && desconto > 0) ||
                  (os.status !== 'Aberta' && Number(os.desconto) > 0)
                "
                class="border-b border-gray-50 dark:border-neutral-700 print:border-gray-200"
              >
                <td class="px-4 py-3 text-red-500">Desconto</td>
                <td class="px-4 py-3 text-right font-medium text-red-500">
                  -
                  {{
                    fmtMoeda(
                      os.status === "Aberta" ? desconto : Number(os.desconto),
                    )
                  }}
                </td>
              </tr>
              <tr class="bg-gray-50 dark:bg-neutral-700/40 print:bg-gray-100">
                <td
                  class="px-4 py-3 font-bold text-gray-900 dark:text-white print:text-gray-900"
                >
                  Total
                </td>
                <td
                  class="px-4 py-3 text-right font-bold text-lg text-gray-900 dark:text-white print:text-gray-900"
                >
                  {{
                    fmtMoeda(
                      os.status === "Aberta"
                        ? totalFinal
                        : totalItens + taxaBusca - Number(os.desconto ?? 0),
                    )
                  }}
                </td>
              </tr>
              <tr
                v-if="os.formaPagamento && os.status !== 'Aberta'"
                class="border-t border-gray-100 dark:border-neutral-700 print:border-gray-200"
              >
                <td
                  class="px-4 py-3 text-gray-500 dark:text-gray-400 print:text-gray-600"
                >
                  Forma de pagamento
                </td>
                <td
                  class="px-4 py-3 text-right font-medium text-gray-900 dark:text-white print:text-gray-900"
                >
                  {{ os.formaPagamento }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Observações (impressão) -->
        <div
          v-if="os.observacoes && os.status !== 'Aberta'"
          class="hidden print:block border-t border-gray-300 pt-3 mb-4"
        >
          <p class="text-xs font-semibold text-gray-600 uppercase mb-1">
            Observações
          </p>
          <p class="text-sm text-gray-700">{{ os.observacoes }}</p>
        </div>

        <!-- Assinatura (apenas impressão) -->
        <div
          class="hidden print:flex justify-between mt-12 pt-4 border-t border-gray-300"
        >
          <div class="text-center w-48">
            <div class="border-t border-gray-600 pt-1 text-xs text-gray-600">
              Responsável pelo atendimento
            </div>
          </div>
          <div class="text-center w-48">
            <div class="border-t border-gray-600 pt-1 text-xs text-gray-600">
              Assinatura do cliente
            </div>
          </div>
        </div>
      </div>
      <!-- fim print-container -->

      <!-- ── Adicionar produto (apenas se OS aberta) ─────────────────── -->
      <div
        v-if="os.status === 'Aberta'"
        class="print:hidden mt-6 bg-white dark:bg-neutral-800 rounded-xl border border-gray-200 dark:border-neutral-700 p-4"
      >
        <h3 class="font-semibold text-sm text-gray-700 dark:text-gray-300 mb-4">
          Adicionar produto utilizado
        </h3>
        <div class="flex flex-col sm:flex-row gap-3">
          <div class="relative flex-1">
            <UInput
              v-model="buscaProduto"
              placeholder="Buscar produto por nome..."
              icon="i-lucide-search"
              class="w-full"
            />
            <!-- Dropdown de resultados -->
            <div
              v-if="produtosBusca.length"
              class="absolute z-50 top-full mt-1 left-0 right-0 bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-600 rounded-lg shadow-lg overflow-hidden"
            >
              <button
                v-for="p in produtosBusca"
                :key="p.id"
                class="w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 dark:hover:bg-neutral-700 flex justify-between items-center"
                @click="selecionarProduto(p)"
              >
                <span class="text-gray-900 dark:text-white">{{ p.nome }}</span>
                <span class="text-gray-500 text-xs">{{
                  fmtMoeda(p.precoVenda ?? p.precoCompra)
                }}</span>
              </button>
            </div>
          </div>
          <div class="flex items-center gap-2">
            <UInput
              v-model="qtdProduto"
              type="number"
              min="1"
              class="w-20"
              placeholder="Qtd"
            />
            <UButton
              icon="i-lucide-plus"
              label="Adicionar"
              :disabled="!produtoSelecionado"
              :loading="salvando"
              @click="adicionarProduto"
            />
          </div>
        </div>
      </div>

      <!-- ── Finalizar OS ────────────────────────────────────────────── -->
      <div
        v-if="os.status === 'Aberta'"
        class="print:hidden mt-6 bg-white dark:bg-neutral-800 rounded-xl border border-gray-200 dark:border-neutral-700 p-4"
      >
        <h3 class="font-semibold text-sm text-gray-700 dark:text-gray-300 mb-4">
          Finalizar atendimento
        </h3>
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
          <div>
            <label
              for="forma-pagamento"
              class="block text-xs text-gray-500 dark:text-gray-400 mb-1"
              >Forma de pagamento</label
            >
            <USelect
              id="forma-pagamento"
              v-model="formaPagamento"
              :items="opcoesForma"
              value-key="value"
              label-key="label"
            />
          </div>
          <div>
            <label
              for="desconto"
              class="block text-xs text-gray-500 dark:text-gray-400 mb-1"
              >Desconto (R$)</label
            >
            <UInput
              id="desconto"
              v-model="desconto"
              type="number"
              min="0"
              step="0.01"
              placeholder="0,00"
            />
          </div>
          <div>
            <label
              for="observacoes"
              class="block text-xs text-gray-500 dark:text-gray-400 mb-1"
              >Observações</label
            >
            <UInput
              id="observacoes"
              v-model="observacoes"
              placeholder="Opcional..."
            />
          </div>
        </div>

        <div class="flex items-center justify-between">
          <p class="text-sm text-gray-500 dark:text-gray-400">
            Total a receber:
            <span class="font-bold text-gray-900 dark:text-white text-base">{{
              fmtMoeda(totalFinal)
            }}</span>
          </p>
          <UButton
            icon="i-lucide-check-check"
            label="Finalizar OS"
            color="success"
            :loading="finalizando"
            @click="confirmarFinalizar = true"
          />
        </div>
      </div>

      <!-- ── Modal confirmação finalizar ─────────────────────────────── -->
      <UModal v-model:open="confirmarFinalizar">
        <template #content>
          <div class="p-6">
            <h3
              class="text-lg font-semibold text-gray-900 dark:text-white mb-2"
            >
              Finalizar OS #{{ os.numero }}?
            </h3>
            <p class="text-sm text-gray-500 dark:text-gray-400 mb-4">
              Isso irá concluir o agendamento, registrar a receita de
              <strong>{{ fmtMoeda(totalFinal) }}</strong> e descontar os
              produtos do estoque.
            </p>
            <div class="flex justify-end gap-3">
              <UButton
                variant="outline"
                color="neutral"
                label="Cancelar"
                @click="confirmarFinalizar = false"
              />
              <UButton
                color="success"
                label="Confirmar"
                :loading="finalizando"
                @click="executarFinalizar"
              />
            </div>
          </div>
        </template>
      </UModal>
    </template>
  </div>
</template>

<style>
@media print {
  /* Oculta layout do sistema na impressão */
  nav,
  aside,
  header,
  footer,
  .print\:hidden {
    display: none !important;
  }

  body {
    background: white !important;
    color: black !important;
  }

  .print-container {
    padding: 0 !important;
    margin: 0 !important;
  }

  * {
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }
}
</style>
