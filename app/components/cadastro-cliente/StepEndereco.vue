<script setup lang="ts">
import * as z from "zod";
import type { ClienteFormState } from "~/types/cliente";

const schema = z.object({
  cep: z.string().min(8, "CEP inválido"),
  rua: z.string().min(1, "Informe a rua"),
  numero: z.string().min(1, "Informe o número"),
  complemento: z.string().optional(),
  bairro: z.string().min(1, "Informe o bairro"),
  cidade: z.string().min(1, "Informe a cidade"),
  estado: z.string().min(2, "Informe o estado"),
});

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
      <UFormField label="CEP" name="cep" required>
        <UInput v-model="state.cep" placeholder="00000-000" class="w-full" />
      </UFormField>

      <UFormField label="Rua" name="rua" required>
        <UInput
          v-model="state.rua"
          placeholder="Rua das Flores"
          class="w-full"
        />
      </UFormField>

      <UFormField label="Número" name="numero" required>
        <UInput v-model="state.numero" placeholder="123" class="w-full" />
      </UFormField>

      <UFormField label="Complemento" name="complemento">
        <UInput
          v-model="state.complemento"
          placeholder="Apto 42"
          class="w-full"
        />
      </UFormField>

      <UFormField label="Bairro" name="bairro" required>
        <UInput v-model="state.bairro" placeholder="Centro" class="w-full" />
      </UFormField>

      <UFormField label="Cidade" name="cidade" required>
        <UInput v-model="state.cidade" placeholder="São Paulo" class="w-full" />
      </UFormField>

      <UFormField label="Estado" name="estado" required>
        <UInput v-model="state.estado" placeholder="SP" class="w-full" />
      </UFormField>
    </div>
  </UForm>
</template>
