<script setup lang="ts">
useBreadcrumb().set([{ label: "Estoque" }]);

import { z } from "zod";
import type {
  Produto,
  CategoriaEstoque,
  TipoMovimentacao,
} from "~/types/estoque";

const {
  produtos,
  movimentacoes,
  loading,
  fetchProdutos,
  fetchMovimentacoes,
  createProduto,
  updateProduto,
  removeProduto,
  createMovimentacao,
} = useEstoque();
const toast = useToast();

onMounted(() => fetchProdutos());

// -- Filtros ------------------------------------------------------------------
const busca = ref("");
const filtroCategoria = ref<CategoriaEstoque | "todas">("todas");
const filtroAlerta = ref(false);

const categorias: { label: string; value: CategoriaEstoque | "todas" }[] = [
  { label: "Todas", value: "todas" },
  { label: "Alimento", value: "Alimento" },
  { label: "Higiene", value: "Higiene" },
  { label: "Medicamento", value: "Medicamento" },
  { label: "Acessório", value: "Acessorio" },
  { label: "Vacina", value: "Vacina" },
  { label: "Outro", value: "Outro" },
];

const categoriaConfig: Record<
  CategoriaEstoque,
  { label: string; bg: string; text: string; icon: string }
> = {
  Alimento: {
    label: "Alimento",
    bg: "bg-amber-100 dark:bg-amber-900/40",
    text: "text-amber-600 dark:text-amber-400",
    icon: "i-lucide-beef",
  },
  Higiene: {
    label: "Higiene",
    bg: "bg-blue-100 dark:bg-blue-900/40",
    text: "text-blue-600 dark:text-blue-400",
    icon: "i-lucide-droplets",
  },
  Medicamento: {
    label: "Medicamento",
    bg: "bg-red-100 dark:bg-red-900/40",
    text: "text-red-600 dark:text-red-400",
    icon: "i-lucide-pill",
  },
  Acessorio: {
    label: "Acessório",
    bg: "bg-purple-100 dark:bg-purple-900/40",
    text: "text-purple-600 dark:text-purple-400",
    icon: "i-lucide-toy-brick",
  },
  Vacina: {
    label: "Vacina",
    bg: "bg-green-100 dark:bg-green-900/40",
    text: "text-green-600 dark:text-green-400",
    icon: "i-lucide-syringe",
  },
  Outro: {
    label: "Outro",
    bg: "bg-gray-100 dark:bg-neutral-700",
    text: "text-gray-500 dark:text-gray-400",
    icon: "i-lucide-package",
  },
};

// -- Computed -----------------------------------------------------------------
const emAlerta = (p: Produto) =>
  Number(p.quantidadeAtual) <= Number(p.estoqueMinimo);

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
    .reduce((acc, p) => acc + p.quantidadeAtual * Number(p.precoCompra), 0),
}));

const formatPreco = (v: number) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

// -- Modal produto -----------------------------------------------------------
const isModalProduto = ref(false);
const editandoProduto = ref<Produto | null>(null);
const savingProduto = ref(false);

const CATEGORIAS_SELECT: { label: string; value: CategoriaEstoque }[] = [
  { label: "Alimento", value: "Alimento" },
  { label: "Higiene", value: "Higiene" },
  { label: "Medicamento", value: "Medicamento" },
  { label: "Acessório", value: "Acessorio" },
  { label: "Vacina", value: "Vacina" },
  { label: "Outro", value: "Outro" },
];

const UNIDADES = ["un.", "kg", "g", "ml", "L", "cx", "pct"];

const schemaProduto = z.object({
  nome: z.string().min(1, "Nome é obrigatório"),
  precoCompra: z
    .number({ error: "Preço de compra é obrigatório" })
    .min(0.01, "Preço de compra deve ser maior que zero"),
});

const formProdutoRef = ref();

const formProduto = reactive({
  nome: "",
  categoria: "Higiene" as CategoriaEstoque,
  unidade: "un.",
  codigoBarras: "",
  marca: "",
  granel: false,
  unidadeBase: "g",
  quantidadeAtual: 0,
  estoqueMinimo: 5,
  precoCompra: 0,
  precoVenda: 0,
  descricao: "",
});

const abrirNovoProduto = () => {
  editandoProduto.value = null;
  Object.assign(formProduto, {
    nome: "",
    categoria: "Higiene",
    unidade: "un.",
    codigoBarras: "",
    marca: "",
    granel: false,
    unidadeBase: "g",
    quantidadeAtual: 0,
    estoqueMinimo: 5,
    precoCompra: 0,
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
    unidade: p.unidade ?? "un.",
    codigoBarras: p.codigoBarras ?? "",
    marca: p.marca ?? "",
    granel: p.granel ?? false,
    unidadeBase: p.unidadeBase ?? "g",
    quantidadeAtual: p.quantidadeAtual,
    estoqueMinimo: p.estoqueMinimo,
    precoCompra: Number(p.precoCompra),
    precoVenda: p.precoVenda ? Number(p.precoVenda) : 0,
    descricao: p.descricao ?? "",
  });
  isModalProduto.value = true;
};

const salvarProduto = async () => {
  savingProduto.value = true;
  try {
    const payload = {
      nome: formProduto.nome,
      categoria: formProduto.categoria,
      unidade: formProduto.unidade || undefined,
      codigoBarras: formProduto.codigoBarras || undefined,
      marca: formProduto.marca || undefined,
      granel: formProduto.granel,
      unidadeBase: formProduto.granel
        ? formProduto.unidadeBase || undefined
        : undefined,
      estoqueMinimo: formProduto.estoqueMinimo,
      precoCompra: formProduto.precoCompra,
      precoVenda: formProduto.precoVenda || undefined,
      descricao: formProduto.descricao || undefined,
    };

    if (editandoProduto.value) {
      await updateProduto(editandoProduto.value.id, payload);
      toast.add({ title: "Produto atualizado!", color: "success" });
    } else {
      await createProduto({
        ...payload,
        quantidadeAtual: formProduto.quantidadeAtual,
      });
      toast.add({ title: "Produto cadastrado!", color: "success" });
    }
    isModalProduto.value = false;
  } catch {
    toast.add({ title: "Erro ao salvar produto", color: "error" });
  } finally {
    savingProduto.value = false;
  }
};

const confirmandoExclusao = ref<string | null>(null);
const produtoParaExcluir = ref<Produto | null>(null);
const isModalExclusao = ref(false);

const abrirModalExclusao = (p: Produto) => {
  produtoParaExcluir.value = p;
  isModalExclusao.value = true;
};

const excluirProduto = async () => {
  if (!produtoParaExcluir.value) return;
  confirmandoExclusao.value = produtoParaExcluir.value.id;
  try {
    await removeProduto(produtoParaExcluir.value.id);
    toast.add({ title: "Produto removido do estoque", color: "neutral" });
    isModalExclusao.value = false;
    produtoParaExcluir.value = null;
  } catch {
    toast.add({ title: "Erro ao remover produto", color: "error" });
  } finally {
    confirmandoExclusao.value = null;
  }
};

// -- Modal movimentação ------------------------------------------------------
const isModalMovimentacao = ref(false);
const produtoSelecionado = ref<Produto | null>(null);
const savingMov = ref(false);

const formMov = reactive({
  tipo: "Entrada" as TipoMovimentacao,
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

const salvarMovimentacao = async () => {
  if (!produtoSelecionado.value) return;

  if (formMov.quantidade <= 0) {
    toast.add({ title: "Quantidade deve ser maior que zero", color: "error" });
    return;
  }

  if (
    formMov.tipo === "Saida" &&
    Number(formMov.quantidade) >
      Number(produtoSelecionado.value.quantidadeAtual)
  ) {
    toast.add({ title: "Quantidade insuficiente em estoque", color: "error" });
    return;
  }

  savingMov.value = true;
  try {
    await createMovimentacao({
      produtoId: produtoSelecionado.value.id,
      tipo: formMov.tipo,
      quantidade: Number(formMov.quantidade),
      motivo: formMov.motivo || undefined,
    });
    toast.add({
      title:
        formMov.tipo === "Entrada"
          ? `+${formMov.quantidade} adicionado(s)`
          : `-${formMov.quantidade} removido(s)`,
      color: "success",
    });
    isModalMovimentacao.value = false;
  } catch {
    toast.add({ title: "Erro ao registrar movimentação", color: "error" });
  } finally {
    savingMov.value = false;
  }
};

// -- Histórico de movimentações ----------------------------------------------
const isModalHistorico = ref(false);
const produtoHistorico = ref<Produto | null>(null);

const historicoFiltrado = computed(() => {
  if (!produtoHistorico.value) return [];
  return movimentacoes.value.filter(
    (m) => m.produtoId === produtoHistorico.value!.id,
  );
});

const abrirHistorico = async (p: Produto) => {
  produtoHistorico.value = p;
  isModalHistorico.value = true;
  await fetchMovimentacoes(p.id);
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
    <div class="grid grid-cols-1 sm:grid-cols-4 gap-4">
      <div
        v-for="card in [
          {
            label: 'Total de Produtos',
            value: resumo.total,
            icon: 'i-lucide-package',
            bg: '#E0F2FE',
            color: '#0EA5E9',
          },
          {
            label: 'Em Alerta',
            value: resumo.emAlerta,
            icon: 'i-lucide-alert-triangle',
            bg: '#FFF3E0',
            color: '#8B5CF6',
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
            bg: '#D1FAE5',
            color: '#10B981',
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
                ? 'bg-[#0EA5E9] text-white'
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
        v-if="loading"
        class="flex flex-col items-center justify-center py-16 gap-2 text-gray-400"
      >
        <UIcon name="i-lucide-loader-circle" class="text-5xl animate-spin" />
        <p class="text-sm font-medium">Carregando produtos...</p>
      </div>
      <div
        v-else-if="produtosFiltrados.length === 0"
        class="flex flex-col items-center justify-center py-16 gap-2 text-gray-400"
      >
        <UIcon name="i-lucide-package-x" class="text-5xl" />
        <p class="text-sm font-medium">Nenhum produto encontrado</p>
      </div>

      <!-- Tabela -->
      <div v-else class="overflow-x-auto">
        <table class="min-w-full text-sm dark:text-gray-200">
          <thead>
            <tr class="border-b border-gray-100 dark:border-neutral-700">
              <th
                class="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide whitespace-nowrap"
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
              <th
                class="px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide"
              >
                Ações
              </th>
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
                    <div class="flex items-center gap-1 mt-0.5">
                      <p v-if="p.descricao" class="text-xs text-gray-400">
                        {{ p.descricao }}
                      </p>
                      <span
                        v-if="p.granel"
                        class="inline-flex items-center gap-0.5 text-xs font-semibold px-1.5 py-0.5 rounded-full bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-400"
                      >
                        <UIcon name="i-lucide-scale" class="size-3" />
                        Granel ({{ p.unidadeBase }})
                      </span>
                    </div>
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
                      Number(p.quantidadeAtual) === 0
                        ? 'text-red-600 dark:text-red-400'
                        : emAlerta(p)
                          ? 'text-amber-600 dark:text-amber-400'
                          : 'text-gray-800 dark:text-gray-100'
                    "
                  >
                    {{ p.quantidadeAtual }}
                  </span>
                  <span class="text-gray-400 text-xs">{{
                    p.unidade || "un."
                  }}</span>
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
                {{ p.estoqueMinimo }} {{ p.unidade }}
              </td>
              <td
                class="px-4 py-3 text-gray-700 dark:text-gray-300 hidden md:table-cell"
              >
                {{ formatPreco(Number(p.precoCompra)) }}
              </td>
              <td
                class="px-4 py-3 text-gray-700 dark:text-gray-300 hidden lg:table-cell"
              >
                {{ p.precoVenda ? formatPreco(Number(p.precoVenda)) : "—" }}
              </td>
              <td class="px-4 py-3">
                <div class="flex items-center gap-1 justify-end">
                  <UButton
                    icon="i-lucide-arrow-down-to-line"
                    color="neutral"
                    variant="ghost"
                    size="xs"
                    title="Registrar entrada"
                    @click="abrirMovimentacao(p, 'Entrada')"
                  />
                  <UButton
                    icon="i-lucide-arrow-up-from-line"
                    color="neutral"
                    variant="ghost"
                    size="xs"
                    title="Registrar saída"
                    @click="abrirMovimentacao(p, 'Saida')"
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
                  <template v-if="confirmandoExclusao === p.id">
                    <span
                      class="text-xs text-red-500 font-semibold whitespace-nowrap"
                      >Removendo...</span
                    >
                  </template>
                  <UButton
                    v-else
                    icon="i-lucide-trash-2"
                    color="neutral"
                    variant="ghost"
                    size="xs"
                    title="Remover"
                    @click="abrirModalExclusao(p)"
                  />
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
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

          <UForm
            :schema="schemaProduto"
            :state="formProduto"
            ref="formProdutoRef"
            class="flex flex-col gap-3"
            @submit="salvarProduto"
          >
            <UFormField name="nome" label="Nome do produto *">
              <UInput
                v-model="formProduto.nome"
                placeholder="Ex: Shampoo Neutro"
                class="w-full"
              />
            </UFormField>

            <UFormField label="Código de Barras">
              <UInput
                v-model="formProduto.codigoBarras"
                placeholder="Aponte o leitor ou digite o código"
                icon="i-lucide-scan-barcode"
                class="w-full"
              />
            </UFormField>

            <UFormField label="Marca">
              <UInput
                v-model="formProduto.marca"
                placeholder="Ex: Petlab, Bravecto..."
                icon="i-lucide-tag"
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

            <!-- Granel -->
            <div
              class="rounded-xl border border-gray-200 dark:border-neutral-600 p-3 bg-gray-50 dark:bg-neutral-700/40"
            >
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <UIcon
                    name="i-lucide-scale"
                    class="size-4 text-gray-500 dark:text-gray-400"
                  />
                  <span
                    class="text-sm font-medium text-gray-700 dark:text-gray-300"
                    >Produto a granel</span
                  >
                </div>
                <USwitch v-model="formProduto.granel" />
              </div>
              <div v-if="formProduto.granel" class="mt-3">
                <UFormField label="Unidade base (para cálculo de quantidade)">
                  <USelect
                    v-model="formProduto.unidadeBase"
                    :items="['g', 'ml', 'kg', 'L']"
                    class="w-full"
                  />
                  <template #help>
                    <span class="text-[11px] text-gray-400">
                      O preço de venda será o valor por
                      {{ formProduto.unidadeBase }}. O cliente digita quantos
                      reais quer pagar e o sistema calcula a quantidade.
                    </span>
                  </template>
                </UFormField>
              </div>
            </div>

            <div class="grid grid-cols-2 gap-3">
              <UFormField>
                <template #label>
                  <span>{{
                    editandoProduto ? "Qtd. Atual" : "Qtd. Inicial"
                  }}</span>
                  <UTooltip
                    v-if="!editandoProduto"
                    text="Quantas unidades você já tem em mãos agora. Deixe 0 para dar entrada depois."
                    :delay-duration="100"
                  >
                    <UIcon
                      name="i-lucide-circle-help"
                      class="size-3.5 text-gray-400 cursor-pointer ml-1"
                    />
                  </UTooltip>
                </template>
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
                  v-model.number="formProduto.estoqueMinimo"
                  type="number"
                  min="0"
                  class="w-full"
                />
              </UFormField>
            </div>

            <div class="grid grid-cols-2 gap-3">
              <UFormField name="precoCompra" label="Preço de compra (R$) *">
                <UInput
                  v-model.number="formProduto.precoCompra"
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
          </UForm>

          <template #footer>
            <div class="flex justify-end gap-2">
              <UButton
                color="neutral"
                variant="ghost"
                @click="isModalProduto = false"
                >Cancelar</UButton
              >
              <UButton
                color="secondary"
                :loading="savingProduto"
                @click="formProdutoRef?.submit()"
              >
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
                    formMov.tipo === 'Entrada'
                      ? 'bg-green-100 dark:bg-green-900/40'
                      : 'bg-red-100 dark:bg-red-900/40'
                  "
                >
                  <UIcon
                    :name="
                      formMov.tipo === 'Entrada'
                        ? 'i-lucide-arrow-down-to-line'
                        : 'i-lucide-arrow-up-from-line'
                    "
                    class="size-3.5"
                    :class="
                      formMov.tipo === 'Entrada'
                        ? 'text-green-600 dark:text-green-400'
                        : 'text-red-600 dark:text-red-400'
                    "
                  />
                </div>
                <h3 class="font-semibold text-gray-800 dark:text-gray-100">
                  {{
                    formMov.tipo === "Entrada"
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

            <UFormField
              :label="`Quantidade * ${produtoSelecionado?.unidade ? '(' + produtoSelecionado.unidade + ')' : ''}`"
            >
              <UInput
                v-model.number="formMov.quantidade"
                type="number"
                :min="produtoSelecionado?.granel ? 0.001 : 1"
                :step="produtoSelecionado?.granel ? 0.001 : 1"
                class="w-full"
              />
            </UFormField>

            <UFormField label="Motivo">
              <UInput
                v-model="formMov.motivo"
                :placeholder="
                  formMov.tipo === 'Entrada'
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
                :color="formMov.tipo === 'Entrada' ? 'success' : 'error'"
                :loading="savingMov"
                @click="salvarMovimentacao"
              >
                {{
                  formMov.tipo === "Entrada"
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
                  m.tipo === 'Entrada'
                    ? 'bg-green-100 dark:bg-green-900/40'
                    : 'bg-red-100 dark:bg-red-900/40'
                "
              >
                <UIcon
                  :name="
                    m.tipo === 'Entrada'
                      ? 'i-lucide-arrow-down-to-line'
                      : 'i-lucide-arrow-up-from-line'
                  "
                  class="size-3.5"
                  :class="
                    m.tipo === 'Entrada'
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
                    m.tipo === 'Entrada'
                      ? 'text-green-600 dark:text-green-400'
                      : 'text-red-600 dark:text-red-400'
                  "
                >
                  {{ m.tipo === "Entrada" ? "+" : "-" }}{{ m.quantidade }}
                  {{ produtoHistorico?.unidade }}
                </p>
                <p class="text-xs text-gray-400 mt-0.5">
                  {{ new Date(m.createdAt).toLocaleDateString("pt-BR") }}
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

    <!-- Modal: Confirmar exclusão -->
    <UModal v-model:open="isModalExclusao" :ui="{ content: 'max-w-sm' }">
      <template #content>
        <UCard class="ring-0">
          <template #header>
            <div class="flex items-center gap-3">
              <div
                class="w-9 h-9 rounded-full bg-red-100 dark:bg-red-900/40 flex items-center justify-center shrink-0"
              >
                <UIcon
                  name="i-lucide-trash-2"
                  class="size-4 text-red-600 dark:text-red-400"
                />
              </div>
              <h3 class="font-semibold text-gray-800 dark:text-gray-100">
                Remover produto
              </h3>
            </div>
          </template>

          <p class="text-sm text-gray-600 dark:text-gray-300">
            Tem certeza que deseja remover
            <span class="font-semibold">{{ produtoParaExcluir?.nome }}</span>
            do estoque? Esta ação não pode ser desfeita.
          </p>

          <template #footer>
            <div class="flex justify-end gap-2">
              <UButton
                color="neutral"
                variant="ghost"
                :disabled="!!confirmandoExclusao"
                @click="isModalExclusao = false"
                >Cancelar</UButton
              >
              <UButton
                color="error"
                :loading="!!confirmandoExclusao"
                @click="excluirProduto"
                >Remover</UButton
              >
            </div>
          </template>
        </UCard>
      </template>
    </UModal>
  </div>
</template>
