<script setup lang="ts">
import { useAvaliacoes } from "~/composables/useAvaliacoes";

useBreadcrumb().set([
  { label: "Dashboard", to: "/dashboard" },
  { label: "Avaliações" },
]);

const { apiFetch } = useApi();

interface AvaliacaoItem {
  id: string;
  nota: number;
  respondidaEm: string;
  cliente: { id: string; nome: string };
  agendamento: {
    dataHora: string;
    servico: { nome: string };
    pet: { nome: string };
  };
}

const avaliacoes = ref<AvaliacaoItem[]>([]);
const carregando = ref(true);

const { resumo, fetchResumo } = useAvaliacoes();

await Promise.all([
  apiFetch<AvaliacaoItem[]>("/avaliacoes").then((d) => (avaliacoes.value = d)),
  fetchResumo(),
]).finally(() => (carregando.value = false));

function estrelas(n: number) {
  return "⭐".repeat(n) + "☆".repeat(5 - n);
}

function corNota(n: number): string {
  if (n >= 4) return "#10B981";
  if (n === 3) return "#F59E0B";
  return "#EF4444";
}
</script>

<template>
  <div class="flex flex-col gap-6">
    <!-- Cards de resumo -->
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <div
        class="bg-white dark:bg-neutral-800 rounded-2xl shadow-sm p-5 flex flex-col gap-1"
      >
        <span class="text-xs text-gray-500 dark:text-gray-400"
          >Total de avaliações</span
        >
        <span class="text-3xl font-black text-gray-800 dark:text-gray-100">{{
          resumo.total
        }}</span>
      </div>
      <div
        class="bg-white dark:bg-neutral-800 rounded-2xl shadow-sm p-5 flex flex-col gap-1"
      >
        <span class="text-xs text-gray-500 dark:text-gray-400">Nota média</span>
        <span class="text-3xl font-black text-amber-500">
          {{ resumo.mediaNota ?? "—" }}
          <span class="text-lg">⭐</span>
        </span>
      </div>
      <div
        class="bg-white dark:bg-neutral-800 rounded-2xl shadow-sm p-5 flex flex-col gap-1"
      >
        <span class="text-xs text-gray-500 dark:text-gray-400"
          >Clientes satisfeitos (nota ≥ 4)</span
        >
        <span
          class="text-3xl font-black"
          :class="
            (resumo.percentualPositivo ?? 0) >= 80
              ? 'text-emerald-500'
              : (resumo.percentualPositivo ?? 0) >= 60
                ? 'text-amber-500'
                : 'text-red-500'
          "
        >
          {{
            resumo.percentualPositivo !== null
              ? resumo.percentualPositivo + "%"
              : "—"
          }}
        </span>
      </div>
    </div>

    <!-- Tabela de avaliações -->
    <div
      class="bg-white dark:bg-neutral-800 rounded-2xl shadow-sm overflow-hidden"
    >
      <div
        class="flex items-center justify-between px-4 py-2.5"
        style="background-color: #1d9fb6"
      >
        <div class="flex items-center gap-2">
          <UIcon name="i-lucide-star" class="size-4 text-white" />
          <h3 class="text-white font-semibold text-sm">Avaliações Recebidas</h3>
        </div>
      </div>

      <div v-if="carregando" class="p-8 text-center text-gray-400 text-sm">
        Carregando...
      </div>

      <div v-else-if="avaliacoes.length === 0" class="p-8 text-center">
        <span class="text-4xl block mb-3">⭐</span>
        <p class="text-gray-500 text-sm">
          Nenhuma avaliação respondida ainda.<br />
          Elas aparecem aqui automaticamente após os clientes responderem o
          e-mail pós-atendimento.
        </p>
      </div>

      <div v-else class="divide-y divide-gray-50 dark:divide-neutral-700">
        <div
          v-for="a in avaliacoes"
          :key="a.id"
          class="flex items-center gap-4 px-4 py-3 hover:bg-gray-50 dark:hover:bg-neutral-700 transition-colors"
        >
          <!-- Nota -->
          <div
            class="text-xl font-black shrink-0 w-8 text-center"
            :style="{ color: corNota(a.nota) }"
          >
            {{ a.nota }}
          </div>
          <div class="text-lg leading-none shrink-0">
            {{ estrelas(a.nota) }}
          </div>

          <!-- Info -->
          <div class="flex-1 min-w-0">
            <p
              class="text-sm font-medium text-gray-800 dark:text-gray-100 truncate"
            >
              {{ a.cliente.nome }}
            </p>
            <p class="text-xs text-gray-400 truncate">
              {{ a.agendamento.servico.nome }} — {{ a.agendamento.pet.nome }}
            </p>
          </div>

          <!-- Data -->
          <div class="text-xs text-gray-400 shrink-0 text-right">
            {{
              new Date(a.respondidaEm).toLocaleDateString("pt-BR", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
              })
            }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
