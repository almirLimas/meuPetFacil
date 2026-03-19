<script setup lang="ts">
import type {
  Produto,
  CategoriaEstoque,
  TipoMovimentacao,
} from "~/types/estoque";

const produtos = useMockProdutos();
const movimentacoes = useMockMovimentacoes();
const toast = useToast();

const today = new Date().toISOString().slice(0, 10);

// -- Filtros ------------------------------------------------------------------
const busca = ref("");
const filtroCategoria = ref<CategoriaEstoque | "todas">("todas");
const filtroAlerta = ref(false);

const categorias: { label: string; value: CategoriaEstoque | "todas" }[] = [
  { label: "Todas", value: "todas" },
  { label: "Ração", value: "racao" },
  { label: "Higiene", value: "higiene" },
  { label: "Medicamento", value: "medicamento" },
  { label: "Acessório", value: "acessorio" },
  { label: "Outros", value: "outros" },
];

const categoriaConfig: Record<
  CategoriaEstoque,
  { label: string; bg: string; text: string; icon: string }
> = {
  racao: {
    label: "Ração",
    bg: "bg-amber-100 dark:bg-amber-900/40",
    text: "text-amber-600 dark:text-amber-400",
    icon: "i-lucide-beef",
  },
  higiene: {
    label: "Higiene",
    bg: "bg-blue-100 dark:bg-blue-900/40",
    text: "text-blue-600 dark:text-blue-400",
    icon: "i-lucide-droplets",
  },
  medicamento: {
    label: "Medicamento",
    bg: "bg-red-100 dark:bg-red-900/40",
    text: "text-red-600 dark:text-red-400",
    icon: "i-lucide-pill",
  },
  acessorio: {
    label: "Acessório",
    bg: "bg-purple-100 dark:bg-purple-900/40",
    text: "text-purple-600 dark:text-purple-400",
    icon: "i-lucide-toy-brick",
  },
  outros: {
    label: "Outros",
    bg: "bg-gray-100 dark:bg-neutral-700",
    text: "text-gray-500 dark:text-gray-400",
    icon: "i-lucide-package",
  },
};

// -- Computed -----------------------------------------------------------------
const emAlerta = (p: Produto) => p.quantidadeAtual <= p.quantidadeMinima;

const produtosFiltrados = computed(() =>
  produtos.value.filter((p) => {
    const matchBusca =
      !busca.value ||
      p.nome.toLowerCase().includes(busca.value.toLowerCase()) ||
      p.descricao?.toLowerCase().includes(busca.value.toLowerCase());
    const matchCategoria =
      filtroCategoria.value === "todas" ||
      p.categoria === filtroCategoria.value;
    const matchAlerta = !filtroAlerta.value || emAlerta(p);
    return matchBusca && matchCategoria && matchAlerta && p.ativo;
  }),
);

const resumo = computed(() => ({
  total: produtos.value.filter((p) => p.ativo).length,
  emAlerta: produtos.value.filter((p) => p.ativo && emAlerta(p)).length,
  semEstoque: produtos.value.filter((p) => p.ativo && p.quantidadeAtual === 0)
    .length,
  valorTotal: produtos.value
    .filter((p) => p.ativo)
    .reduce((acc, p) => acc + p.quantidadeAtual * p.precoCusto, 0),
}));

const formatPreco = (v: number) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

// -- Modal produto -----------------------------------------------------------
const isModalProduto = ref(false);
const editandoProduto = ref<Produto | null>(null);

const CATEGORIAS_SELECT: { label: string; value: CategoriaEstoque }[] = [
  { label: "Ração", value: "racao" },
  { label: "Higiene", value: "higiene" },
  { label: "Medicamento", value: "medicamento" },
  { label: "Acessório", value: "acessorio" },
  { label: "Outros", value: "outros" },
];

const UNIDADES = ["un.", "kg", "g", "ml", "L", "cx", "pct"];

const formProduto = reactive({
  nome: "",
  categoria: "higiene" as CategoriaEstoque,
  unidade: "un.",
  quantidadeAtual: 0,
  quantidadeMinima: 5,
  precoCusto: 0,
  precoVenda: 0,
  descricao: "",
});

const abrirNovoProduto = () => {
  editandoProduto.value = null;
  Object.assign(formProduto, {
    nome: "",
    categoria: "higiene",
    unidade: "un.",
    quantidadeAtual: 0,
    quantidadeMinima: 5,
    precoCusto: 0,
    precoVenda: 0,
    descricao: "",
  });
  isModalProduto.value = true;
};

const abrirEditarProduto = (p: Produto) => {
  editandoProduto.value = p;
  Object.assign(formProduto, {
    nome: p.nome,
    categoria: p.categoria,
    unidade: p.unidade,
    quantidadeAtual: p.quantidadeAtual,
    quantidadeMinima: p.quantidadeMinima,
    precoCusto: p.precoCusto,
    precoVenda: p.precoVenda ?? 0,
    descricao: p.descricao ?? "",
  });
  isModalProduto.value = true;
};

const salvarProduto = () => {
  if (!formProduto.nome || !formProduto.precoCusto) {
    toast.add({
      title: "Preencha nome e preço de custo",
      color: "error",
    });
    return;
  }

  if (editandoProduto.value) {
    const p = produtos.value.find((p) => p.id === editandoProduto.value!.id);
    if (p) {
      Object.assign(p, {
        nome: formProduto.nome,
        categoria: formProduto.categoria,
        unidade: formProduto.unidade,
        quantidadeMinima: formProduto.quantidadeMinima,
        precoCusto: formProduto.precoCusto,
        precoVenda: formProduto.precoVenda || undefined,
        descricao: formProduto.descricao || undefined,
      });
    }
    toast.add({ title: "Produto atualizado!", color: "success" });
  } else {
    produtos.value.push({
      id: Date.now().toString(),
      nome: formProduto.nome,
      categoria: formProduto.categoria,
      unidade: formProduto.unidade,
      quantidadeAtual: formProduto.quantidadeAtual,
      quantidadeMinima: formProduto.quantidadeMinima,
      precoCusto: formProduto.precoCusto,
      precoVenda: formProduto.precoVenda || undefined,
      descricao: formProduto.descricao || undefined,
      ativo: true,
    });
    toast.add({ title: "Produto cadastrado!", color: "success" });
  }

  isModalProduto.value = false;
};

const excluirProduto = (id: string) => {
  const p = produtos.value.find((p) => p.id === id);
  if (p) {
    p.ativo = false;
    toast.add({ title: "Produto removido do estoque", color: "neutral" });
  }
};

// -- Modal movimentação ------------------------------------------------------
const isModalMovimentacao = ref(false);
const produtoSelecionado = ref<Produto | null>(null);

const formMov = reactive({
  tipo: "entrada" as TipoMovimentacao,
  quantidade: 1,
  motivo: "",
});

const abrirMovimentacao = (p: Produto, tipo: TipoMovimentacao) => {
  produtoSelecionado.value = p;
  formMov.tipo = tipo;
  formMov.quantidade = 1;
  formMov.motivo = "";
  isModalMovimentacao.value = true;
};

const salvarMovimentacao = () => {
  const p = produtos.value.find((p) => p.id === produtoSelecionado.value?.id);
  if (!p) return;

  if (formMov.quantidade <= 0) {
    toast.add({ title: "Quantidade deve ser maior que zero", color: "error" });
    return;
  }

  if (formMov.tipo === "saida" && formMov.quantidade > p.quantidadeAtual) {
    toast.add({
      title: "Quantidade insuficiente em estoque",
      color: "error",
    });
    return;
  }

  if (formMov.tipo === "entrada") {
    p.quantidadeAtual += formMov.quantidade;
  } else {
    p.quantidadeAtual -= formMov.quantidade;
  }

  movimentacoes.value.push({
    id: Date.now().toString(),
    produtoId: p.id,
    tipo: formMov.tipo,
    quantidade: formMov.quantidade,
    data: today,
    motivo: formMov.motivo || undefined,
  });

  toast.add({
    title:
      formMov.tipo === "entrada"
        ? `+${formMov.quantidade} ${p.unidade} adicionado(s)`
        : `-${formMov.quantidade} ${p.unidade} removido(s)`,
    color: "success",
  });

  isModalMovimentacao.value = false;
};

// -- Histórico de movimentações ----------------------------------------------
const isModalHistorico = ref(false);
const produtoHistorico = ref<Produto | null>(null);

const historicoFiltrado = computed(() => {
  if (!produtoHistorico.value) return [];
  return movimentacoes.value
    .filter((m) => m.produtoId === produtoHistorico.value!.id)
    .sort((a, b) => b.data.localeCompare(a.data));
});

const abrirHistorico = (p: Produto) => {
  produtoHistorico.value = p;
  isModalHistorico.value = true;
};
</script>

<template>
  <div class="flex flex-col gap-4">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-xl font-bold text-gray-800 dark:text-gray-100">
          Estoque
        </h1>
        <p class="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
          Controle de produtos e movimentações
        </p>
      </div>
      <UButton
        icon="i-lucide-plus"
        label="Novo Produto"
        color="secondary"
        @click="abrirNovoProduto"
      />
    </div>

    <!-- Cards de resumo -->
    <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
      <div
        v-for="card in [
          {
            label: 'Total de Produtos',
            value: resumo.total,
            icon: 'i-lucide-package',
            bg: '#E0F0FF',
            color: '#4AADE8',
          },
          {
            label: 'Em Alerta',
            value: resumo.emAlerta,
            icon: 'i-lucide-alert-triangle',
            bg: '#FFF3E0',
            color: '#F5A523',
          },
          {
            label: 'Sem Estoque',
            value: resumo.semEstoque,
            icon: 'i-lucide-package-x',
            bg: '#FFE0E0',
            color: '#E85A5A',
          },
          {
            label: 'Valor em Estoque',
            value: formatPreco(resumo.valorTotal),
            icon: 'i-lucide-wallet',
            bg: '#E0FBF0',
            color: '#5CC86B',
          },
        ]"
        :key="card.label"
        class="bg-white dark:bg-neutral-800 rounded-2xl p-4 shadow-sm flex items-center justify-between gap-3"
      >
        <div>
          <p class="text-xs text-gray-500 dark:text-gray-400">
            {{ card.label }}
          </p>
          <p
            class="text-2xl font-extrabold text-gray-800 dark:text-gray-100 mt-1 leading-none"
          >
            {{ card.value }}
          </p>
        </div>
        <div
          class="w-12 h-12 rounded-full flex items-center justify-center shrink-0"
          :style="{ backgroundColor: card.bg }"
        >
          <UIcon
            :name="card.icon"
            class="size-6"
            :style="{ color: card.color }"
          />
        </div>
      </div>
    </div>

    <!-- Filtros + tabela -->
    <div
      class="bg-white dark:bg-neutral-800 rounded-2xl shadow-sm overflow-hidden"
    >
      <!-- Barra de filtros -->
      <div
        class="flex flex-wrap items-center gap-3 px-4 py-3 border-b border-gray-100 dark:border-neutral-700"
      >
        <UInput
          v-model="busca"
          placeholder="Buscar produto..."
          leading-icon="i-lucide-search"
          size="sm"
          class="max-w-xs"
        />
        <div class="flex gap-1 flex-wrap">
          <button
            v-for="cat in categorias"
            :key="cat.value"
            class="px-3 py-1 rounded-full text-xs font-semibold transition-colors"
            :class="
              filtroCategoria === cat.value
                ? 'bg-[#4AADE8] text-white'
                : 'bg-gray-100 dark:bg-neutral-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-neutral-600'
            "
            @click="filtroCategoria = cat.value"
          >
            {{ cat.label }}
          </button>
        </div>
        <button
          class="ml-auto flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-colors"
          :class="
            filtroAlerta
              ? 'bg-amber-500 text-white'
              : 'bg-gray-100 dark:bg-neutral-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-neutral-600'
          "
          @click="filtroAlerta = !filtroAlerta"
        >
          <UIcon name="i-lucide-alert-triangle" class="size-3" />
          Apenas alertas
        </button>
      </div>

      <!-- Empty state -->
      <div
        v-if="produtosFiltrados.length === 0"
        class="flex flex-col items-center justify-center py-16 gap-2 text-gray-400"
      >
        <UIcon name="i-lucide-package-x" class="text-5xl" />
        <p class="text-sm font-medium">Nenhum produto encontrado</p>
      </div>

      <!-- Tabela -->
      <table v-else class="w-full text-sm">
        <thead>
          <tr class="border-b border-gray-100 dark:border-neutral-700">
            <th
              class="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide"
            >
              Produto
            </th>
            <th
              class="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide hidden sm:table-cell"
            >
              Categoria
            </th>
            <th
              class="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide"
            >
              Qtd. Atual
            </th>
            <th
              class="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide hidden md:table-cell"
            >
              Qtd. Mínima
            </th>
            <th
              class="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide hidden md:table-cell"
            >
              Custo
            </th>
            <th
              class="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide hidden lg:table-cell"
            >
              Venda
            </th>
            <th class="px-4 py-3"></th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="p in produtosFiltrados"
            :key="p.id"
            class="border-b border-gray-50 dark:border-neutral-700 last:border-0 hover:bg-gray-50 dark:hover:bg-neutral-700/50 transition-colors"
          >
            <td class="px-4 py-3">
              <div class="flex items-center gap-2">
                <!-- Ícone da categoria -->
                <div
                  class="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                  :class="categoriaConfig[p.categoria].bg"
                >
                  <UIcon
                    :name="categoriaConfig[p.categoria].icon"
                    class="size-4"
                    :class="categoriaConfig[p.categoria].text"
                  />
                </div>
                <div>
                  <p class="font-semibold text-gray-800 dark:text-gray-100">
                    {{ p.nome }}
                  </p>
                  <p v-if="p.descricao" class="text-xs text-gray-400 mt-0.5">
                    {{ p.descricao }}
                  </p>
                </div>
              </div>
            </td>
            <td class="px-4 py-3 hidden sm:table-cell">
              <span
                class="text-xs font-semibold px-2.5 py-1 rounded-full"
                :class="[
                  categoriaConfig[p.categoria].bg,
                  categoriaConfig[p.categoria].text,
                ]"
              >
                {{ categoriaConfig[p.categoria].label }}
              </span>
            </td>
            <td class="px-4 py-3">
              <div class="flex items-center gap-1.5">
                <span
                  class="font-bold"
                  :class="
                    p.quantidadeAtual === 0
                      ? 'text-red-600 dark:text-red-400'
                      : emAlerta(p)
                        ? 'text-amber-600 dark:text-amber-400'
                        : 'text-gray-800 dark:text-gray-100'
                  "
                >
                  {{ p.quantidadeAtual }}
                </span>
                <span class="text-gray-400 text-xs">{{ p.unidade }}</span>
                <UIcon
                  v-if="emAlerta(p)"
                  name="i-lucide-alert-triangle"
                  class="size-3.5 text-amber-500"
                  title="Estoque abaixo do mínimo"
                />
              </div>
            </td>
            <td
              class="px-4 py-3 text-gray-500 dark:text-gray-400 hidden md:table-cell"
            >
              {{ p.quantidadeMinima }} {{ p.unidade }}
            </td>
            <td
              class="px-4 py-3 text-gray-700 dark:text-gray-300 hidden md:table-cell"
            >
              {{ formatPreco(p.precoCusto) }}
            </td>
            <td
              class="px-4 py-3 text-gray-700 dark:text-gray-300 hidden lg:table-cell"
            >
              {{ p.precoVenda ? formatPreco(p.precoVenda) : "—" }}
            </td>
            <td class="px-4 py-3">
              <div class="flex items-center gap-1 justify-end">
                <UButton
                  icon="i-lucide-arrow-down-to-line"
                  color="neutral"
                  variant="ghost"
                  size="xs"
                  title="Registrar entrada"
                  @click="abrirMovimentacao(p, 'entrada')"
                />
                <UButton
                  icon="i-lucide-arrow-up-from-line"
                  color="neutral"
                  variant="ghost"
                  size="xs"
                  title="Registrar saída"
                  @click="abrirMovimentacao(p, 'saida')"
                />
                <UButton
                  icon="i-lucide-history"
                  color="neutral"
                  variant="ghost"
                  size="xs"
                  title="Histórico"
                  @click="abrirHistorico(p)"
                />
                <UButton
                  icon="i-lucide-pencil"
                  color="neutral"
                  variant="ghost"
                  size="xs"
                  title="Editar"
                  @click="abrirEditarProduto(p)"
                />
                <UButton
                  icon="i-lucide-trash-2"
                  color="neutral"
                  variant="ghost"
                  size="xs"
                  title="Remover"
                  @click="excluirProduto(p.id)"
                />
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal: Cadastro/Edição de produto -->
    <UModal v-model:open="isModalProduto">
      <template #content>
        <UCard class="ring-0">
          <template #header>
            <div class="flex items-center justify-between">
              <h3 class="font-semibold text-gray-800 dark:text-gray-100">
                {{ editandoProduto ? "Editar Produto" : "Novo Produto" }}
              </h3>
              <UButton
                icon="i-lucide-x"
                color="neutral"
                variant="ghost"
                size="xs"
                @click="isModalProduto = false"
              />
            </div>
          </template>

          <div class="flex flex-col gap-3">
            <UFormField label="Nome do produto *">
              <UInput
                v-model="formProduto.nome"
                placeholder="Ex: Shampoo Neutro"
                class="w-full"
              />
            </UFormField>

            <div class="grid grid-cols-2 gap-3">
              <UFormField label="Categoria *">
                <USelect
                  v-model="formProduto.categoria"
                  :items="CATEGORIAS_SELECT"
                  value-key="value"
                  label-key="label"
                  class="w-full"
                />
              </UFormField>
              <UFormField label="Unidade *">
                <USelect
                  v-model="formProduto.unidade"
                  :items="UNIDADES"
                  class="w-full"
                />
              </UFormField>
            </div>

            <div class="grid grid-cols-2 gap-3">
              <UFormField
                :label="editandoProduto ? 'Qtd. Mínima' : 'Qtd. Inicial'"
              >
                <UInput
                  v-model.number="formProduto.quantidadeAtual"
                  type="number"
                  min="0"
                  class="w-full"
                  :disabled="!!editandoProduto"
                />
              </UFormField>
              <UFormField label="Qtd. Mínima (alerta)">
                <UInput
                  v-model.number="formProduto.quantidadeMinima"
                  type="number"
                  min="0"
                  class="w-full"
                />
              </UFormField>
            </div>

            <div class="grid grid-cols-2 gap-3">
              <UFormField label="Preço de custo (R$) *">
                <UInput
                  v-model.number="formProduto.precoCusto"
                  type="number"
                  min="0"
                  step="0.01"
                  class="w-full"
                />
              </UFormField>
              <UFormField label="Preço de venda (R$)">
                <UInput
                  v-model.number="formProduto.precoVenda"
                  type="number"
                  min="0"
                  step="0.01"
                  class="w-full"
                />
              </UFormField>
            </div>

            <UFormField label="Descrição">
              <UTextarea
                v-model="formProduto.descricao"
                placeholder="Descrição opcional..."
                :rows="2"
                class="w-full"
              />
            </UFormField>
          </div>

          <template #footer>
            <div class="flex justify-end gap-2">
              <UButton
                color="neutral"
                variant="ghost"
                @click="isModalProduto = false"
                >Cancelar</UButton
              >
              <UButton color="secondary" @click="salvarProduto">
                {{
                  editandoProduto ? "Salvar alterações" : "Cadastrar produto"
                }}
              </UButton>
            </div>
          </template>
        </UCard>
      </template>
    </UModal>

    <!-- Modal: Movimentação (entrada/saída) -->
    <UModal v-model:open="isModalMovimentacao">
      <template #content>
        <UCard class="ring-0">
          <template #header>
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <div
                  class="w-7 h-7 rounded-full flex items-center justify-center"
                  :class="
                    formMov.tipo === 'entrada'
                      ? 'bg-green-100 dark:bg-green-900/40'
                      : 'bg-red-100 dark:bg-red-900/40'
                  "
                >
                  <UIcon
                    :name="
                      formMov.tipo === 'entrada'
                        ? 'i-lucide-arrow-down-to-line'
                        : 'i-lucide-arrow-up-from-line'
                    "
                    class="size-3.5"
                    :class="
                      formMov.tipo === 'entrada'
                        ? 'text-green-600 dark:text-green-400'
                        : 'text-red-600 dark:text-red-400'
                    "
                  />
                </div>
                <h3 class="font-semibold text-gray-800 dark:text-gray-100">
                  {{
                    formMov.tipo === "entrada"
                      ? "Registrar Entrada"
                      : "Registrar Saída"
                  }}
                </h3>
              </div>
              <UButton
                icon="i-lucide-x"
                color="neutral"
                variant="ghost"
                size="xs"
                @click="isModalMovimentacao = false"
              />
            </div>
          </template>

          <div class="flex flex-col gap-3">
            <div class="bg-gray-50 dark:bg-neutral-700 rounded-xl px-4 py-3">
              <p class="text-xs text-gray-500 dark:text-gray-400">Produto</p>
              <p class="font-semibold text-gray-800 dark:text-gray-100 mt-0.5">
                {{ produtoSelecionado?.nome }}
              </p>
              <p class="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                Estoque atual:
                <span class="font-bold"
                  >{{ produtoSelecionado?.quantidadeAtual }}
                  {{ produtoSelecionado?.unidade }}</span
                >
              </p>
            </div>

            <UFormField label="Quantidade *">
              <UInput
                v-model.number="formMov.quantidade"
                type="number"
                min="1"
                class="w-full"
              />
            </UFormField>

            <UFormField label="Motivo">
              <UInput
                v-model="formMov.motivo"
                :placeholder="
                  formMov.tipo === 'entrada'
                    ? 'Ex: Compra fornecedor'
                    : 'Ex: Uso em atendimento'
                "
                class="w-full"
              />
            </UFormField>
          </div>

          <template #footer>
            <div class="flex justify-end gap-2">
              <UButton
                color="neutral"
                variant="ghost"
                @click="isModalMovimentacao = false"
                >Cancelar</UButton
              >
              <UButton
                :color="formMov.tipo === 'entrada' ? 'success' : 'error'"
                @click="salvarMovimentacao"
              >
                {{
                  formMov.tipo === "entrada"
                    ? "Confirmar Entrada"
                    : "Confirmar Saída"
                }}
              </UButton>
            </div>
          </template>
        </UCard>
      </template>
    </UModal>

    <!-- Modal: Histórico de movimentações -->
    <UModal v-model:open="isModalHistorico">
      <template #content>
        <UCard class="ring-0">
          <template #header>
            <div class="flex items-center justify-between">
              <h3 class="font-semibold text-gray-800 dark:text-gray-100">
                Histórico — {{ produtoHistorico?.nome }}
              </h3>
              <UButton
                icon="i-lucide-x"
                color="neutral"
                variant="ghost"
                size="xs"
                @click="isModalHistorico = false"
              />
            </div>
          </template>

          <div
            v-if="historicoFiltrado.length === 0"
            class="py-8 text-center text-gray-400 text-sm"
          >
            Nenhuma movimentação registrada
          </div>

          <div
            v-else
            class="flex flex-col divide-y divide-gray-100 dark:divide-neutral-700"
          >
            <div
              v-for="m in historicoFiltrado"
              :key="m.id"
              class="flex items-center gap-3 py-3"
            >
              <div
                class="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                :class="
                  m.tipo === 'entrada'
                    ? 'bg-green-100 dark:bg-green-900/40'
                    : 'bg-red-100 dark:bg-red-900/40'
                "
              >
                <UIcon
                  :name="
                    m.tipo === 'entrada'
                      ? 'i-lucide-arrow-down-to-line'
                      : 'i-lucide-arrow-up-from-line'
                  "
                  class="size-3.5"
                  :class="
                    m.tipo === 'entrada'
                      ? 'text-green-600 dark:text-green-400'
                      : 'text-red-600 dark:text-red-400'
                  "
                />
              </div>
              <div class="flex-1 min-w-0">
                <p
                  class="text-sm font-semibold text-gray-800 dark:text-gray-100 capitalize"
                >
                  {{ m.tipo }}
                </p>
                <p v-if="m.motivo" class="text-xs text-gray-400 mt-0.5">
                  {{ m.motivo }}
                </p>
              </div>
              <div class="text-right shrink-0">
                <p
                  class="font-bold text-sm"
                  :class="
                    m.tipo === 'entrada'
                      ? 'text-green-600 dark:text-green-400'
                      : 'text-red-600 dark:text-red-400'
                  "
                >
                  {{ m.tipo === "entrada" ? "+" : "-" }}{{ m.quantidade }}
                  {{ produtoHistorico?.unidade }}
                </p>
                <p class="text-xs text-gray-400 mt-0.5">
                  {{
                    new Date(m.data + "T00:00:00").toLocaleDateString("pt-BR")
                  }}
                </p>
              </div>
            </div>
          </div>

          <template #footer>
            <div class="flex justify-end">
              <UButton
                color="neutral"
                variant="ghost"
                @click="isModalHistorico = false"
                >Fechar</UButton
              >
            </div>
          </template>
        </UCard>
      </template>
    </UModal>
  </div>
</template>
