<script setup lang="ts">
import * as z from "zod";
import type { PetFormState, PetEspecie } from "~/types/pet";
import {
  PET_ESPECIES,
  PET_TAMANHOS,
  PET_SEXOS,
  RACAS_POR_ESPECIE,
} from "~/types/pet";

const pets = defineModel<PetFormState[]>({ required: true });

const showForm = ref(false);
const semPetErro = ref(false);

const emptyPet = (): PetFormState => ({
  nome: "",
  raca: "",
  especie: "Cão",
  sexo: undefined,
  tamanho: undefined,
  idade: "",
  peso: "",
  observacoes: "",
});

const formPet = reactive<PetFormState>(emptyPet());

// Raças disponíveis de acordo com a espécie selecionada
const racasDisponiveis = computed(
  () => RACAS_POR_ESPECIE[(formPet.especie as PetEspecie) ?? "Cão"],
);

// Ao trocar espécie, limpa raça
watch(
  () => formPet.especie,
  () => {
    formPet.raca = "";
  },
);

const schema = z.object({
  nome: z.string().min(1, "Informe o nome do pet"),
  raca: z.string().min(1, "Selecione a raça"),
});

const fieldErrors = reactive({ nome: "", raca: "" });

const validateForm = (): boolean => {
  const result = schema.safeParse(formPet);
  fieldErrors.nome = "";
  fieldErrors.raca = "";
  if (!result.success) {
    result.error.issues.forEach((e) => {
      const field = e.path[0] as keyof typeof fieldErrors;
      if (field in fieldErrors) fieldErrors[field] = e.message;
    });
    return false;
  }
  return true;
};

const addPet = () => {
  if (!validateForm()) return;
  pets.value.push({ ...formPet });
  Object.assign(formPet, emptyPet());
  showForm.value = false;
  semPetErro.value = false;
};

const removePet = (index: number) => {
  pets.value.splice(index, 1);
};

const cancelForm = () => {
  Object.assign(formPet, emptyPet());
  fieldErrors.nome = "";
  fieldErrors.raca = "";
  showForm.value = false;
};

// Pet obrigatório — ao menos 1 pet deve ser adicionado
defineExpose({
  validate: (): boolean => {
    if (pets.value.length === 0) {
      semPetErro.value = true;
      return false;
    }
    return true;
  },
});
</script>

<template>
  <div class="flex flex-col gap-4">
    <!-- Pets já adicionados -->
    <div v-if="pets.length > 0" class="flex flex-col gap-3">
      <div
        v-for="(pet, idx) in pets"
        :key="idx"
        class="flex items-center justify-between p-4 rounded-xl border border-gray-200 bg-gray-50"
      >
        <div class="flex items-center gap-3">
          <div
            class="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
            style="background: #ffe0ec"
          >
            <UIcon name="i-lucide-paw-print" class="text-[#E85A8A] text-base" />
          </div>
          <div>
            <p class="font-semibold text-gray-800 text-sm">{{ pet.nome }}</p>
            <div
              class="flex items-center gap-1.5 text-xs text-gray-500 flex-wrap mt-0.5"
            >
              <span>{{ pet.raca }}</span>
              <span v-if="pet.especie">· {{ pet.especie }}</span>
              <span v-if="pet.tamanho">· {{ pet.tamanho }}</span>
              <span v-if="pet.idade">· {{ pet.idade }}</span>
              <span v-if="pet.peso">· {{ pet.peso }} kg</span>
            </div>
          </div>
        </div>
        <UButton
          icon="i-lucide-trash-2"
          color="error"
          variant="ghost"
          size="xs"
          @click="removePet(idx)"
        />
      </div>
    </div>

    <!-- Empty state -->
    <div
      v-else-if="!showForm"
      class="flex flex-col items-center justify-center gap-2 py-10 text-center rounded-xl border-2 border-dashed"
      :class="
        semPetErro
          ? 'border-red-300 bg-red-50'
          : 'border-gray-200 text-gray-400'
      "
    >
      <UIcon
        name="i-lucide-paw-print"
        class="text-4xl"
        :class="semPetErro ? 'text-red-400' : 'text-gray-300'"
      />
      <p
        class="text-sm font-medium"
        :class="semPetErro ? 'text-red-600' : 'text-gray-500'"
      >
        Nenhum pet adicionado
      </p>
      <p
        class="text-xs"
        :class="semPetErro ? 'text-red-500 font-semibold' : 'text-gray-400'"
      >
        {{
          semPetErro
            ? "Adicione pelo menos 1 pet para continuar"
            : "Adicione o(s) pet(s) do cliente"
        }}
      </p>
    </div>

    <!-- Formulário inline de adição -->
    <div
      v-if="showForm"
      class="rounded-xl border border-gray-200 p-4 flex flex-col gap-4 bg-white"
    >
      <p class="text-sm font-semibold text-gray-700">Novo pet</p>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <!-- Espécie -->
        <UFormField label="Espécie" name="especie">
          <USelect
            v-model="formPet.especie"
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
          <UInput v-model="formPet.nome" placeholder="Rex" class="w-full" />
        </UFormField>

        <!-- Raça -->
        <UFormField label="Raça" name="raca" required :error="fieldErrors.raca">
          <USelect
            v-model="formPet.raca"
            :items="racasDisponiveis"
            placeholder="Selecione a raça..."
            class="w-full"
          />
        </UFormField>

        <!-- Sexo -->
        <UFormField label="Sexo" name="sexo">
          <USelect
            v-model="formPet.sexo"
            :items="PET_SEXOS"
            value-key="value"
            placeholder="Selecione..."
            class="w-full"
          />
        </UFormField>

        <!-- Tamanho -->
        <UFormField label="Tamanho" name="tamanho">
          <USelect
            v-model="formPet.tamanho"
            :items="PET_TAMANHOS"
            value-key="value"
            placeholder="Selecione..."
            class="w-full"
          />
        </UFormField>

        <!-- Idade -->
        <UFormField label="Idade" name="idade">
          <UInput v-model="formPet.idade" placeholder="2 anos" class="w-full" />
        </UFormField>

        <!-- Peso -->
        <UFormField label="Peso (kg)" name="peso">
          <UInput
            v-model="formPet.peso"
            type="number"
            placeholder="5.5"
            class="w-full"
          />
        </UFormField>
      </div>

      <div class="flex justify-end gap-3">
        <UButton color="neutral" variant="ghost" @click="cancelForm"
          >Cancelar</UButton
        >
        <UButton color="secondary" leading-icon="i-lucide-plus" @click="addPet">
          Adicionar
        </UButton>
      </div>
    </div>

    <!-- Botão para abrir formulário -->
    <UButton
      v-if="!showForm"
      leading-icon="i-lucide-plus"
      color="neutral"
      variant="outline"
      class="w-full"
      @click="showForm = true"
    >
      Adicionar pet
    </UButton>
  </div>
</template>
