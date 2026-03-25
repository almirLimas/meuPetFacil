<script setup lang="ts">
import * as z from "zod";
import type { Pet } from "~/types/pet";
import { useClienteStore } from "~/stores/cliente";

const route = useRoute();
const id = route.params.id as string;
const toast = useToast();

const clienteStore = useClienteStore();

// Garante que o cliente está carregado
await useAsyncData(`cliente-edit-${id}`, async () => {
  if (!clienteStore.buscarPorId(id)) await clienteStore.listar();
});

const cliente = computed(() => clienteStore.buscarPorId(id));

watchEffect(() => {
  if (!cliente.value) navigateTo("/clientes");
});

// -- Esquema de validação combinado ------------------------------------------
const schema = z.object({
  nome: z.string().min(3, "Informe o nome completo"),
  cpf: z.string().refine((v) => useMask().isValidCpf(v), "CPF inválido"),
  telefonePrincipal: z
    .string()
    .refine(
      (v) => [10, 11].includes(v.replaceAll(/\D/g, "").length),
      "Telefone inválido",
    ),
  email: z.string().email("E-mail inválido").or(z.literal("")).optional(),
  cep: z.string().min(8, "CEP inválido"),
  rua: z.string().min(1, "Informe a rua"),
  numero: z.string().min(1, "Informe o número"),
  bairro: z.string().min(1, "Informe o bairro"),
  cidade: z.string().min(1, "Informe a cidade"),
  estado: z.string().min(2, "Informe o estado"),
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

// -- Salvar ------------------------------------------------------------------
const saving = ref(false);

const salvar = async () => {
  const result = schema.safeParse(state);
  if (!result.success) {
    toast.add({
      title: "Campos obrigatórios",
      description:
        result.error.errors[0]?.message ??
        "Verifique os campos e tente novamente.",
      color: "error",
    });
    return;
  }

  saving.value = true;

  try {
    const {
      pets: _pets,
      id: _id,
      codigo: _codigo,
      createdAt: _createdAt,
      updatedAt: _updatedAt,
      // @ts-expect-error _count vem do backend mas não existe no tipo
      _count,
      ...clienteData
    } = state as typeof state & {
      id?: string;
      codigo?: number;
      createdAt?: string;
      updatedAt?: string;
      _count?: unknown;
    };
    await clienteStore.atualizar(id, clienteData);
    toast.add({ title: "Cliente atualizado!", color: "success" });
    navigateTo(`/clientes/${id}`);
  } catch {
    toast.add({
      title: "Erro ao salvar",
      description: "Tente novamente em instantes.",
      color: "error",
    });
  } finally {
    saving.value = false;
  }
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
          <CadastroClienteStepDadosPessoais v-model="state" />
        </UCard>
      </template>

      <template #endereco>
        <UCard class="bg-white! ring-0 shadow-sm mt-2">
          <CadastroClienteStepEndereco v-model="state" />
        </UCard>
      </template>

      <template #info>
        <UCard class="bg-white! ring-0 shadow-sm mt-2">
          <CadastroClienteStepInformacoes v-model="state" />
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
