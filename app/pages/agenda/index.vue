<script setup lang="ts">
import type {
  StatusAgendamento,
  ModalidadeAgendamento,
} from "~/types/agendamento";
import type { Cliente } from "~/types/cliente";
import type { Pet } from "~/types/pet";

const { apiFetch } = useApi();
const { agendamentos, loading, fetchByDate, create, updateStatus } =
  useAgenda();
const toast = useToast();

// -- Data selecionada ---------------------------------------------------------
const today = new Date().toISOString().slice(0, 10);
const selectedDate = ref(today);

const selectedDateFormatted = computed(() =>
  new Date(selectedDate.value + "T00:00:00").toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }),
);

const prevDay = () => {
  const d = new Date(selectedDate.value + "T00:00:00");
  d.setDate(d.getDate() - 1);
  selectedDate.value = d.toISOString().slice(0, 10);
};

const nextDay = () => {
  const d = new Date(selectedDate.value + "T00:00:00");
  d.setDate(d.getDate() + 1);
  selectedDate.value = d.toISOString().slice(0, 10);
};

watch(selectedDate, (date) => fetchByDate(date), { immediate: true });

// -- Busca local -------------------------------------------------------------
const busca = ref("");

const agendamentosDoDia = computed(() => {
  const q = busca.value.toLowerCase();
  return agendamentos.value
    .filter(
      (a) =>
        !q ||
        a.pet.nome.toLowerCase().includes(q) ||
        a.cliente.nome.toLowerCase().includes(q) ||
        a.servico.nome.toLowerCase().includes(q),
    )
    .sort((a, b) => a.dataHora.localeCompare(b.dataHora));
});

// -- Resumo do dia -----------------------------------------------------------
const resumoDia = computed(() => ({
  total: agendamentos.value.length,
  agendados: agendamentos.value.filter(
    (a) => a.status === "Agendado" || a.status === "Confirmado",
  ).length,
  concluidos: agendamentos.value.filter((a) => a.status === "Concluido").length,
  cancelados: agendamentos.value.filter((a) => a.status === "Cancelado").length,
}));

// -- Hora do agendamento ------------------------------------------------------
const formatHora = (dataHora: string) =>
  new Date(dataHora).toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });

// -- Status config ------------------------------------------------------------
const statusConfig: Record<
  StatusAgendamento,
  { label: string; bg: string; text: string }
> = {
  Agendado: {
    label: "Agendado",
    bg: "bg-blue-100 dark:bg-blue-900/40",
    text: "text-blue-600 dark:text-blue-400",
  },
  Confirmado: {
    label: "Confirmado",
    bg: "bg-indigo-100 dark:bg-indigo-900/40",
    text: "text-indigo-600 dark:text-indigo-400",
  },
  EmAtendimento: {
    label: "Em Atendimento",
    bg: "bg-yellow-100 dark:bg-yellow-900/40",
    text: "text-yellow-600 dark:text-yellow-400",
  },
  Concluido: {
    label: "Concluído",
    bg: "bg-green-100 dark:bg-green-900/40",
    text: "text-green-600 dark:text-green-400",
  },
  Cancelado: {
    label: "Cancelado",
    bg: "bg-gray-100 dark:bg-neutral-700",
    text: "text-gray-500 dark:text-gray-400",
  },
};

// -- Ações de status ----------------------------------------------------------
const alterandoStatus = ref<string | null>(null);

const alterarStatus = async (id: string, status: StatusAgendamento) => {
  alterandoStatus.value = id;
  try {
    await updateStatus(id, status);
    toast.add({ title: "Status atualizado!", color: "success" });
  } catch {
    toast.add({ title: "Erro ao atualizar status", color: "error" });
  } finally {
    alterandoStatus.value = null;
  }
};

// -- Modal confirmação de cancelamento ---------------------------------------
const confirmCancelOpen = ref(false);
const agendamentoParaCancelar = ref<string | null>(null);

const pedirCancelamento = (id: string) => {
  agendamentoParaCancelar.value = id;
  confirmCancelOpen.value = true;
};

const confirmarCancelamento = async () => {
  if (!agendamentoParaCancelar.value) return;
  await alterarStatus(agendamentoParaCancelar.value, "Cancelado");
  confirmCancelOpen.value = false;
  agendamentoParaCancelar.value = null;
};

// -- Modal novo agendamento ---------------------------------------------------
const isModalOpen = ref(false);
const salvando = ref(false);

// Clientes para o select
const clientes = ref<{ label: string; value: string }[]>([]);
const clientesLoading = ref(false);

// Pets do cliente selecionado
const petsDoCliente = ref<{ label: string; value: string }[]>([]);
const petsLoading = ref(false);

// Serviços para o select
const servicos = ref<{ label: string; value: string }[]>([]);
const servicosLoading = ref(false);

const novoForm = reactive({
  data: today,
  hora: "",
  servicoId: "",
  clienteId: "",
  petId: "",
  modalidade: "ClienteTraz" as ModalidadeAgendamento,
  observacoes: "",
});

const carregarDadosModal = async () => {
  novoForm.data = selectedDate.value;
  novoForm.hora = "";
  novoForm.servicoId = "";
  novoForm.clienteId = "";
  novoForm.petId = "";
  novoForm.modalidade = "ClienteTraz";
  novoForm.observacoes = "";
  petsDoCliente.value = [];

  clientesLoading.value = true;
  servicosLoading.value = true;

  const [clientesResp, servicosResp] = await Promise.all([
    apiFetch<{ data: Cliente[] }>("/clientes?limit=500").catch(() => ({
      data: [],
    })),
    apiFetch<{ id: string; nome: string; ativo: boolean }[]>(
      "/servicos?ativos=true",
    ).catch(() => []),
  ]);

  clientes.value = (clientesResp.data ?? []).map((c) => ({
    label: c.nome,
    value: c.id,
  }));

  servicos.value = (Array.isArray(servicosResp) ? servicosResp : [])
    .filter((s) => s.ativo)
    .map((s) => ({ label: s.nome, value: s.id }));

  clientesLoading.value = false;
  servicosLoading.value = false;
};

watch(isModalOpen, (open) => {
  if (open) carregarDadosModal();
});

// Quando cliente muda, carrega seus pets
watch(
  () => novoForm.clienteId,
  async (id) => {
    novoForm.petId = "";
    petsDoCliente.value = [];
    if (!id) return;

    petsLoading.value = true;
    try {
      const cliente = await apiFetch<{ pets: Pet[] }>(`/clientes/${id}`);
      petsDoCliente.value = (cliente.pets ?? []).map((p) => ({
        label: `${p.nome}${p.especie ? ` (${p.especie})` : ""}`,
        value: p.id,
      }));
    } catch {
      petsDoCliente.value = [];
    } finally {
      petsLoading.value = false;
    }
  },
);

const salvarAgendamento = async () => {
  if (
    !novoForm.data ||
    !novoForm.hora ||
    !novoForm.servicoId ||
    !novoForm.clienteId ||
    !novoForm.petId
  ) {
    toast.add({
      title: "Preencha todos os campos obrigatórios",
      color: "error",
    });
    return;
  }

  salvando.value = true;
  try {
    const dataHora = new Date(
      `${novoForm.data}T${novoForm.hora}`,
    ).toISOString();
    await create({
      clienteId: novoForm.clienteId,
      petId: novoForm.petId,
      servicoId: novoForm.servicoId,
      dataHora,
      modalidade: novoForm.modalidade,
      observacoes: novoForm.observacoes || undefined,
    });

    isModalOpen.value = false;
    selectedDate.value = novoForm.data;
    toast.add({ title: "Agendamento criado com sucesso!", color: "success" });
  } catch {
    toast.add({ title: "Erro ao criar agendamento", color: "error" });
  } finally {
    salvando.value = false;
  }
};
</script>

<template>
  <div class="flex flex-col gap-4">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-xl font-bold text-gray-800 dark:text-gray-100">
          Agenda
        </h1>
        <p class="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
          Gerenciamento de agendamentos
        </p>
      </div>
      <UButton
        icon="i-lucide-plus"
        label="Novo Agendamento"
        color="secondary"
        @click="isModalOpen = true"
      />
    </div>

    <!-- Navegação de data -->
    <div
      class="flex items-center gap-3 bg-white dark:bg-neutral-800 rounded-2xl px-4 py-3 shadow-sm"
    >
      <UButton
        icon="i-lucide-chevron-left"
        color="neutral"
        variant="ghost"
        @click="prevDay"
      />
      <div class="flex-1 text-center">
        <p
          class="text-sm font-semibold text-gray-800 dark:text-gray-100 capitalize"
        >
          {{ selectedDateFormatted }}
        </p>
      </div>
      <UButton
        icon="i-lucide-chevron-right"
        color="neutral"
        variant="ghost"
        @click="nextDay"
      />
      <UButton
        v-if="selectedDate !== today"
        label="Hoje"
        color="neutral"
        variant="outline"
        size="sm"
        @click="selectedDate = today"
      />
    </div>

    <!-- Cards de resumo -->
    <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
      <div
        v-for="card in [
          {
            label: 'Total',
            value: resumoDia.total,
            icon: 'i-lucide-calendar',
            bg: '#E0F2FE',
            color: '#0EA5E9',
          },
          {
            label: 'Agendados',
            value: resumoDia.agendados,
            icon: 'i-lucide-clock',
            bg: '#E0F2FE',
            color: '#0EA5E9',
          },
          {
            label: 'Concluídos',
            value: resumoDia.concluidos,
            icon: 'i-lucide-check-circle',
            bg: '#D1FAE5',
            color: '#10B981',
          },
          {
            label: 'Cancelados',
            value: resumoDia.cancelados,
            icon: 'i-lucide-x-circle',
            bg: '#F0F0F0',
            color: '#9ca3af',
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
            class="text-3xl font-extrabold text-gray-800 dark:text-gray-100 mt-1 leading-none"
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

    <!-- Lista de agendamentos -->
    <div
      class="bg-white dark:bg-neutral-800 rounded-2xl shadow-sm overflow-hidden"
    >
      <div
        class="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-neutral-700"
      >
        <UInput
          v-model="busca"
          placeholder="Buscar por pet, dono ou serviço..."
          leading-icon="i-lucide-search"
          size="sm"
          class="max-w-xs"
        />
      </div>

      <!-- Loading -->
      <div
        v-if="loading"
        class="flex items-center justify-center py-16 gap-2 text-gray-400"
      >
        <UIcon name="i-lucide-loader-circle" class="animate-spin text-3xl" />
      </div>

      <!-- Empty state -->
      <div
        v-else-if="agendamentosDoDia.length === 0"
        class="flex flex-col items-center justify-center py-16 gap-2 text-gray-400"
      >
        <UIcon name="i-lucide-calendar-x" class="text-5xl" />
        <p class="text-sm font-medium">Nenhum agendamento para este dia</p>
        <UButton
          variant="ghost"
          color="neutral"
          size="sm"
          label="Criar agendamento"
          icon="i-lucide-plus"
          @click="isModalOpen = true"
        />
      </div>

      <!-- Itens -->
      <div v-else class="divide-y divide-gray-50 dark:divide-neutral-700">
        <div
          v-for="item in agendamentosDoDia"
          :key="item.id"
          class="flex items-center gap-4 px-4 py-3"
        >
          <!-- Hora -->
          <div class="w-14 shrink-0 text-center">
            <span class="text-sm font-bold text-gray-700 dark:text-gray-200">
              {{ formatHora(item.dataHora) }}
            </span>
          </div>

          <!-- Ícone -->
          <div
            class="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
            style="background-color: #E0F2FE"
          >
            <UIcon
              name="i-lucide-scissors"
              class="size-4"
              style="color: #0EA5E9"
            />
          </div>

          <!-- Info -->
          <div class="flex-1 min-w-0">
            <p class="text-sm font-semibold text-gray-800 dark:text-gray-100">
              {{ item.servico.nome }} &mdash; {{ item.pet.nome }}
              <span
                v-if="item.pet.especie"
                class="text-xs font-normal text-gray-400"
                >({{ item.pet.especie }})</span
              >
            </p>
            <p class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              <UIcon name="i-lucide-user" class="inline size-3 mr-0.5" />
              {{ item.cliente.nome }}
              <span class="ml-2">
                <UIcon name="i-lucide-phone" class="inline size-3 mr-0.5" />
                {{ item.cliente.telefonePrincipal }}
              </span>
              <span
                class="ml-2 inline-flex items-center gap-0.5 text-xs font-semibold px-1.5 py-0.5 rounded-full"
                :class="
                  item.modalidade === 'PetshopBusca'
                    ? 'bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400'
                    : 'bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400'
                "
              >
                <UIcon
                  :name="
                    item.modalidade === 'PetshopBusca'
                      ? 'i-lucide-car'
                      : 'i-lucide-footprints'
                  "
                  class="inline size-3"
                />
                {{
                  item.modalidade === "PetshopBusca"
                    ? "Petshop busca"
                    : "Cliente traz"
                }}
              </span>
            </p>
            <p
              v-if="item.observacoes"
              class="text-xs text-gray-400 mt-0.5 italic"
            >
              {{ item.observacoes }}
            </p>
          </div>

          <!-- Badge de status -->
          <span
            class="text-xs font-semibold px-2.5 py-1 rounded-full shrink-0"
            :class="[
              statusConfig[item.status].bg,
              statusConfig[item.status].text,
            ]"
          >
            {{ statusConfig[item.status].label }}
          </span>

          <!-- Ações -->
          <div class="flex gap-1 shrink-0">
            <UButton
              v-if="item.status === 'Agendado'"
              icon="i-lucide-check"
              color="neutral"
              variant="ghost"
              size="xs"
              title="Confirmar"
              :loading="alterandoStatus === item.id"
              @click="alterarStatus(item.id, 'Confirmado')"
            />
            <UButton
              v-if="item.status === 'Confirmado'"
              icon="i-lucide-play"
              color="neutral"
              variant="ghost"
              size="xs"
              title="Iniciar Atendimento"
              :loading="alterandoStatus === item.id"
              @click="alterarStatus(item.id, 'EmAtendimento')"
            />
            <UButton
              v-if="item.status === 'EmAtendimento'"
              icon="i-lucide-check-check"
              color="neutral"
              variant="ghost"
              size="xs"
              title="Concluir"
              :loading="alterandoStatus === item.id"
              @click="alterarStatus(item.id, 'Concluido')"
            />
            <UButton
              v-if="item.status === 'Agendado' || item.status === 'Confirmado'"
              icon="i-lucide-x"
              color="neutral"
              variant="ghost"
              size="xs"
              title="Cancelar"
              :loading="alterandoStatus === item.id"
              @click="pedirCancelamento(item.id)"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Modal novo agendamento -->
    <UModal v-model:open="isModalOpen">
      <template #content>
        <UCard class="ring-0">
          <template #header>
            <div class="flex items-center justify-between">
              <h3 class="font-semibold text-gray-800 dark:text-gray-100">
                Novo Agendamento
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

          <div class="flex flex-col gap-3">
            <div class="grid grid-cols-2 gap-3">
              <UFormField label="Data *">
                <UInput v-model="novoForm.data" type="date" class="w-full" />
              </UFormField>
              <UFormField label="Hora *">
                <UInput v-model="novoForm.hora" type="time" class="w-full" />
              </UFormField>
            </div>

            <UFormField label="Serviço *">
              <USelect
                v-model="novoForm.servicoId"
                :items="servicos"
                :loading="servicosLoading"
                placeholder="Selecione o serviço"
                class="w-full"
              />
            </UFormField>

            <UFormField label="Cliente *">
              <USelect
                v-model="novoForm.clienteId"
                :items="clientes"
                :loading="clientesLoading"
                placeholder="Selecione o cliente"
                class="w-full"
                searchable
                search-placeholder="Buscar cliente..."
              />
            </UFormField>

            <UFormField label="Pet *">
              <USelect
                v-model="novoForm.petId"
                :items="petsDoCliente"
                :loading="petsLoading"
                :disabled="!novoForm.clienteId"
                :placeholder="
                  novoForm.clienteId
                    ? 'Selecione o pet'
                    : 'Selecione um cliente primeiro'
                "
                class="w-full"
              />
            </UFormField>

            <UFormField label="Modalidade">
              <div class="flex gap-2">
                <button
                  type="button"
                  class="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl border-2 text-sm font-semibold transition-all"
                  :class="
                    novoForm.modalidade === 'ClienteTraz'
                      ? 'border-[#0EA5E9] bg-sky-50 dark:bg-sky-900/20 text-[#0EA5E9]'
                      : 'border-gray-200 dark:border-neutral-600 text-gray-500 dark:text-gray-400 hover:border-gray-300'
                  "
                  @click="novoForm.modalidade = 'ClienteTraz'"
                >
                  <UIcon name="i-lucide-footprints" class="size-4" />
                  Cliente traz
                </button>
                <button
                  type="button"
                  class="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl border-2 text-sm font-semibold transition-all"
                  :class="
                    novoForm.modalidade === 'PetshopBusca'
                      ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/20 text-amber-600'
                      : 'border-gray-200 dark:border-neutral-600 text-gray-500 dark:text-gray-400 hover:border-gray-300'
                  "
                  @click="novoForm.modalidade = 'PetshopBusca'"
                >
                  <UIcon name="i-lucide-car" class="size-4" />
                  Petshop busca
                </button>
              </div>
            </UFormField>

            <UFormField label="Observações">
              <UTextarea
                v-model="novoForm.observacoes"
                placeholder="Observações opcionais..."
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
                :disabled="salvando"
                @click="isModalOpen = false"
              >
                Cancelar
              </UButton>
              <UButton
                color="secondary"
                :loading="salvando"
                @click="salvarAgendamento"
              >
                Salvar
              </UButton>
            </div>
          </template>
        </UCard>
      </template>
    </UModal>

    <!-- Modal confirmação de cancelamento -->
    <UModal v-model:open="confirmCancelOpen">
      <template #content>
        <UCard class="ring-0">
          <template #header>
            <div class="flex items-center gap-3">
              <div
                class="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/40 flex items-center justify-center shrink-0"
              >
                <UIcon
                  name="i-lucide-alert-triangle"
                  class="size-5 text-red-500"
                />
              </div>
              <h3 class="font-semibold text-gray-800 dark:text-gray-100">
                Cancelar agendamento
              </h3>
            </div>
          </template>

          <p class="text-sm text-gray-600 dark:text-gray-300">
            Tem certeza que deseja cancelar este agendamento? Esta ação não pode
            ser desfeita.
          </p>

          <template #footer>
            <div class="flex justify-end gap-2">
              <UButton
                color="neutral"
                variant="ghost"
                @click="confirmCancelOpen = false"
              >
                Voltar
              </UButton>
              <UButton
                color="error"
                :loading="alterandoStatus === agendamentoParaCancelar"
                @click="confirmarCancelamento"
              >
                Sim, cancelar
              </UButton>
            </div>
          </template>
        </UCard>
      </template>
    </UModal>
  </div>
</template>
