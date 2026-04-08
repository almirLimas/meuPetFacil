<script setup lang="ts">
import * as z from "zod";
import type { Pet } from "~/types/pet";
import { useClienteStore } from "~/stores/cliente";
import { useApi } from "~/composables/useApi";

definePageMeta({ ssr: false });

const route = useRoute();
const id = route.params.id as string;
const toast = useToast();

const clienteStore = useClienteStore();
const { apiFetch } = useApi();

const cliente = computed(() => clienteStore.buscarPorId(id));

const pending = ref(true);
onMounted(async () => {
  await clienteStore.buscarUm(id);
  pending.value = false;
});

const { set: setBreadcrumb } = useBreadcrumb();
watchEffect(() => {
  setBreadcrumb([
    { label: "Clientes", to: "/clientes" },
    { label: cliente.value?.nome ?? "...", to: `/clientes/${id}` },
    { label: "Editar" },
  ]);
});

watchEffect(() => {
  if (!pending.value && !cliente.value) navigateTo("/clientes");
});

// -- Esquema de validação combinado ------------------------------------------
const schema = z.object({
  nome: z
    .string()
    .min(3, "Informe o nome completo")
    .regex(
      /^[A-Za-zÀ-ÖØ-öø-ÿ\s'-]+$/,
      "Nome não pode conter números ou caracteres especiais",
    ),
  cpf: z
    .string()
    .nullish()
    .refine(
      (v) =>
        !v || v.replaceAll(/\D/g, "").length === 0 || useMask().isValidCpf(v),
      "CPF inválido",
    ),
  telefonePrincipal: z
    .string()
    .refine(
      (v) => [10, 11].includes(v.replaceAll(/\D/g, "").length),
      "Telefone inválido",
    ),
  email: z.string().email("E-mail inválido").or(z.literal("")).nullish(),
  cep: z.string().nullish(),
  rua: z.string().nullish(),
  numero: z.string().nullish(),
  bairro: z.string().nullish(),
  cidade: z.string().nullish(),
  estado: z.string().nullish(),
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
  mensalista: false,
  valorMensal: null as number | null,
  diaVencimento: null as number | null,
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
const tabIndex = ref<string>("0");
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
const PETS_TAB_INDEX = "3";

const stepPets = ref<{ editarPet: (idx: number) => void } | null>(null);

// Ao carregar, verifica se há ?petId na query para abrir o form de edição
const petIdQuery = useRoute().query.petId as string | undefined;
if (petIdQuery) {
  tabIndex.value = PETS_TAB_INDEX;
  // Remove o query param da URL sem recarregar a página
  if (import.meta.client) {
    const url = new URL(window.location.href);
    url.searchParams.delete("petId");
    window.history.replaceState(null, "", url.toString());
  }
  // Aguarda o cliente e o componente montarem antes de chamar editarPet
  watch(
    [cliente, stepPets],
    ([c, step]) => {
      if (!c || !step) return;
      const idx = (c.pets ?? []).findIndex((p) => p.id === petIdQuery);
      if (idx !== -1) nextTick(() => step.editarPet(idx));
    },
    { once: true },
  );
}

// -- Salvar pet imediato (ao editar pet na aba Pets) -------------------------
const salvarPetImediato = async (
  pet: Pet & { tamanho?: string; dataNascimento?: string },
) => {
  await apiFetch(`/pets/${pet.id}`, {
    method: "PATCH",
    body: {
      nome: pet.nome,
      especie: pet.especie,
      raca: pet.raca || undefined,
      sexo: pet.sexo || undefined,
      porte: pet.tamanho || pet.porte || undefined,
      dataNascimento: pet.dataNascimento || undefined,
      peso: pet.peso ? String(pet.peso) : undefined,
      observacoes: pet.observacoes || undefined,
    },
  });
  toast.add({ title: "Pet atualizado!", color: "success" });
};

// -- Salvar ------------------------------------------------------------------
const saving = ref(false);

const salvar = async () => {
  const result = schema.safeParse({ ...state });
  if (!result.success) {
    toast.add({
      title: "Campos obrigatórios",
      description:
        result.error.issues[0]?.message ??
        "Verifique os campos e tente novamente.",
      color: "error",
    });
    return;
  }

  saving.value = true;

  // Captura os pets ANTES de qualquer chamada async que possa resetar o state
  const petsSnapshot = [...(state.pets as Pet[])];

  try {
    const {
      pets: _pets,
      id: _id,
      codigo: _codigo,
      createdAt: _createdAt,
      updatedAt: _updatedAt,
      // @ts-expect-error campos extras do backend
      _count,
      // @ts-expect-error campos extras do backend
      tenantId: _tenantId,
      // @ts-expect-error campos extras do backend
      agendamentos: _agendamentos,
      // @ts-expect-error campos extras do backend
      ultimaMensalidadePaga: _ultimaMensalidadePaga,
      ...clienteData
    } = state as typeof state & {
      id?: string;
      codigo?: number;
      createdAt?: string;
      updatedAt?: string;
      _count?: unknown;
      tenantId?: string;
      agendamentos?: unknown;
    };
    await clienteStore.atualizar(id, clienteData);

    const pets = petsSnapshot;

    // Atualiza cada pet que já existe (tem id)
    const petsParaAtualizar = pets.filter((p) => p.id);
    // Cria pets novos (sem id)
    const petsNovos = pets.filter((p) => !p.id);

    await Promise.all([
      ...petsParaAtualizar.map((pet) =>
        apiFetch(`/pets/${pet.id}`, {
          method: "PATCH",
          body: {
            nome: pet.nome,
            especie: pet.especie,
            raca: pet.raca || undefined,
            sexo: pet.sexo || undefined,
            porte:
              (pet as Pet & { tamanho?: string }).tamanho ||
              pet.porte ||
              undefined,
            dataNascimento:
              (pet as Pet & { dataNascimento?: string }).dataNascimento ||
              undefined,
            peso: pet.peso ? String(pet.peso) : undefined,
            observacoes: pet.observacoes || undefined,
          },
        }),
      ),
      ...petsNovos.map((pet) =>
        apiFetch(`/pets`, {
          method: "POST",
          body: {
            clienteId: id,
            nome: pet.nome,
            especie: pet.especie ?? "Outro",
            raca: pet.raca || undefined,
            sexo: pet.sexo || undefined,
            porte:
              (pet as Pet & { tamanho?: string }).tamanho ||
              pet.porte ||
              undefined,
            dataNascimento:
              (pet as Pet & { dataNascimento?: string }).dataNascimento ||
              undefined,
            peso: pet.peso ? String(pet.peso) : undefined,
            observacoes: pet.observacoes || undefined,
          },
        }),
      ),
    ]);

    // Recarrega o cliente com pets atualizados antes de navegar
    await clienteStore.buscarUm(id);

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
  <!-- Skeleton de carregamento -->
  <div v-if="pending" class="flex flex-col gap-4">
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-3">
        <USkeleton class="h-8 w-8 rounded-md" />
        <div class="flex flex-col gap-1.5">
          <USkeleton class="h-5 w-32" />
          <USkeleton class="h-4 w-24" />
        </div>
      </div>
      <USkeleton class="h-9 w-36" />
    </div>
    <div class="flex gap-2">
      <USkeleton v-for="i in 4" :key="i" class="h-9 w-28 rounded-md" />
    </div>
    <UCard class="ring-0 shadow-sm">
      <div class="flex flex-col gap-4">
        <USkeleton v-for="i in 5" :key="i" class="h-10 w-full rounded-md" />
      </div>
    </UCard>
  </div>

  <!-- Conteúdo carregado -->
  <div v-else-if="cliente" class="flex flex-col gap-4">
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
    <UTabs v-model="tabIndex" :items="tabItems" class="w-full">
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
          <CadastroClienteStepPets
            ref="stepPets"
            v-model="state.pets"
            :on-save-pet="salvarPetImediato"
          />
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
