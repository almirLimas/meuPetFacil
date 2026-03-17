<script setup lang="ts">
import * as z from "zod";
import type { ClienteFormState } from "~/types/cliente";

const schema = z.object({
  dataNascimento: z.string().optional(),
  comoConheceu: z.string().optional(),
  observacoes: z.string().optional(),
  status: z.string().min(1, "Selecione o status"),
});

const statusOptions = [
  { label: "Ativo", value: "Ativo" },
  { label: "Inativo", value: "Inativo" },
];

const dataCadastro = new Date().toISOString().slice(0, 10);

const state = defineModel<ClienteFormState>({ required: true });

const formRef = ref();

defineExpose({
  async validate(): Promise<boolean> {
    try {
      await formRef.value?.validate();
      return true;
    } catch {
      return false;
    }
  },
});
</script>

<template>
  <UForm ref="formRef" :schema="schema" :state="state" @submit="() => {}">
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <UFormField label="Data de nascimento" name="dataNascimento">
        <UInput v-model="state.dataNascimento" type="date" class="w-full" />
      </UFormField>

      <UFormField label="Como conheceu a clínica/petshop" name="comoConheceu">
        <UInput
          v-model="state.comoConheceu"
          placeholder="Indicação, redes sociais..."
          class="w-full"
        />
      </UFormField>

      <UFormField label="Observações" name="observacoes" class="md:col-span-2">
        <UTextarea
          v-model="state.observacoes"
          placeholder="Observações relevantes sobre o cliente"
          :rows="3"
          class="w-full"
        />
      </UFormField>

      <UFormField label="Status do cliente" name="status" required>
        <USelect
          v-model="state.status"
          :items="statusOptions"
          value-key="value"
          class="w-full"
        />
      </UFormField>

      <UFormField label="Data de cadastro">
        <UInput
          :model-value="dataCadastro"
          type="date"
          disabled
          class="w-full"
        />
      </UFormField>
    </div>
  </UForm>
</template>
