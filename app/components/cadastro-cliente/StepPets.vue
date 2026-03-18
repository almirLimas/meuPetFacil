<script setup lang="ts">
import * as z from "zod";
import type { PetFormState } from "~/types/pet";
import { PET_ESPECIES, PET_TAMANHOS } from "~/types/pet";

const pets = defineModel<PetFormState[]>({ required: true });

const showForm = ref(false);

const emptyPet = (): PetFormState => ({
  nome: "",
  raca: "",
  especie: "Cão",
  tamanho: undefined,
  idade: "",
  peso: "",
  observacoes: "",
});

const formPet = reactive<PetFormState>(emptyPet());

const schema = z.object({
  nome: z.string().min(1, "Informe o nome do pet"),
  raca: z.string().min(1, "Informe a raça"),
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

// O step de pets é opcional — sempre válido
defineExpose({
  validate: (): boolean => true,
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
      class="flex flex-col items-center justify-center gap-2 py-10 text-center text-gray-400 rounded-xl border border-dashed border-gray-200"
    >
      <UIcon name="i-lucide-paw-print" class="text-4xl" />
      <p class="text-sm font-medium">Nenhum pet adicionado</p>
      <p class="text-xs">Este passo é opcional</p>
    </div>

    <!-- Formulário inline de adição -->
    <div
      v-if="showForm"
      class="rounded-xl border border-gray-200 p-4 flex flex-col gap-4 bg-white"
    >
      <p class="text-sm font-semibold text-gray-700">Novo pet</p>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
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
          <UInput
            v-model="formPet.raca"
            placeholder="Labrador, Persa, SRD..."
            class="w-full"
          />
        </UFormField>

        <!-- Espécie -->
        <UFormField label="Espécie" name="especie">
          <USelect
            v-model="formPet.especie"
            :items="PET_ESPECIES"
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
