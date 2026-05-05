<script setup lang="ts">
import * as z from "zod";
import type { Pet, PetFormState } from "~/types/pet";
import type { PacoteServico, PacoteClienteAtivo } from "~/types/pacote";
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
  // Carrega pacotes após ter o cliente
  loadingPacotes.value = true;
  try {
    const [pacotes, templates] = await Promise.all([
      fetchPacotesCliente(id),
      fetchAll(true),
    ]);
    pacotesCliente.value = pacotes;
    pacoteTemplates.value = templates;
  } finally {
    loadingPacotes.value = false;
  }
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
  { label: "Pacotes", icon: "i-lucide-ticket", slot: "pacotes" as const },
];
const PETS_TAB_INDEX = "3";

const stepPets = ref<{ editarPet: (idx: number) => void } | null>(null);

// Ao carregar, verifica se há ?petId na query para abrir o form de edição
const petIdQuery = useRoute().query.petId as string | undefined;
if (petIdQuery) {
  tabIndex.value = PETS_TAB_INDEX;
  // Remove o query param da URL sem recarregar a página
  if (import.meta.client) {
    const url = new URL(globalThis.location.href);
    url.searchParams.delete("petId");
    globalThis.history.replaceState(null, "", url.toString());
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
const salvarPetImediato = async (pet: PetFormState & { id?: string }) => {
  await apiFetch(`/pets/${pet.id}`, {
    method: "PATCH",
    body: {
      nome: pet.nome,
      especie: pet.especie,
      raca: pet.raca || undefined,
      sexo: pet.sexo || undefined,
      porte: pet.tamanho || undefined,
      dataNascimento: pet.dataNascimento || undefined,
      peso: pet.peso ? String(pet.peso) : undefined,
      observacoes: pet.observacoes || undefined,
    },
  });
  toast.add({ title: "Pet atualizado!", color: "success" });
};

// -- Pacotes -----------------------------------------------------------------
const {
  fetchPacotesCliente,
  ativar: ativarPacote,
  registrarUso: registrarUsoPacote,
  cancelar: cancelarPacote,
  fetchAll,
} = usePacotes();

const pacotesCliente = ref<PacoteClienteAtivo[]>([]);
const pacoteTemplates = ref<PacoteServico[]>([]);
const loadingPacotes = ref(false);
const isModalAtivarOpen = ref(false);
const loadingAtivar = ref(false);
const formAtivar = reactive({ pacoteId: "", petId: "" });

const opcoesTemplates = computed(() =>
  pacoteTemplates.value.map((p) => ({
    label: `${p.nome} — ${Number(p.valor).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })} (${p.totalSessoes}x/${p.validadeDias}d)`,
    value: p.id,
  })),
);

const opcoesPets = computed(() => [
  { label: "Sem pet específico", value: "" },
  ...(cliente.value?.pets ?? []).map((p) => ({ label: p.nome, value: p.id })),
]);

const abrirModalAtivar = () => {
  formAtivar.pacoteId = opcoesTemplates.value[0]?.value ?? "";
  formAtivar.petId = "";
  isModalAtivarOpen.value = true;
};

const salvarAtivar = async () => {
  if (!formAtivar.pacoteId) return;
  loadingAtivar.value = true;
  try {
    const novo = await ativarPacote({
      pacoteId: formAtivar.pacoteId,
      clienteId: id,
      petId: formAtivar.petId || undefined,
    });
    pacotesCliente.value.unshift(novo);
    isModalAtivarOpen.value = false;
    toast.add({ title: "Pacote ativado!", color: "success" });
  } catch (e: any) {
    toast.add({
      title: e?.data?.message ?? "Erro ao ativar pacote",
      color: "error",
    });
  } finally {
    loadingAtivar.value = false;
  }
};

const usarSessao = async (pacoteClienteId: string) => {
  try {
    const updated = await registrarUsoPacote(pacoteClienteId);
    const idx = pacotesCliente.value.findIndex((p) => p.id === pacoteClienteId);
    if (idx !== -1) pacotesCliente.value[idx] = updated;
    toast.add({ title: "Sessão registrada!", color: "success" });
  } catch (e: any) {
    toast.add({
      title: e?.data?.message ?? "Erro ao registrar sessão",
      color: "error",
    });
  }
};

const cancelarPacoteCliente = async (pacoteClienteId: string) => {
  try {
    const updated = await cancelarPacote(pacoteClienteId);
    const idx = pacotesCliente.value.findIndex((p) => p.id === pacoteClienteId);
    if (idx !== -1) pacotesCliente.value[idx] = updated;
    toast.add({ title: "Pacote cancelado", color: "neutral" });
  } catch (e: any) {
    toast.add({
      title: e?.data?.message ?? "Erro ao cancelar",
      color: "error",
    });
  }
};

const formatPreco = (v: number) =>
  Number(v).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const statusPacoteBadge = (p: PacoteClienteAtivo) => {
  if (p.status === "Cancelado")
    return { label: "Cancelado", color: "error" as const };
  if (p.status === "Expirado")
    return { label: "Expirado", color: "neutral" as const };
  const dias = Math.max(
    0,
    Math.ceil(
      (new Date(p.expiraEm).getTime() - Date.now()) / (1000 * 60 * 60 * 24),
    ),
  );
  if (dias <= 3)
    return { label: `Vence em ${dias}d`, color: "warning" as const };
  return { label: "Ativo", color: "success" as const };
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
      _count,
      tenantId: _tenantId,
      agendamentos: _agendamentos,
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
      ultimaMensalidadePaga?: string | null;
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
            porte: pet.tamanho || undefined,
            dataNascimento: pet.dataNascimento || undefined,
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
            porte: pet.tamanho || undefined,
            dataNascimento: pet.dataNascimento || undefined,
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
          <h1 class="text-lg font-bold text-gray-800 dark:text-gray-100">
            Editar cliente
          </h1>
          <p class="text-sm text-gray-500 dark:text-gray-400">
            {{ cliente.nome }}
          </p>
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
        <UCard class="ring-0 shadow-sm mt-2">
          <CadastroClienteStepDadosPessoais v-model="state" />
        </UCard>
      </template>

      <template #endereco>
        <UCard class="ring-0 shadow-sm mt-2">
          <CadastroClienteStepEndereco v-model="state" />
        </UCard>
      </template>

      <template #info>
        <UCard class="ring-0 shadow-sm mt-2">
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

      <template #pacotes>
        <div class="mt-2 flex flex-col gap-4">
          <div class="flex items-center justify-between">
            <p class="text-sm text-gray-500 dark:text-gray-400">
              {{ pacotesCliente.filter((p) => p.status === "Ativo").length }}
              pacote(s) ativo(s)
            </p>
            <UButton
              icon="i-lucide-plus"
              size="sm"
              color="primary"
              label="Ativar pacote"
              :disabled="pacoteTemplates.length === 0"
              @click="abrirModalAtivar"
            />
          </div>

          <div v-if="loadingPacotes" class="flex justify-center py-10">
            <UIcon
              name="i-lucide-loader-circle"
              class="animate-spin text-2xl text-primary"
            />
          </div>

          <div
            v-else-if="pacotesCliente.length === 0"
            class="flex flex-col items-center justify-center gap-2 py-12 text-center text-gray-400 dark:text-gray-500 bg-white dark:bg-neutral-800 rounded-xl border border-dashed border-gray-200 dark:border-neutral-700"
          >
            <UIcon name="i-lucide-ticket" class="text-4xl" />
            <p class="text-sm font-medium">Nenhum pacote ativado</p>
            <UButton
              v-if="pacoteTemplates.length > 0"
              variant="ghost"
              size="sm"
              label="Ativar primeiro pacote"
              @click="abrirModalAtivar"
            />
            <p v-else class="text-xs">
              Crie pacotes em
              <NuxtLink to="/pacotes" class="text-primary underline"
                >Pacotes</NuxtLink
              >
            </p>
          </div>

          <div v-else class="flex flex-col gap-3">
            <div
              v-for="p in pacotesCliente"
              :key="p.id"
              class="rounded-xl border border-gray-100 dark:border-neutral-700 bg-white dark:bg-neutral-800 p-4 shadow-sm flex flex-col gap-3"
            >
              <div class="flex items-center justify-between gap-2 flex-wrap">
                <div>
                  <p
                    class="font-semibold text-sm text-gray-800 dark:text-gray-100"
                  >
                    {{ p.pacote?.nome ?? "Pacote" }}
                  </p>
                  <p class="text-xs text-gray-400 mt-0.5">
                    {{ formatPreco(p.valor) }}
                    <span v-if="p.pet"> · {{ p.pet.nome }}</span>
                    · Vence
                    {{ new Date(p.expiraEm).toLocaleDateString("pt-BR") }}
                  </p>
                </div>
                <UBadge
                  v-bind="statusPacoteBadge(p)"
                  variant="subtle"
                  size="sm"
                />
              </div>

              <div class="flex flex-col gap-1">
                <div class="flex justify-between text-xs text-gray-400">
                  <span>Sessões usadas</span>
                  <span>{{ p.sessoesUsadas }} / {{ p.totalSessoes }}</span>
                </div>
                <UProgress
                  :value="
                    p.totalSessoes > 0
                      ? Math.round(
                          ((p.sessoesUsadas ?? 0) / p.totalSessoes) * 100,
                        )
                      : 0
                  "
                  :color="
                    p.sessoesUsadas >= p.totalSessoes ? 'neutral' : 'primary'
                  "
                  animation="none"
                  size="sm"
                />
              </div>

              <div v-if="p.status === 'Ativo'" class="flex gap-2">
                <UButton
                  icon="i-lucide-circle-plus"
                  size="xs"
                  color="primary"
                  variant="soft"
                  label="Registrar uso"
                  :disabled="p.sessoesUsadas >= p.totalSessoes"
                  @click="usarSessao(p.id)"
                />
                <UButton
                  icon="i-lucide-x-circle"
                  size="xs"
                  color="error"
                  variant="ghost"
                  label="Cancelar"
                  @click="cancelarPacoteCliente(p.id)"
                />
              </div>
            </div>
          </div>
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

  <!-- Modal ativar pacote -->
  <UModal
    v-model:open="isModalAtivarOpen"
    title="Ativar pacote para este cliente"
  >
    <template #body>
      <div class="flex flex-col gap-4">
        <UFormField label="Pacote">
          <USelect
            v-model="formAtivar.pacoteId"
            :items="opcoesTemplates"
            value-key="value"
            label-key="label"
            class="w-full"
          />
        </UFormField>
      </div>
    </template>
    <template #footer>
      <div class="flex justify-end gap-3">
        <UButton
          variant="ghost"
          color="neutral"
          label="Cancelar"
          @click="isModalAtivarOpen = false"
        />
        <UButton
          color="primary"
          label="Ativar"
          :loading="loadingAtivar"
          @click="salvarAtivar"
        />
      </div>
    </template>
  </UModal>
</template>
