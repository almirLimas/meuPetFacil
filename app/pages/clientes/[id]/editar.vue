<script setup lang="ts">
import type { Pet } from "~/types/pet";

const route = useRoute();
const id = route.params.id as string;
const toast = useToast();

const clientes = useMockClientes();
const clienteIdx = computed(() => clientes.value.findIndex((c) => c.id === id));
const cliente = computed(() =>
  clienteIdx.value === -1 ? null : clientes.value[clienteIdx.value],
);

onMounted(() => {
  if (!cliente.value) navigateTo("/clientes");
});

// -- Estado pré-preenchido ---------------------------------------------------
const state = reactive({
  nome: "",
  cpf: "",
  telefonePrincipal: "",
  telefoneSecundario: "",
  email: "",
  cep: "",
  rua: "",
  numero: "",
  complemento: "",
  bairro: "",
  cidade: "",
  estado: "",
  dataNascimento: "",
  comoConheceu: "",
  observacoes: "",
  status: "Ativo",
  pets: [] as Pet[],
});

watch(
  cliente,
  (c) => {
    if (c) Object.assign(state, { ...c });
  },
  { immediate: true },
);

// -- Tabs --------------------------------------------------------------------
const tabItems = [
  { label: "Dados pessoais", icon: "i-lucide-user", slot: "dados" as const },
  { label: "Endereço", icon: "i-lucide-map-pin", slot: "endereco" as const },
  {
    label: "Informações",
    icon: "i-lucide-clipboard-list",
    slot: "info" as const,
  },
  { label: "Pets", icon: "i-lucide-paw-print", slot: "pets" as const },
];

// -- Refs dos steps ----------------------------------------------------------
const stepDados = ref();
const stepEndereco = ref();
const stepInfo = ref();
const stepPets = ref();

// -- Salvar ------------------------------------------------------------------
const saving = ref(false);

const salvar = async () => {
  // Valida apenas os 3 primeiros steps (pets é opcional)
  const valids = [
    stepDados.value?.validate(),
    stepEndereco.value?.validate(),
    stepInfo.value?.validate(),
  ];

  if (!valids.every(Boolean)) {
    toast.add({
      title: "Campos obrigatórios",
      description:
        "Verifique as abas com erro e preencha os campos obrigatórios.",
      color: "error",
    });
    return;
  }

  saving.value = true;

  // Preserva ids dos pets já existentes, gera para os novos
  const petsAtualizados: Pet[] = state.pets.map((p) => ({
    ...p,
    id: p.id ?? crypto.randomUUID(),
    clienteId: id,
    createdAt: p.createdAt ?? new Date().toISOString(),
  }));

  if (clienteIdx.value !== -1) {
    const atual = clientes.value[clienteIdx.value]!;
    clientes.value[clienteIdx.value] = {
      ...atual,
      ...state,
      pets: petsAtualizados,
      id: atual.id,
      createdAt: atual.createdAt,
      updatedAt: new Date().toISOString(),
    };
  }

  saving.value = false;

  toast.add({
    title: "Cliente atualizado!",
    color: "success",
  });

  navigateTo(`/clientes/${id}`);
};
</script>

<template>
  <div v-if="cliente" class="flex flex-col gap-4">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-3">
        <UButton
          color="neutral"
          variant="ghost"
          leading-icon="i-lucide-arrow-left"
          @click="navigateTo(`/clientes/${id}`)"
        />
        <div>
          <h1 class="text-lg font-bold text-gray-800">Editar cliente</h1>
          <p class="text-sm text-gray-500">{{ cliente.nome }}</p>
        </div>
      </div>
      <UButton
        color="secondary"
        leading-icon="i-lucide-save"
        :loading="saving"
        @click="salvar"
      >
        Salvar alterações
      </UButton>
    </div>

    <!-- Tabs com steps reutilizados -->
    <UTabs :items="tabItems" class="w-full">
      <template #dados>
        <UCard class="bg-white! ring-0 shadow-sm mt-2">
          <CadastroClienteStepDadosPessoais ref="stepDados" v-model="state" />
        </UCard>
      </template>

      <template #endereco>
        <UCard class="bg-white! ring-0 shadow-sm mt-2">
          <CadastroClienteStepEndereco ref="stepEndereco" v-model="state" />
        </UCard>
      </template>

      <template #info>
        <UCard class="bg-white! ring-0 shadow-sm mt-2">
          <CadastroClienteStepInformacoes ref="stepInfo" v-model="state" />
        </UCard>
      </template>

      <template #pets>
        <div class="mt-2">
          <CadastroClienteStepPets ref="stepPets" v-model="state.pets" />
        </div>
      </template>
    </UTabs>
  </div>

  <!-- Não encontrado -->
  <div
    v-else
    class="flex flex-col items-center justify-center py-20 text-gray-400"
  >
    <UIcon name="i-lucide-user-x" class="text-5xl mb-4" />
    <p class="text-lg font-medium">Cliente não encontrado</p>
    <UButton class="mt-4" @click="navigateTo('/clientes')">
      Voltar para Clientes
    </UButton>
  </div>
</template>
