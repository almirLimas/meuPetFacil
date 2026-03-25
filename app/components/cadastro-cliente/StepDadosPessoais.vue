<script setup lang="ts">
import * as z from "zod";
import type { ClienteFormState } from "~/types/cliente";

const schema = z.object({
  nome: z.string().min(3, "Informe o nome completo"),
  cpf: z
    .string()
    .optional()
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
  telefoneSecundario: z.string().optional(),
  email: z.string().email("E-mail inválido").optional().or(z.literal("")),
});

const state = defineModel<ClienteFormState>({ required: true });

const formRef = ref();

defineExpose({
  validate: async (): Promise<boolean> => {
    // Dispara o UForm para exibir erros visuais nos campos
    try {
      await formRef.value?.validate();
    } catch {
      // erros de campo são mostrados pelo UForm
    }
    // Zod safeParse é o resultado canônico (compatível com Zod v4)
    return schema.safeParse(state.value).success;
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

      <UFormField label="CPF" name="cpf" hint="Opcional">
        <InputCpfInput v-model="state.cpf" class="w-full" />
      </UFormField>

      <UFormField label="Telefone principal" name="telefonePrincipal" required>
        <InputTelefoneInput v-model="state.telefonePrincipal" class="w-full" />
      </UFormField>

      <UFormField
        label="Telefone secundário / WhatsApp"
        name="telefoneSecundario"
      >
        <InputTelefoneInput v-model="state.telefoneSecundario" class="w-full" />
      </UFormField>

      <UFormField label="E-mail" name="email" class="md:col-span-2">
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
