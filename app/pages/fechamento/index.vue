<script setup lang="ts">
import { useApi } from "~/composables/useApi";

definePageMeta({ ssr: false });

useBreadcrumb().set([{ label: "Fechamento de Caixa" }]);

const { apiFetch } = useApi();
const toast = useToast();

// ─── Tipos ────────────────────────────────────────────────────────────────────
interface Fechamento {
  id: string;
  data: string;
  totalVendas: number;
  quantidadeVendas: number;
  porFormaPagamento: Record<string, number>;
  totalPdv: number | null;
  qtdPdv: number | null;
  porFormaPdv: Record<string, number> | null;
  totalAgendamentos: number | null;
  qtdAgendamentos: number | null;
  porFormaAgendamentos: Record<string, number> | null;
  observacoes: string | null;
  criadoEm: string;
  usuario: { nomeCompleto: string };
}

interface FonteResumo {
  total: number;
  quantidade: number;
  porFormaPagamento: Record<string, number>;
}

interface ResumoDia {
  data: string;
  pdv: FonteResumo;
  agendamentos: FonteResumo;
  totalGeral: number;
  quantidadeTotal: number;
}

interface StatusDia {
  fechado: boolean;
  fechamento: Fechamento | null;
}

// ─── Estado ──────────────────────────────────────────────────────────────────
const statusDia = ref<StatusDia | null>(null);
const resumoDia = ref<ResumoDia | null>(null);
const historico = ref<Fechamento[]>([]);
const totalHistorico = ref(0);
const page = ref(1);
const loadingStatus = ref(true);
const loadingHistorico = ref(false);
const fechandoCaixa = ref(false);
const observacoes = ref("");
const confirmOpen = ref(false);
const verTodos = ref(false);

const historicoFiltrado = computed(() =>
  verTodos.value
    ? historico.value
    : historico.value.filter(
        (f) => f.data.substring(0, 10) === dataSelecionada.value,
      ),
);

const _hoje = new Date();
const hojeISO = `${_hoje.getFullYear()}-${String(_hoje.getMonth() + 1).padStart(2, "0")}-${String(_hoje.getDate()).padStart(2, "0")}`;
const dataSelecionada = ref(hojeISO);
const ehHoje = computed(() => dataSelecionada.value === hojeISO);

// ─── Buscar dados ao montar ──────────────────────────────────────────────────
async function carregarStatus() {
  loadingStatus.value = true;
  try {
    const qs = `?data=${dataSelecionada.value}`;
    const [status, resumo] = await Promise.all([
      apiFetch<StatusDia>(`/fechamento/status-dia${qs}`),
      apiFetch<ResumoDia>(`/fechamento/resumo-dia${qs}`),
    ]);
    statusDia.value = status;
    resumoDia.value = resumo;
  } finally {
    loadingStatus.value = false;
  }
}

watch(dataSelecionada, () => carregarStatus());

async function carregarHistorico() {
  loadingHistorico.value = true;
  try {
    const res = await apiFetch<{
      items: Fechamento[];
      total: number;
      page: number;
    }>(`/fechamento?page=${page.value}`);
    historico.value = res.items;
    totalHistorico.value = res.total;
  } finally {
    loadingHistorico.value = false;
  }
}

onMounted(() => {
  carregarStatus();
  carregarHistorico();
});

// ─── Fechar caixa ─────────────────────────────────────────────────────────────
async function confirmarFechamento() {
  fechandoCaixa.value = true;
  try {
    await apiFetch(`/fechamento?data=${dataSelecionada.value}`, {
      method: "POST",
      body: { observacoes: observacoes.value || undefined },
    });
    toast.add({ title: "Caixa fechado com sucesso!", color: "success" });
    confirmOpen.value = false;
    observacoes.value = "";
    await carregarStatus();
    await carregarHistorico();
  } catch (err: unknown) {
    const msg =
      (err as { data?: { message?: string } })?.data?.message ??
      "Erro ao fechar o caixa.";
    toast.add({ title: msg, color: "error" });
  } finally {
    fechandoCaixa.value = false;
  }
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
const labelData = computed(() =>
  new Date(dataSelecionada.value + "T12:00:00").toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  }),
);

function formasPorFonte(obj: Record<string, number> | null | undefined) {
  return Object.entries(obj ?? {}).map(([forma, valor]) => ({ forma, valor }));
}

// Para fechamentos já registrados — usa breakdown salvo se disponível
const fontesFechamento = computed(() => {
  const f = statusDia.value?.fechamento;
  if (!f) return null;
  const pdv = f.porFormaPdv ?? null;
  const ags = f.porFormaAgendamentos ?? null;
  return {
    pdv,
    ags,
    totalPdv: f.totalPdv,
    totalAgs: f.totalAgendamentos,
    qtdPdv: f.qtdPdv,
    qtdAgs: f.qtdAgendamentos,
  };
});

const formaPagamentoIcon: Record<string, string> = {
  Dinheiro: "i-lucide-banknote",
  Cartao: "i-lucide-credit-card",
  Pix: "i-lucide-qr-code",
  Fiado: "i-lucide-clock",
  Outro: "i-lucide-circle-help",
};

const formaPagamentoCor: Record<string, { bg: string; icon: string }> = {
  Dinheiro: { bg: "#D1FAE5", icon: "#10B981" },
  Cartao: { bg: "#EDE9FE", icon: "#7C3AED" },
  Pix: { bg: "#E0F2FE", icon: "#0EA5E9" },
  Fiado: { bg: "#FEF3C7", icon: "#F59E0B" },
  Outro: { bg: "#F3F4F6", icon: "#6B7280" },
};
</script>

<template>
  <div class="flex flex-col gap-6">
    <!-- Cabeçalho -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-xl font-bold text-gray-800 dark:text-gray-100">
          Fechamento de Caixa
        </h1>
        <p class="text-sm text-gray-500 dark:text-gray-400 capitalize">
          {{ labelData }}
        </p>
      </div>
    </div>

    <!-- Skeleton enquanto carrega -->
    <template v-if="loadingStatus">
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <USkeleton v-for="i in 3" :key="i" class="h-24 rounded-xl" />
      </div>
    </template>

    <template v-else>
      <!-- Banner: caixa já fechado hoje -->
      <UAlert
        v-if="statusDia?.fechado"
        color="success"
        variant="soft"
        icon="i-lucide-circle-check"
        title="Caixa fechado"
        :description="`Fechado em ${new Date(statusDia.fechamento!.criadoEm).toLocaleString('pt-BR')} por ${statusDia.fechamento!.usuario?.nomeCompleto ?? ''}`"
      />

      <!-- Resumo do dia -->
      <UCard class="ring-0 shadow-sm">
        <div class="flex flex-wrap items-center justify-between gap-3 mb-4">
          <h2 class="text-base font-semibold text-gray-800 dark:text-gray-100">
            Resumo do dia
          </h2>
          <div class="flex items-center gap-2">
            <UButton
              icon="i-lucide-chevron-left"
              color="neutral"
              variant="ghost"
              size="xs"
              @click="
                dataSelecionada = new Date(
                  new Date(dataSelecionada + 'T12:00:00').setDate(
                    new Date(dataSelecionada + 'T12:00:00').getDate() - 1,
                  ),
                )
                  .toISOString()
                  .split('T')[0]
              "
            />
            <input
              v-model="dataSelecionada"
              type="date"
              :max="hojeISO"
              class="text-sm text-gray-700 dark:text-gray-200 bg-transparent border border-gray-200 dark:border-neutral-700 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-secondary-400"
            />
            <UButton
              icon="i-lucide-chevron-right"
              color="neutral"
              variant="ghost"
              size="xs"
              :disabled="ehHoje"
              @click="
                dataSelecionada = new Date(
                  new Date(dataSelecionada + 'T12:00:00').setDate(
                    new Date(dataSelecionada + 'T12:00:00').getDate() + 1,
                  ),
                )
                  .toISOString()
                  .split('T')[0]
              "
            />
            <UBadge
              v-if="statusDia?.fechado || ehHoje"
              :color="statusDia?.fechado ? 'success' : 'warning'"
              variant="soft"
            >
              {{ statusDia?.fechado ? "Fechado" : "Aberto" }}
            </UBadge>
          </div>
        </div>

        <!-- Total geral -->
        <div class="flex items-center gap-4 mb-6">
          <div
            class="w-12 h-12 rounded-full bg-secondary-100 dark:bg-secondary-900 flex items-center justify-center shrink-0"
          >
            <UIcon
              name="i-lucide-wallet"
              class="text-secondary-600 dark:text-secondary-400 text-xl"
            />
          </div>
          <div>
            <p class="text-sm text-gray-500 dark:text-gray-400">
              Total geral do dia
            </p>
            <p class="text-2xl font-bold text-gray-800 dark:text-gray-100">
              R$
              {{
                Number(
                  statusDia?.fechado
                    ? statusDia.fechamento!.totalVendas
                    : (resumoDia?.totalGeral ?? 0),
                ).toLocaleString("pt-BR", { minimumFractionDigits: 2 })
              }}
            </p>
            <p class="text-xs text-gray-400 dark:text-gray-500">
              {{
                statusDia?.fechado
                  ? statusDia.fechamento!.quantidadeVendas
                  : (resumoDia?.quantidadeTotal ?? 0)
              }}
              transação(ões) concluída(s)
            </p>
          </div>
        </div>

        <!-- Vendas no Caixa (PDV) -->
        <div class="mb-5">
          <div class="flex items-center gap-2 mb-3">
            <UIcon
              name="i-lucide-shopping-cart"
              class="text-gray-400 dark:text-gray-500"
            />
            <h3 class="text-sm font-semibold text-gray-600 dark:text-gray-300">
              Vendas no Caixa (PDV)
            </h3>
            <span class="text-xs text-gray-400 dark:text-gray-500">
              —
              {{
                statusDia?.fechado
                  ? (fontesFechamento?.qtdPdv ?? 0)
                  : (resumoDia?.pdv.quantidade ?? 0)
              }}
              venda(s) · R$
              {{
                Number(
                  statusDia?.fechado
                    ? (fontesFechamento?.totalPdv ?? 0)
                    : (resumoDia?.pdv.total ?? 0),
                ).toLocaleString("pt-BR", { minimumFractionDigits: 2 })
              }}
            </span>
          </div>
          <div
            v-if="
              formasPorFonte(
                statusDia?.fechado
                  ? fontesFechamento?.pdv
                  : resumoDia?.pdv.porFormaPagamento,
              ).length > 0
            "
            class="grid grid-cols-1 sm:grid-cols-3 gap-3"
          >
            <div
              v-for="fp in formasPorFonte(
                statusDia?.fechado
                  ? fontesFechamento?.pdv
                  : resumoDia?.pdv.porFormaPagamento,
              )"
              :key="fp.forma"
              class="flex items-center gap-3 p-3 rounded-lg"
              :style="{
                background: formaPagamentoCor[fp.forma]?.bg ?? '#F3F4F6',
              }"
            >
              <UIcon
                :name="formaPagamentoIcon[fp.forma] ?? 'i-lucide-circle-help'"
                class="text-lg shrink-0"
                :style="{
                  color: formaPagamentoCor[fp.forma]?.icon ?? '#6B7280',
                }"
              />
              <div>
                <p class="text-xs text-gray-400 dark:text-gray-500">
                  {{ fp.forma }}
                </p>
                <p
                  class="text-sm font-semibold text-gray-800 dark:text-gray-100"
                >
                  R$
                  {{
                    Number(fp.valor).toLocaleString("pt-BR", {
                      minimumFractionDigits: 2,
                    })
                  }}
                </p>
              </div>
            </div>
          </div>
          <p v-else class="text-xs text-gray-400 dark:text-gray-500 pl-1">
            Nenhuma venda no caixa.
          </p>
        </div>

        <UDivider class="my-2" />

        <!-- Agendamentos -->
        <div class="mt-5">
          <div class="flex items-center gap-2 mb-3">
            <UIcon
              name="i-lucide-calendar-check"
              class="text-gray-400 dark:text-gray-500"
            />
            <h3 class="text-sm font-semibold text-gray-600 dark:text-gray-300">
              Agendamentos (Banho, Tosa etc.)
            </h3>
            <span class="text-xs text-gray-400 dark:text-gray-500">
              —
              {{
                statusDia?.fechado
                  ? (fontesFechamento?.qtdAgs ?? 0)
                  : (resumoDia?.agendamentos.quantidade ?? 0)
              }}
              atendimento(s) · R$
              {{
                Number(
                  statusDia?.fechado
                    ? (fontesFechamento?.totalAgs ?? 0)
                    : (resumoDia?.agendamentos.total ?? 0),
                ).toLocaleString("pt-BR", { minimumFractionDigits: 2 })
              }}
            </span>
          </div>
          <div
            v-if="
              formasPorFonte(
                statusDia?.fechado
                  ? fontesFechamento?.ags
                  : resumoDia?.agendamentos.porFormaPagamento,
              ).length > 0
            "
            class="grid grid-cols-1 sm:grid-cols-3 gap-3"
          >
            <div
              v-for="fp in formasPorFonte(
                statusDia?.fechado
                  ? fontesFechamento?.ags
                  : resumoDia?.agendamentos.porFormaPagamento,
              )"
              :key="fp.forma"
              class="flex items-center gap-3 p-3 rounded-lg"
              :style="{
                background: formaPagamentoCor[fp.forma]?.bg ?? '#F3F4F6',
              }"
            >
              <UIcon
                :name="formaPagamentoIcon[fp.forma] ?? 'i-lucide-circle-help'"
                class="text-lg shrink-0"
                :style="{
                  color: formaPagamentoCor[fp.forma]?.icon ?? '#6B7280',
                }"
              />
              <div>
                <p class="text-xs text-gray-400 dark:text-gray-500">
                  {{ fp.forma }}
                </p>
                <p
                  class="text-sm font-semibold text-gray-800 dark:text-gray-100"
                >
                  R$
                  {{
                    Number(fp.valor).toLocaleString("pt-BR", {
                      minimumFractionDigits: 2,
                    })
                  }}
                </p>
              </div>
            </div>
          </div>
          <p v-else class="text-xs text-gray-400 dark:text-gray-500 pl-1">
            Nenhum agendamento concluído.
          </p>
        </div>

        <!-- Botão fechar caixa -->
        <div class="mt-6 flex justify-end">
          <UButton
            v-if="!statusDia?.fechado && ehHoje"
            color="secondary"
            leading-icon="i-lucide-lock"
            :loading="fechandoCaixa"
            @click="confirmOpen = true"
          >
            Fechar caixa agora
          </UButton>
        </div>
      </UCard>
    </template>

    <!-- Modal de confirmação -->
    <UModal v-model:open="confirmOpen" title="Fechar o caixa de hoje?">
      <template #body>
        <div class="flex flex-col gap-4">
          <p class="text-sm text-gray-600 dark:text-gray-400">
            Ao confirmar, será registrado o fechamento com total de
            <span class="font-semibold text-gray-800 dark:text-gray-100">
              R$
              {{
                Number(resumoDia?.totalGeral ?? 0).toLocaleString("pt-BR", {
                  minimumFractionDigits: 2,
                })
              }}
            </span>
            sendo
            <span class="font-semibold text-gray-800 dark:text-gray-100">
              {{ resumoDia?.pdv.quantidade ?? 0 }} venda(s) no caixa
            </span>
            e
            <span class="font-semibold text-gray-800 dark:text-gray-100">
              {{ resumoDia?.agendamentos.quantidade ?? 0 }} agendamento(s)</span
            >.
          </p>
          <UFormField label="Observações (opcional)">
            <UTextarea
              v-model="observacoes"
              placeholder="Ex: Dia de grande movimento, promoção de banho..."
              :rows="3"
              class="w-full"
            />
          </UFormField>
        </div>
      </template>
      <template #footer>
        <div class="flex justify-end gap-2">
          <UButton
            color="neutral"
            variant="outline"
            @click="confirmOpen = false"
          >
            Cancelar
          </UButton>
          <UButton
            color="secondary"
            leading-icon="i-lucide-lock"
            :loading="fechandoCaixa"
            @click="confirmarFechamento"
          >
            Confirmar fechamento
          </UButton>
        </div>
      </template>
    </UModal>

    <!-- Histórico -->
    <UCard class="ring-0 shadow-sm">
      <template #header>
        <div class="flex items-center justify-between">
          <h2 class="text-base font-semibold text-gray-800 dark:text-gray-100">
            {{
              verTodos
                ? "Todos os fechamentos"
                : `Fechamento de ${new Date(dataSelecionada + "T12:00:00").toLocaleDateString("pt-BR")}`
            }}
          </h2>
          <UButton
            color="neutral"
            variant="ghost"
            size="xs"
            :leading-icon="
              verTodos ? 'i-lucide-calendar-days' : 'i-lucide-list'
            "
            @click="verTodos = !verTodos"
          >
            {{ verTodos ? "Ver data selecionada" : "Ver todos" }}
          </UButton>
        </div>
      </template>

      <div v-if="loadingHistorico" class="flex flex-col gap-3">
        <USkeleton v-for="i in 5" :key="i" class="h-12 rounded-lg" />
      </div>

      <div
        v-else-if="historicoFiltrado.length === 0"
        class="flex flex-col items-center justify-center py-10 gap-2 text-gray-400 dark:text-gray-500"
      >
        <UIcon name="i-lucide-archive" class="text-4xl" />
        <p class="text-sm font-medium">
          {{
            verTodos
              ? "Nenhum fechamento registrado ainda."
              : "Nenhum fechamento para este dia."
          }}
        </p>
        <UButton
          v-if="!verTodos"
          color="neutral"
          variant="ghost"
          size="xs"
          @click="verTodos = true"
        >
          Ver todos os fechamentos
        </UButton>
      </div>

      <div v-else class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr
              class="border-b border-gray-100 dark:border-neutral-700 text-left text-xs text-gray-400 dark:text-gray-500 uppercase tracking-wide"
            >
              <th class="pb-2 pr-4 font-medium">Data</th>
              <th class="pb-2 pr-4 font-medium">PDV</th>
              <th class="pb-2 pr-4 font-medium">Agend.</th>
              <th class="pb-2 pr-4 font-medium">Total</th>
              <th class="pb-2 pr-4 font-medium">Fechado por</th>
              <th class="pb-2 font-medium">Observações</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="f in historicoFiltrado"
              :key="f.id"
              class="border-b border-gray-50 dark:border-neutral-800 transition-colors cursor-pointer"
              :class="
                f.data.substring(0, 10) === dataSelecionada
                  ? 'bg-secondary-50 dark:bg-secondary-900/20'
                  : 'hover:bg-gray-50 dark:hover:bg-neutral-800'
              "
              @click="dataSelecionada = f.data.substring(0, 10)"
            >
              <td
                class="py-3 pr-4 font-medium text-gray-800 dark:text-gray-100"
              >
                {{
                  new Date(
                    f.data.substring(0, 10) + "T12:00:00",
                  ).toLocaleDateString("pt-BR", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                  })
                }}
              </td>
              <td class="py-3 pr-4 text-gray-600 dark:text-gray-300">
                {{ f.qtdPdv ?? f.quantidadeVendas }}
              </td>
              <td class="py-3 pr-4 text-gray-600 dark:text-gray-300">
                {{ f.qtdAgendamentos ?? "—" }}
              </td>
              <td
                class="py-3 pr-4 font-semibold text-gray-800 dark:text-gray-100"
              >
                R$
                {{
                  Number(f.totalVendas).toLocaleString("pt-BR", {
                    minimumFractionDigits: 2,
                  })
                }}
              </td>
              <td class="py-3 pr-4 text-gray-600 dark:text-gray-300">
                {{ f.usuario?.nomeCompleto ?? "—" }}
              </td>
              <td
                class="py-3 text-gray-500 dark:text-gray-400 max-w-xs truncate"
              >
                {{ f.observacoes || "—" }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Paginação -->
      <div v-if="totalHistorico > 20" class="flex justify-center mt-4">
        <UPagination
          v-model:page="page"
          :total="totalHistorico"
          :items-per-page="20"
          @update:page="carregarHistorico"
        />
      </div>
    </UCard>
  </div>
</template>
