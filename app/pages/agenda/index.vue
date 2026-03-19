<script setup lang="ts">
import type { Agendamento, StatusAgendamento } from "~/types/agendamento";

const agenda = useMockAgenda();
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

// -- Agendamentos do dia filtrados -------------------------------------------
const busca = ref("");

const agendamentosDoDia = computed(() =>
  agenda.value
    .filter((a) => a.data === selectedDate.value)
    .filter(
      (a) =>
        !busca.value ||
        a.pet.toLowerCase().includes(busca.value.toLowerCase()) ||
        a.dono.toLowerCase().includes(busca.value.toLowerCase()) ||
        a.servico.toLowerCase().includes(busca.value.toLowerCase()),
    )
    .sort((a, b) => a.hora.localeCompare(b.hora)),
);

// -- Resumo do dia -----------------------------------------------------------
const resumoDia = computed(() => {
  const todos = agenda.value.filter((a) => a.data === selectedDate.value);
  return {
    total: todos.length,
    agendados: todos.filter((a) => a.status === "agendado").length,
    concluidos: todos.filter((a) => a.status === "concluido").length,
    cancelados: todos.filter((a) => a.status === "cancelado").length,
  };
});

// -- Status config -----------------------------------------------------------
const statusConfig: Record<
  StatusAgendamento,
  { label: string; bg: string; text: string }
> = {
  agendado: {
    label: "Agendado",
    bg: "bg-blue-100 dark:bg-blue-900/40",
    text: "text-blue-600 dark:text-blue-400",
  },
  concluido: {
    label: "Concluído",
    bg: "bg-green-100 dark:bg-green-900/40",
    text: "text-green-600 dark:text-green-400",
  },
  cancelado: {
    label: "Cancelado",
    bg: "bg-gray-100 dark:bg-neutral-700",
    text: "text-gray-500 dark:text-gray-400",
  },
};

// -- Ações de status ---------------------------------------------------------
const alterarStatus = (id: string, status: StatusAgendamento) => {
  const item = agenda.value.find((a) => a.id === id);
  if (item) item.status = status;
};

// -- Modal novo agendamento --------------------------------------------------
const isModalOpen = ref(false);

const servicosCadastrados = useMockServicos();
const SERVICOS = computed(() => [
  ...new Set(
    servicosCadastrados.value.filter((s) => s.ativo).map((s) => s.nome),
  ),
]);

const novoForm = reactive({
  data: today,
  hora: "",
  servico: "",
  pet: "",
  dono: "",
  telefone: "",
  observacoes: "",
});

watch(isModalOpen, (open) => {
  if (open) novoForm.data = selectedDate.value;
});

const salvarAgendamento = () => {
  if (
    !novoForm.data ||
    !novoForm.hora ||
    !novoForm.servico ||
    !novoForm.pet ||
    !novoForm.dono
  ) {
    toast.add({
      title: "Preencha todos os campos obrigatórios",
      color: "error",
    });
    return;
  }

  const novo: Agendamento = {
    id: Date.now().toString(),
    data: novoForm.data,
    hora: novoForm.hora,
    servico: novoForm.servico,
    pet: novoForm.pet,
    dono: novoForm.dono,
    telefone: novoForm.telefone || undefined,
    observacoes: novoForm.observacoes || undefined,
    status: "agendado",
  };

  agenda.value.push(novo);
  isModalOpen.value = false;
  selectedDate.value = novoForm.data;
  toast.add({ title: "Agendamento criado com sucesso!", color: "success" });

  Object.assign(novoForm, {
    data: selectedDate.value,
    hora: "",
    servico: "",
    pet: "",
    dono: "",
    telefone: "",
    observacoes: "",
  });
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
            bg: '#E0F0FF',
            color: '#4AADE8',
          },
          {
            label: 'Agendados',
            value: resumoDia.agendados,
            icon: 'i-lucide-clock',
            bg: '#E0F0FF',
            color: '#4AADE8',
          },
          {
            label: 'Concluídos',
            value: resumoDia.concluidos,
            icon: 'i-lucide-check-circle',
            bg: '#E0FBF0',
            color: '#5CC86B',
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

      <!-- Empty state -->
      <div
        v-if="agendamentosDoDia.length === 0"
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
            <span class="text-sm font-bold text-gray-700 dark:text-gray-200">{{
              item.hora
            }}</span>
          </div>

          <!-- Ícone do serviço -->
          <div
            class="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
            style="background-color: #e0f0ff"
          >
            <UIcon
              name="i-lucide-scissors"
              class="size-4"
              style="color: #4aade8"
            />
          </div>

          <!-- Info -->
          <div class="flex-1 min-w-0">
            <p class="text-sm font-semibold text-gray-800 dark:text-gray-100">
              {{ item.servico }} — {{ item.pet }}
            </p>
            <p class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              <UIcon name="i-lucide-user" class="inline size-3 mr-0.5" />{{
                item.dono
              }}
              <span v-if="item.telefone" class="ml-2">
                <UIcon name="i-lucide-phone" class="inline size-3 mr-0.5" />{{
                  item.telefone
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
              v-if="item.status === 'agendado'"
              icon="i-lucide-check"
              color="neutral"
              variant="ghost"
              size="xs"
              title="Marcar como concluído"
              @click="alterarStatus(item.id, 'concluido')"
            />
            <UButton
              v-if="item.status === 'agendado'"
              icon="i-lucide-x"
              color="neutral"
              variant="ghost"
              size="xs"
              title="Cancelar agendamento"
              @click="alterarStatus(item.id, 'cancelado')"
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
                v-model="novoForm.servico"
                :items="SERVICOS"
                placeholder="Selecione o serviço"
                class="w-full"
              />
            </UFormField>

            <div class="grid grid-cols-2 gap-3">
              <UFormField label="Pet *">
                <UInput
                  v-model="novoForm.pet"
                  placeholder="Nome do pet"
                  class="w-full"
                />
              </UFormField>
              <UFormField label="Dono *">
                <UInput
                  v-model="novoForm.dono"
                  placeholder="Nome do dono"
                  class="w-full"
                />
              </UFormField>
            </div>

            <UFormField label="Telefone">
              <UInput
                v-model="novoForm.telefone"
                placeholder="(00) 00000-0000"
                class="w-full"
              />
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
                @click="isModalOpen = false"
                >Cancelar</UButton
              >
              <UButton color="secondary" @click="salvarAgendamento"
                >Salvar</UButton
              >
            </div>
          </template>
        </UCard>
      </template>
    </UModal>
  </div>
</template>
