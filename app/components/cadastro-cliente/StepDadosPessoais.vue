<script setup lang="ts">
import * as z from "zod";
import type { ClienteFormState } from "~/types/cliente";

const schema = z.object({
  nome: z.string().min(3, "Informe o nome completo"),
  cpf: z.string().min(11, "CPF inválido"),
  telefonePrincipal: z.string().min(10, "Telefone inválido"),
  telefoneSecundario: z.string().optional(),
  email: z.string().email("E-mail inválido"),
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
      <UFormField label="Nome completo" name="nome" required>
        <UInput
          v-model="state.nome"
          placeholder="João da Silva"
          class="w-full"
        />
      </UFormField>

      <UFormField label="CPF" name="cpf" required>
        <UInput
          v-model="state.cpf"
          placeholder="000.000.000-00"
          class="w-full"
        />
      </UFormField>

      <UFormField label="Telefone principal" name="telefonePrincipal" required>
        <UInput
          v-model="state.telefonePrincipal"
          placeholder="(00) 90000-0000"
          class="w-full"
        />
      </UFormField>

      <UFormField
        label="Telefone secundário / WhatsApp"
        name="telefoneSecundario"
      >
        <UInput
          v-model="state.telefoneSecundario"
          placeholder="(00) 90000-0000"
          class="w-full"
        />
      </UFormField>

      <UFormField label="E-mail" name="email" required class="md:col-span-2">
        <UInput
          v-model="state.email"
          type="email"
          placeholder="joao@email.com"
          class="w-full"
        />
      </UFormField>
    </div>
  </UForm>
</template>
