<script setup lang="ts">
useBreadcrumb().set([{ label: "Serviços" }]);

import { z } from "zod";
import type { Servico, CategoriaServico, PorteServico } from "~/types/servico";

const {
  servicos,
  loading,
  fetchAll,
  create,
  update,
  toggleAtivo: toggleAtivoApi,
  remove,
} = useServicos();
const toast = useToast();

onMounted(() => fetchAll());

// -- Filtros ------------------------------------------------------------------
const busca = ref("");
const filtroCategoria = ref<CategoriaServico | "todas">("todas");
const filtroAtivo = ref<"todos" | "ativo" | "inativo">("todos");

const categorias: { label: string; value: CategoriaServico | "todas" }[] = [
  { label: "Todas", value: "todas" },
  { label: "Banho", value: "Banho" },
  { label: "Tosa", value: "Tosa" },
  { label: "Consulta", value: "Consulta" },
  { label: "Vacina", value: "Vacina" },
  { label: "Internação", value: "Internacao" },
  { label: "Cirurgia", value: "Cirurgia" },
  { label: "Exame", value: "Exame" },
  { label: "Outro", value: "Outro" },
];

const servicosFiltrados = computed(() =>
  servicos.value.filter((s) => {
    const matchBusca =
      !busca.value ||
      s.nome.toLowerCase().includes(busca.value.toLowerCase()) ||
      s.descricao?.toLowerCase().includes(busca.value.toLowerCase());
    const matchCategoria =
      filtroCategoria.value === "todas" ||
      s.categoria === filtroCategoria.value;
    const matchAtivo =
      filtroAtivo.value === "todos" ||
      (filtroAtivo.value === "ativo" ? s.ativo : !s.ativo);
    return matchBusca && matchCategoria && matchAtivo;
  }),
);

// -- Resumo ------------------------------------------------------------------
const resumo = computed(() => ({
  total: servicos.value.length,
  ativos: servicos.value.filter((s) => s.ativo).length,
  inativos: servicos.value.filter((s) => !s.ativo).length,
  precoMedio:
    servicos.value.length > 0
      ? servicos.value.reduce((acc, s) => acc + Number(s.preco), 0) /
        servicos.value.length
      : 0,
}));

// -- Helpers -----------------------------------------------------------------
const categoriaConfig: Record<
  CategoriaServico,
  { label: string; bg: string; text: string }
> = {
  Banho: {
    label: "Banho",
    bg: "bg-blue-100 dark:bg-blue-900/40",
    text: "text-blue-600 dark:text-blue-400",
  },
  Tosa: {
    label: "Tosa",
    bg: "bg-pink-100 dark:bg-pink-900/40",
    text: "text-pink-600 dark:text-pink-400",
  },
  Consulta: {
    label: "Consulta",
    bg: "bg-green-100 dark:bg-green-900/40",
    text: "text-green-600 dark:text-green-400",
  },
  Vacina: {
    label: "Vacina",
    bg: "bg-teal-100 dark:bg-teal-900/40",
    text: "text-teal-600 dark:text-teal-400",
  },
  Internacao: {
    label: "Internação",
    bg: "bg-yellow-100 dark:bg-yellow-900/40",
    text: "text-yellow-600 dark:text-yellow-400",
  },
  Cirurgia: {
    label: "Cirurgia",
    bg: "bg-red-100 dark:bg-red-900/40",
    text: "text-red-600 dark:text-red-400",
  },
  Exame: {
    label: "Exame",
    bg: "bg-orange-100 dark:bg-orange-900/40",
    text: "text-orange-600 dark:text-orange-400",
  },
  Outro: {
    label: "Outro",
    bg: "bg-gray-100 dark:bg-neutral-700",
    text: "text-gray-500 dark:text-gray-400",
  },
};

const porteLabel: Record<PorteServico, string> = {
  Pequeno: "Pequeno",
  Medio: "Médio",
  Grande: "Grande",
  Todos: "Todos",
};

const formatDuracao = (min?: number) => {
  if (!min) return "-";
  if (min < 60) return `${min}min`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m > 0 ? `${h}h${m}min` : `${h}h`;
};

const formatPreco = (v: number) =>
  Number(v).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

// -- Ativar/Desativar --------------------------------------------------------
const toggleAtivo = async (s: Servico) => {
  const novoStatus = !s.ativo;
  await toggleAtivoApi(s.id, novoStatus);
  toast.add({
    title: novoStatus ? "Serviço ativado" : "Serviço desativado",
    color: novoStatus ? "success" : "neutral",
  });
};

// -- Modal -------------------------------------------------------------------
const isModalOpen = ref(false);
const editando = ref<Servico | null>(null);
const loadingSalvar = ref(false);

const PORTES: { label: string; value: PorteServico }[] = [
  { label: "Todos os portes", value: "Todos" },
  { label: "Pequeno", value: "Pequeno" },
  { label: "Médio", value: "Medio" },
  { label: "Grande", value: "Grande" },
];

const CATEGORIAS_SELECT: { label: string; value: CategoriaServico }[] = [
  { label: "Banho", value: "Banho" },
  { label: "Tosa", value: "Tosa" },
  { label: "Consulta", value: "Consulta" },
  { label: "Vacina", value: "Vacina" },
  { label: "Internação", value: "Internacao" },
  { label: "Cirurgia", value: "Cirurgia" },
  { label: "Exame", value: "Exame" },
  { label: "Outro", value: "Outro" },
];

const schemaServico = z.object({
  nome: z.string().min(1, "Nome é obrigatório"),
  preco: z
    .number({ error: "Preço é obrigatório" })
    .min(0.01, "Preço deve ser maior que zero"),
  duracaoMinutos: z
    .number({ error: "Duração é obrigatória" })
    .min(1, "Duração deve ser maior que zero"),
});
const formServicoRef = ref();

const form = reactive({
  nome: "",
  categoria: "Banho" as CategoriaServico,
  porte: "Todos" as PorteServico,
  duracaoMinutos: 60,
  preco: 0,
  descricao: "",
});

const abrirNovo = () => {
  editando.value = null;
  Object.assign(form, {
    nome: "",
    categoria: "Banho",
    porte: "Todos",
    duracaoMinutos: 60,
    preco: 0,
    descricao: "",
  });
  isModalOpen.value = true;
};

const abrirEditar = (s: Servico) => {
  editando.value = s;
  Object.assign(form, {
    nome: s.nome,
    categoria: s.categoria,
    porte: s.porte ?? "Todos",
    duracaoMinutos: s.duracaoMinutos ?? 60,
    preco: Number(s.preco),
    descricao: s.descricao ?? "",
  });
  isModalOpen.value = true;
};

const salvar = async () => {
  loadingSalvar.value = true;
  try {
    const payload = {
      nome: form.nome,
      categoria: form.categoria,
      porte: form.porte,
      duracaoMinutos: form.duracaoMinutos,
      preco: form.preco,
      descricao: form.descricao || undefined,
    };

    if (editando.value) {
      await update(editando.value.id, payload);
      toast.add({ title: "Serviço atualizado!", color: "success" });
    } else {
      await create(payload);
      toast.add({ title: "Serviço criado!", color: "success" });
    }

    isModalOpen.value = false;
  } catch {
    toast.add({ title: "Erro ao salvar serviço", color: "error" });
  } finally {
    loadingSalvar.value = false;
  }
};

const excluir = async (id: string) => {
  await remove(id);
  toast.add({ title: "Serviço removido", color: "neutral" });
};
</script>

<template>
  <div class="flex flex-col gap-4">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-xl font-bold text-gray-800 dark:text-gray-100">
          Serviços
        </h1>
        <p class="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
          Gerencie os serviços oferecidos pelo petshop
        </p>
      </div>
      <UButton
        icon="i-lucide-plus"
        label="Novo Serviço"
        color="secondary"
        @click="abrirNovo"
      />
    </div>

    <!-- Cards de resumo -->
    <div class="grid grid-cols-1 sm:grid-cols-4 gap-4">
      <div
        v-for="card in [
          {
            label: 'Total de Serviços',
            value: resumo.total,
            icon: 'i-lucide-briefcase',
            bg: '#E0F2FE',
            color: '#0EA5E9',
          },
          {
            label: 'Ativos',
            value: resumo.ativos,
            icon: 'i-lucide-check-circle',
            bg: '#D1FAE5',
            color: '#10B981',
          },
          {
            label: 'Inativos',
            value: resumo.inativos,
            icon: 'i-lucide-pause-circle',
            bg: '#F0F0F0',
            color: '#9ca3af',
          },
          {
            label: 'Preço Médio',
            value: formatPreco(resumo.precoMedio),
            icon: 'i-lucide-tag',
            bg: '#EDE9FE',
            color: '#8B5CF6',
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
          placeholder="Buscar serviço..."
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
        <div class="ml-auto flex gap-1">
          <button
            v-for="opt in [
              { label: 'Todos', value: 'todos' },
              { label: 'Ativos', value: 'ativo' },
              { label: 'Inativos', value: 'inativo' },
            ]"
            :key="opt.value"
            class="px-3 py-1 rounded-full text-xs font-semibold transition-colors"
            :class="
              filtroAtivo === opt.value
                ? 'bg-gray-800 dark:bg-gray-200 text-white dark:text-gray-900'
                : 'bg-gray-100 dark:bg-neutral-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-neutral-600'
            "
            @click="filtroAtivo = opt.value as typeof filtroAtivo"
          >
            {{ opt.label }}
          </button>
        </div>
      </div>

      <!-- Empty state -->
      <div
        v-if="servicosFiltrados.length === 0"
        class="flex flex-col items-center justify-center py-16 gap-2 text-gray-400"
      >
        <UIcon name="i-lucide-briefcase-x" class="text-5xl" />
        <p class="text-sm font-medium">Nenhum serviço encontrado</p>
      </div>

      <!-- Tabela -->
      <div v-else class="overflow-x-auto">
        <table class="min-w-full text-sm dark:text-gray-200">
          <thead>
            <tr class="border-b border-gray-100 dark:border-neutral-700">
              <th
                class="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide whitespace-nowrap"
              >
                Serviço
              </th>
              <th
                class="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide hidden sm:table-cell"
              >
                Categoria
              </th>
              <th
                class="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide hidden md:table-cell"
              >
                Porte
              </th>
              <th
                class="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide hidden md:table-cell"
              >
                Duração
              </th>
              <th
                class="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide"
              >
                Preço
              </th>
              <th
                class="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide hidden sm:table-cell"
              >
                Status
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
              v-for="s in servicosFiltrados"
              :key="s.id"
              class="border-b border-gray-50 dark:border-neutral-700 last:border-0 hover:bg-gray-50 dark:hover:bg-neutral-700/50 transition-colors"
              :class="{ 'opacity-50': !s.ativo }"
            >
              <td class="px-4 py-3">
                <p class="font-semibold text-gray-800 dark:text-gray-100">
                  {{ s.nome }}
                </p>
                <p v-if="s.descricao" class="text-xs text-gray-400 mt-0.5">
                  {{ s.descricao }}
                </p>
              </td>
              <td class="px-4 py-3 hidden sm:table-cell">
                <span
                  class="text-xs font-semibold px-2.5 py-1 rounded-full"
                  :class="[
                    categoriaConfig[s.categoria].bg,
                    categoriaConfig[s.categoria].text,
                  ]"
                >
                  {{ categoriaConfig[s.categoria].label }}
                </span>
              </td>
              <td
                class="px-4 py-3 text-gray-600 dark:text-gray-300 hidden md:table-cell"
              >
                {{ s.porte ? porteLabel[s.porte] : "-" }}
              </td>
              <td
                class="px-4 py-3 text-gray-600 dark:text-gray-300 hidden md:table-cell"
              >
                {{ formatDuracao(s.duracaoMinutos) }}
              </td>
              <td
                class="px-4 py-3 font-semibold text-gray-800 dark:text-gray-100"
              >
                {{ formatPreco(s.preco) }}
              </td>
              <td class="px-4 py-3 hidden sm:table-cell">
                <span
                  class="text-xs font-semibold px-2.5 py-1 rounded-full"
                  :class="
                    s.ativo
                      ? 'bg-green-100 dark:bg-green-900/40 text-green-600 dark:text-green-400'
                      : 'bg-gray-100 dark:bg-neutral-700 text-gray-500 dark:text-gray-400'
                  "
                >
                  {{ s.ativo ? "Ativo" : "Inativo" }}
                </span>
              </td>
              <td class="px-4 py-3">
                <div class="flex items-center gap-1 justify-end">
                  <UButton
                    :icon="s.ativo ? 'i-lucide-pause' : 'i-lucide-play'"
                    color="neutral"
                    variant="ghost"
                    size="xs"
                    :title="s.ativo ? 'Desativar' : 'Ativar'"
                    @click="toggleAtivo(s)"
                  />
                  <UButton
                    icon="i-lucide-pencil"
                    color="neutral"
                    variant="ghost"
                    size="xs"
                    title="Editar"
                    @click="abrirEditar(s)"
                  />
                  <UButton
                    icon="i-lucide-trash-2"
                    color="neutral"
                    variant="ghost"
                    size="xs"
                    title="Excluir"
                    @click="excluir(s.id)"
                  />
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    <UModal v-model:open="isModalOpen">
      <template #content>
        <UCard class="ring-0">
          <template #header>
            <div class="flex items-center justify-between">
              <h3 class="font-semibold text-gray-800 dark:text-gray-100">
                {{ editando ? "Editar Serviço" : "Novo Serviço" }}
              </h3>
              <UButton
                icon="i-lucide-x"
                color="neutral"
                variant="ghost"
                size="xs"
                @click="isModalOpen = false"
              />
            </div>
          </template>

          <UForm
            :schema="schemaServico"
            :state="form"
            ref="formServicoRef"
            class="flex flex-col gap-3"
            @submit="salvar"
          >
            <UFormField name="nome" label="Nome do serviço *">
              <UInput
                v-model="form.nome"
                placeholder="Ex: Banho e Tosa"
                class="w-full"
              />
            </UFormField>

            <div class="grid grid-cols-2 gap-3">
              <UFormField label="Categoria *">
                <USelect
                  v-model="form.categoria"
                  :items="CATEGORIAS_SELECT"
                  value-key="value"
                  label-key="label"
                  class="w-full"
                />
              </UFormField>
              <UFormField label="Porte *">
                <USelect
                  v-model="form.porte"
                  :items="PORTES"
                  value-key="value"
                  label-key="label"
                  class="w-full"
                />
              </UFormField>
            </div>

            <div class="grid grid-cols-2 gap-3">
              <UFormField name="duracaoMinutos" label="Duração (minutos) *">
                <UInput
                  v-model.number="form.duracaoMinutos"
                  type="number"
                  min="1"
                  placeholder="60"
                  class="w-full"
                />
              </UFormField>
              <UFormField name="preco" label="Preço (R$) *">
                <UInput
                  v-model.number="form.preco"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0,00"
                  class="w-full"
                />
              </UFormField>
            </div>

            <UFormField label="Descrição">
              <UTextarea
                v-model="form.descricao"
                placeholder="Descrição opcional do serviço..."
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
                @click="isModalOpen = false"
              >
                Cancelar
              </UButton>
              <UButton color="secondary" @click="formServicoRef?.submit()">
                {{ editando ? "Salvar alterações" : "Criar serviço" }}
              </UButton>
            </div>
          </template>
        </UCard>
      </template>
    </UModal>
  </div>
</template>
