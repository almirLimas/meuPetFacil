<script setup lang="ts">
import * as z from "zod";
import { useApi } from "~/composables/useApi";
import {
  PET_ESPECIES,
  PET_TAMANHOS,
  PET_SEXOS,
  RACAS_POR_ESPECIE,
} from "~/types/pet";
import type { Pet, PetEspecie } from "~/types/pet";

const route = useRoute();
const petId = route.params.id as string;
const toast = useToast();
const { apiFetch } = useApi();

// -- Carrega o pet ---------------------------------------------------------
const pet = ref<Pet | null>(null);
const { pending } = await useAsyncData(`pet-${petId}`, async () => {
  pet.value = await apiFetch<Pet>(`/pets/${petId}`);
});

watchEffect(() => {
  if (!pending.value && !pet.value) navigateTo("/clientes");
});

// Breadcrumb
const { set: setBreadcrumb } = useBreadcrumb();
watchEffect(() => {
  if (!pet.value) return;
  setBreadcrumb([
    { label: "Clientes", to: "/clientes" },
    {
      label:
        (pet.value as Pet & { cliente?: { nome: string } }).cliente?.nome ??
        "Cliente",
      to: `/clientes/${pet.value.clienteId}`,
    },
    { label: pet.value.nome },
  ]);
});

// -- Estado do form --------------------------------------------------------
const state = reactive({
  nome: "",
  especie: "Cão" as PetEspecie,
  raca: "",
  sexo: undefined as string | undefined,
  tamanho: undefined as string | undefined,
  dataNascimento: "",
  peso: "",
  observacoes: "",
});

watch(
  pet,
  (p) => {
    if (!p) return;
    state.nome = p.nome ?? "";
    state.especie = (p.especie as PetEspecie) ?? "Cão";
    state.raca = p.raca ?? "";
    state.sexo = p.sexo ?? undefined;
    state.tamanho =
      (p as Pet & { porte?: string }).porte ?? p.tamanho ?? undefined;
    state.dataNascimento = p.dataNascimento ?? "";
    state.peso = p.peso ?? "";
    state.observacoes = p.observacoes ?? "";
  },
  { immediate: true },
);

// -- Raças por espécie, limpa ao trocar espécie ----------------------------
const racasDisponiveis = computed(
  () => RACAS_POR_ESPECIE[state.especie ?? "Cão"],
);
watch(
  () => state.especie,
  (_, old) => {
    if (old) state.raca = "";
  },
);

// -- Validação -------------------------------------------------------------
const schema = z.object({
  nome: z.string().min(1, "Informe o nome do pet"),
  raca: z.string().min(1, "Selecione a raça"),
});
const fieldErrors = reactive<{ nome?: string; raca?: string }>({});

// -- Salvar ----------------------------------------------------------------
const saving = ref(false);

const salvar = async () => {
  const result = schema.safeParse(state);
  fieldErrors.nome = undefined;
  fieldErrors.raca = undefined;
  if (!result.success) {
    result.error.issues.forEach((e) => {
      const f = e.path[0] as keyof typeof fieldErrors;
      if (f in fieldErrors || f === "nome" || f === "raca")
        fieldErrors[f] = e.message;
    });
    return;
  }

  saving.value = true;
  try {
    await apiFetch(`/pets/${petId}`, {
      method: "PATCH",
      body: {
        nome: state.nome,
        especie: state.especie,
        raca: state.raca || undefined,
        sexo: state.sexo || undefined,
        porte: state.tamanho || undefined,
        dataNascimento: state.dataNascimento || undefined,
        peso: state.peso ? String(state.peso) : undefined,
        observacoes: state.observacoes || undefined,
      },
    });
    toast.add({ title: "Pet atualizado!", color: "success" });
    navigateTo(`/clientes/${pet.value?.clienteId}`);
  } catch {
    toast.add({ title: "Erro ao salvar", color: "error" });
  } finally {
    saving.value = false;
  }
};
</script>

<template>
  <div v-if="pet" class="flex flex-col gap-4 max-w-2xl mx-auto">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-3">
        <UButton
          color="neutral"
          variant="ghost"
          leading-icon="i-lucide-arrow-left"
          @click="navigateTo(`/clientes/${pet.clienteId}`)"
        />
        <div>
          <h1 class="text-lg font-bold text-gray-800 dark:text-gray-100">
            Editar pet
          </h1>
          <p class="text-sm text-gray-500 dark:text-gray-400">{{ pet.nome }}</p>
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

    <!-- Form -->
    <UCard class="ring-0 shadow-sm">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <!-- Espécie -->
        <UFormField label="Espécie" name="especie">
          <USelect
            v-model="state.especie"
            :items="PET_ESPECIES"
            class="w-full"
          />
        </UFormField>

        <!-- Nome -->
        <UFormField
          label="Nome do pet"
          name="nome"
          required
          :error="fieldErrors.nome"
        >
          <UInput v-model="state.nome" placeholder="Rex" class="w-full" />
        </UFormField>

        <!-- Raça -->
        <UFormField label="Raça" name="raca" required :error="fieldErrors.raca">
          <USelect
            v-model="state.raca"
            :items="racasDisponiveis"
            placeholder="Selecione a raça..."
            class="w-full"
          />
        </UFormField>

        <!-- Sexo -->
        <UFormField label="Sexo" name="sexo">
          <USelect
            v-model="state.sexo"
            :items="PET_SEXOS"
            value-key="value"
            placeholder="Selecione..."
            class="w-full"
          />
        </UFormField>

        <!-- Tamanho -->
        <UFormField label="Tamanho" name="tamanho">
          <USelect
            v-model="state.tamanho"
            :items="PET_TAMANHOS"
            value-key="value"
            placeholder="Selecione..."
            class="w-full"
          />
        </UFormField>

        <!-- Nasc. / Idade -->
        <UFormField label="Nasc. / Idade" name="dataNascimento">
          <UInput
            v-model="state.dataNascimento"
            placeholder="2 anos ou 12/03/2022"
            class="w-full"
          />
        </UFormField>

        <!-- Peso -->
        <UFormField label="Peso (kg)" name="peso">
          <UInput
            v-model="state.peso"
            placeholder="4.5"
            type="number"
            class="w-full"
          />
        </UFormField>

        <!-- Observações -->
        <UFormField
          label="Observações"
          name="observacoes"
          class="md:col-span-2"
        >
          <UTextarea
            v-model="state.observacoes"
            placeholder="Alergias, comportamento..."
            class="w-full"
            :rows="3"
          />
        </UFormField>
      </div>
    </UCard>
  </div>

  <!-- Loading / não encontrado -->
  <div
    v-else
    class="flex flex-col items-center justify-center py-20 text-gray-400"
  >
    <UIcon name="i-lucide-paw-print" class="text-5xl mb-4" />
    <p class="text-lg font-medium">Pet não encontrado</p>
    <UButton class="mt-4" @click="navigateTo('/clientes')">
      Voltar para Clientes
    </UButton>
  </div>
</template>
