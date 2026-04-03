<script setup lang="ts">
useBreadcrumb().set([{ label: "Financeiro" }]);

import type { CategoriaLancamento, TipoLancamento } from "~/types/lancamento";

const {
  lancamentos,
  resumo,
  loading,
  fetchLancamentos,
  fetchResumoMes,
  criar,
  remover,
} = useFinanceiro();

// ── Filtros ──────────────────────────────────────────────────────────────────
const hoje = new Date().toISOString().slice(0, 10);
const filtroData = ref(hoje);
const filtroTipo = ref<TipoLancamento | "">("");

const carregar = async () => {
  await Promise.all([
    fetchLancamentos({
      dataInicio: filtroData.value,
      dataFim: filtroData.value,
      tipo: filtroTipo.value || undefined,
    }),
    fetchResumoMes(),
  ]);
};

onMounted(carregar);
watch([filtroData, filtroTipo], carregar);

// ── Novo lançamento ──────────────────────────────────────────────────────────
const isModalOpen = ref(false);
const form = reactive({
  tipo: "Receita" as TipoLancamento,
  valor: "",
  descricao: "",
  categoria: "Outro" as CategoriaLancamento,
  data: hoje,
});

const categorias: CategoriaLancamento[] = [
  "Servico",
  "Produto",
  "Consulta",
  "Material",
  "Manutencao",
  "Outro",
];

const labelCategoria: Record<CategoriaLancamento, string> = {
  Servico: "Serviço",
  Produto: "Produto",
  Consulta: "Consulta",
  Material: "Material",
  Manutencao: "Manutenção",
  Outro: "Outro",
};

const salvando = ref(false);

const abrirModal = () => {
  Object.assign(form, {
    tipo: "Receita",
    valor: "",
    descricao: "",
    categoria: "Outro",
    data: hoje,
  });
  isModalOpen.value = true;
};

const toast = useToast();

const salvar = async () => {
  if (!form.descricao || !form.valor) {
    toast.add({ title: "Preencha descrição e valor", color: "error" });
    return;
  }
  salvando.value = true;
  try {
    await criar({
      tipo: form.tipo,
      valor: Number(form.valor),
      descricao: form.descricao,
      categoria: form.categoria,
      data: form.data,
    });
    await fetchResumoMes();
    toast.add({ title: "Lançamento registrado", color: "success" });
    isModalOpen.value = false;
  } catch {
    toast.add({ title: "Erro ao salvar lançamento", color: "error" });
  } finally {
    salvando.value = false;
  }
};

const confirmarRemover = async (id: string) => {
  try {
    await remover(id);
    await fetchResumoMes();
    toast.add({ title: "Lançamento removido", color: "neutral" });
  } catch {
    toast.add({ title: "Erro ao remover lançamento", color: "error" });
  }
};

// ── Formatação ────────────────────────────────────────────────────────────────
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
</script>

<template>
  <div class="flex flex-col gap-4">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-xl font-bold text-gray-800 dark:text-gray-100">
          Financeiro
        </h1>
        <p class="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
          Controle de receitas e despesas
        </p>
      </div>
      <UButton
        icon="i-lucide-plus"
        label="Novo Lançamento"
        color="secondary"
        @click="abrirModal"
      />
    </div>

    <!-- Cards de resumo do mês -->
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <template v-if="loading">
        <div
          v-for="i in 3"
          :key="i"
          class="bg-white dark:bg-neutral-800 rounded-2xl p-4 shadow-sm flex items-center justify-between gap-3"
        >
          <div class="flex flex-col gap-2">
            <USkeleton class="h-3 w-24" />
            <USkeleton class="h-7 w-20" />
          </div>
          <USkeleton class="w-12 h-12 rounded-full shrink-0" />
        </div>
      </template>
      <template v-else>
        <div
          v-for="card in [
            {
              label: 'Receitas do Mês',
              value: fmt(resumo.receitas),
              icon: 'i-lucide-trending-up',
              bg: '#D1FAE5',
              color: '#10B981',
            },
            {
              label: 'Despesas do Mês',
              value: fmt(resumo.despesas),
              icon: 'i-lucide-trending-down',
              bg: '#FFE0E0',
              color: '#E85A5A',
            },
            {
              label: 'Saldo do Mês',
              value: fmt(resumo.saldo),
              icon: 'i-lucide-wallet',
              bg: resumo.saldo >= 0 ? '#E0F2FE' : '#FFF3E0',
              color: resumo.saldo >= 0 ? '#0EA5E9' : '#F59E0B',
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
              class="text-xl font-extrabold text-gray-800 dark:text-gray-100 mt-1 leading-none"
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
      </template>
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
          v-model="filtroData"
          type="date"
          size="sm"
          class="max-w-[180px]"
        />
        <div class="flex gap-1 flex-wrap">
          <button
            v-for="t in [
              { label: 'Todos', value: '' },
              { label: 'Receitas', value: 'Receita' },
              { label: 'Despesas', value: 'Despesa' },
            ]"
            :key="t.value"
            class="px-3 py-1 rounded-full text-xs font-semibold transition-colors"
            :class="
              filtroTipo === t.value
                ? 'bg-[#0EA5E9] text-white'
                : 'bg-gray-100 dark:bg-neutral-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-neutral-600'
            "
            @click="filtroTipo = t.value as TipoLancamento | ''"
          >
            {{ t.label }}
          </button>
        </div>
      </div>

      <!-- Loading -->
      <div
        v-if="loading"
        class="flex flex-col items-center justify-center py-16 gap-2 text-gray-400"
      >
        <UIcon name="i-lucide-loader-circle" class="text-5xl animate-spin" />
        <p class="text-sm font-medium">Carregando lançamentos...</p>
      </div>

      <!-- Empty state -->
      <div
        v-else-if="lancamentos.length === 0"
        class="flex flex-col items-center justify-center py-16 gap-2 text-gray-400"
      >
        <UIcon name="i-lucide-wallet" class="text-5xl" />
        <p class="text-sm font-medium">Nenhum lançamento neste período</p>
      </div>

      <!-- Tabela -->
      <div v-else class="overflow-x-auto">
        <table class="min-w-full text-sm dark:text-gray-200">
          <thead>
            <tr class="border-b border-gray-100 dark:border-neutral-700">
              <th
                class="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide whitespace-nowrap"
              >
                Descrição
              </th>
              <th
                class="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide hidden sm:table-cell"
              >
                Categoria
              </th>
              <th
                class="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide hidden md:table-cell"
              >
                Data
              </th>
              <th
                class="text-right px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide"
              >
                Valor
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
              v-for="item in lancamentos"
              :key="item.id"
              class="border-b border-gray-50 dark:border-neutral-700 last:border-0 hover:bg-gray-50 dark:hover:bg-neutral-700/50 transition-colors"
            >
              <td class="px-4 py-3">
                <div class="flex items-center gap-2">
                  <div
                    class="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                    :style="{
                      backgroundColor:
                        item.tipo === 'Receita' ? '#D1FAE5' : '#FFE0E0',
                    }"
                  >
                    <UIcon
                      :name="
                        item.tipo === 'Receita'
                          ? 'i-lucide-trending-up'
                          : 'i-lucide-trending-down'
                      "
                      class="size-4"
                      :style="{
                        color: item.tipo === 'Receita' ? '#10B981' : '#E85A5A',
                      }"
                    />
                  </div>
                  <div>
                    <p class="font-semibold text-gray-800 dark:text-gray-100">
                      {{ item.descricao }}
                    </p>
                    <p
                      v-if="item.agendamento"
                      class="text-xs text-gray-400 mt-0.5"
                    >
                      {{ item.agendamento.pet.nome }} ·
                      {{ item.agendamento.servico.nome }}
                    </p>
                  </div>
                </div>
              </td>
              <td class="px-4 py-3 hidden sm:table-cell">
                <span
                  class="text-xs font-semibold px-2.5 py-1 rounded-full"
                  :class="
                    item.tipo === 'Receita'
                      ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400'
                      : 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400'
                  "
                >
                  {{ labelCategoria[item.categoria] }}
                </span>
              </td>
              <td
                class="px-4 py-3 text-gray-500 dark:text-gray-400 hidden md:table-cell"
              >
                {{ fmtData(item.data) }}
              </td>
              <td class="px-4 py-3 text-right">
                <span
                  class="font-bold"
                  :class="
                    item.tipo === 'Receita'
                      ? 'text-green-600 dark:text-green-400'
                      : 'text-red-500 dark:text-red-400'
                  "
                >
                  {{ item.tipo === "Receita" ? "+" : "-"
                  }}{{ fmt(Number(item.valor)) }}
                </span>
              </td>
              <td class="px-4 py-3">
                <div class="flex items-center gap-1 justify-end">
                  <UButton
                    icon="i-lucide-trash-2"
                    color="neutral"
                    variant="ghost"
                    size="xs"
                    aria-label="Remover"
                    @click="confirmarRemover(item.id)"
                  />
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    <UModal v-model:open="isModalOpen" title="Novo Lançamento">
      <template #body>
        <div class="flex flex-col gap-4 p-2">
          <!-- Tipo -->
          <div class="flex gap-2">
            <button
              v-for="t in ['Receita', 'Despesa']"
              :key="t"
              class="flex-1 py-2 rounded-lg text-sm font-semibold border-2 transition-colors"
              :class="
                form.tipo === t
                  ? t === 'Receita'
                    ? 'bg-green-500 border-green-500 text-white'
                    : 'bg-red-500 border-red-500 text-white'
                  : 'bg-white dark:bg-neutral-700 border-gray-200 dark:border-neutral-600 text-gray-600 dark:text-gray-300'
              "
              @click="form.tipo = t as TipoLancamento"
            >
              {{ t }}
            </button>
          </div>

          <UFormField label="Descrição" required>
            <UInput
              v-model="form.descricao"
              placeholder="Ex: Tosa Golden Retriever"
              class="w-full"
            />
          </UFormField>

          <UFormField label="Valor (R$)" required>
            <UInput
              v-model="form.valor"
              type="number"
              min="0.01"
              step="0.01"
              placeholder="0,00"
              class="w-full"
            />
          </UFormField>

          <UFormField label="Categoria">
            <USelect
              v-model="form.categoria"
              :items="
                categorias.map((c) => ({ label: labelCategoria[c], value: c }))
              "
              value-key="value"
              label-key="label"
              class="w-full"
            />
          </UFormField>

          <UFormField label="Data">
            <UInput v-model="form.data" type="date" class="w-full" />
          </UFormField>
        </div>
      </template>
      <template #footer>
        <div class="flex justify-end gap-2">
          <UButton
            variant="ghost"
            color="neutral"
            label="Cancelar"
            @click="isModalOpen = false"
          />
          <UButton
            :loading="salvando"
            :color="form.tipo === 'Receita' ? 'success' : 'error'"
            :label="`Salvar ${form.tipo}`"
            @click="salvar"
          />
        </div>
      </template>
    </UModal>
  </div>
</template>
