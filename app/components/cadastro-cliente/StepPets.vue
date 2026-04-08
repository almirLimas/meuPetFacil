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

type PetWithId = PetFormState & { id?: string };
const props = defineProps<{
  onSavePet?: (pet: PetWithId) => Promise<void>;
}>();

const savingPet = ref(false);

const showForm = ref(false);
const semPetErro = ref(false);
const editandoIdx = ref<number | null>(null);

const emptyPet = (): PetFormState => ({
  nome: "",
  raca: "",
  especie: "Cão",
  sexo: undefined,
  tamanho: undefined,
  dataNascimento: "",
  peso: "",
  observacoes: "",
});

const formPet = reactive<PetFormState>(emptyPet());

// Raças disponíveis de acordo com a espécie selecionada
const racasDisponiveis = computed(
  () => RACAS_POR_ESPECIE[(formPet.especie as PetEspecie) ?? "Cão"],
);

// Ao trocar espécie, limpa raça (exceto quando carregando pet para edição)
const carregandoEdicao = ref(false);
watch(
  () => formPet.especie,
  () => {
    if (!carregandoEdicao.value) formPet.raca = "";
  },
);

const schema = z.object({
  nome: z.string().min(1, "Informe o nome do pet"),
  raca: z.string().min(1, "Selecione a raça"),
});

const fieldErrors = reactive<{
  nome: string | undefined;
  raca: string | undefined;
}>({ nome: undefined, raca: undefined });

const validateForm = (): boolean => {
  const result = schema.safeParse(formPet);
  fieldErrors.nome = undefined;
  fieldErrors.raca = undefined;
  if (!result.success) {
    result.error.issues.forEach((e) => {
      const field = e.path[0] as keyof typeof fieldErrors;
      if (field in fieldErrors) fieldErrors[field] = e.message;
    });
    return false;
  }
  return true;
};

const addPet = async () => {
  if (!validateForm()) return;
  if (editandoIdx.value !== null) {
    const petAtualizado = { ...formPet } as PetWithId;
    pets.value[editandoIdx.value] = petAtualizado;
    // Se há callback de save imediato (ex: tela de edição) e o pet já existe no banco
    if (props.onSavePet && petAtualizado.id) {
      savingPet.value = true;
      try {
        await props.onSavePet(petAtualizado);
      } finally {
        savingPet.value = false;
      }
    }
    editandoIdx.value = null;
  } else {
    pets.value.push({ ...formPet });
  }
  Object.assign(formPet, emptyPet());
  showForm.value = false;
  semPetErro.value = false;
};

const editarPet = (index: number) => {
  carregandoEdicao.value = true;
  const pet = pets.value[index] as PetFormState & {
    porte?: string;
    dataNascimento?: string;
  };
  Object.assign(formPet, {
    ...pet,
    tamanho: pet.tamanho ?? pet.porte ?? undefined,
    dataNascimento: pet.dataNascimento || "",
  });
  nextTick(() => {
    carregandoEdicao.value = false;
  });
  editandoIdx.value = index;
  showForm.value = true;
};

const removePet = (index: number) => {
  pets.value.splice(index, 1);
};

const cancelForm = () => {
  Object.assign(formPet, emptyPet());
  fieldErrors.nome = undefined;
  fieldErrors.raca = undefined;
  editandoIdx.value = null;
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
  editarPet,
});
</script>

<template>
  <div class="flex flex-col gap-4">
    <!-- Pets já adicionados -->
    <div v-if="pets.length > 0" class="flex flex-col gap-3">
      <div
        v-for="(pet, idx) in pets"
        :key="idx"
        class="flex items-center justify-between p-4 rounded-xl border border-gray-200 dark:border-neutral-700 bg-gray-50 dark:bg-neutral-800"
      >
        <div class="flex items-center gap-3">
          <div
            class="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
            style="background: #ffe0ec"
          >
            <UIcon name="i-lucide-paw-print" class="text-[#E85A8A] text-base" />
          </div>
          <div>
            <p class="font-semibold text-gray-800 dark:text-gray-100 text-sm">
              {{ pet.nome }}
            </p>
            <div
              class="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 flex-wrap mt-0.5"
            >
              <span>{{ pet.raca }}</span>
              <span v-if="pet.especie">· {{ pet.especie }}</span>
              <span v-if="pet.tamanho">· {{ pet.tamanho }}</span>
              <span v-if="pet.dataNascimento">· {{ pet.dataNascimento }}</span>
              <span v-if="pet.peso">· {{ pet.peso }} kg</span>
            </div>
          </div>
        </div>
        <div class="flex items-center gap-1">
          <UButton
            icon="i-lucide-pencil"
            color="neutral"
            variant="ghost"
            size="xs"
            @click="editarPet(idx)"
          />
          <UButton
            icon="i-lucide-trash-2"
            color="error"
            variant="ghost"
            size="xs"
            @click="removePet(idx)"
          />
        </div>
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
      class="rounded-xl border border-gray-200 dark:border-neutral-700 p-4 flex flex-col gap-4 bg-white dark:bg-neutral-800"
    >
      <p class="text-sm font-semibold text-gray-700 dark:text-gray-200">
        {{ editandoIdx !== null ? "Editar pet" : "Novo pet" }}
      </p>
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
        <UFormField label="Idade (anos)" name="dataNascimento">
          <UInput
            v-model="formPet.dataNascimento"
            placeholder="Ex: 3"
            inputmode="numeric"
            maxlength="2"
            class="w-full"
            @input="
              (e: Event) => {
                formPet.dataNascimento = (e.target as HTMLInputElement).value
                  .replace(/\D/g, '')
                  .slice(0, 2);
              }
            "
          />
        </UFormField>

        <!-- Peso -->
        <UFormField label="Peso (kg)" name="peso">
          <UInput
            v-model="formPet.peso"
            placeholder="Ex: 12"
            inputmode="numeric"
            maxlength="3"
            class="w-full"
            @input="
              (e: Event) => {
                formPet.peso = (e.target as HTMLInputElement).value
                  .replace(/\D/g, '')
                  .slice(0, 3);
              }
            "
          />
        </UFormField>
      </div>

      <div class="flex justify-end gap-3">
        <UButton color="neutral" variant="ghost" @click="cancelForm"
          >Cancelar</UButton
        >
        <UButton
          color="secondary"
          :loading="savingPet"
          :leading-icon="
            editandoIdx !== null ? 'i-lucide-check' : 'i-lucide-plus'
          "
          @click="addPet"
        >
          {{ editandoIdx !== null ? "Salvar alterações" : "Adicionar" }}
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
