<script setup lang="ts">
import * as z from "zod";
import type { ClienteFormState } from "~/types/cliente";

const schema = z.object({
  nome: z
    .string()
    .min(3, "Informe o nome completo")
    .regex(
      /^[A-Za-zÀ-ÖØ-öø-ÿ\s''-]+$/,
      "Nome não pode conter números ou caracteres especiais",
    ),
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
  mensalista: z.boolean().optional(),
  valorMensal: z.number().min(0).optional().nullable(),
  diaVencimento: z.number().int().min(1).max(31).optional().nullable(),
});

const state = defineModel<ClienteFormState>({ required: true });

function filtrarNome(e: Event) {
  const input = e.target as HTMLInputElement;
  const filtrado = input.value.replace(
    /[^A-Za-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u00FF\s''\-]/g,
    "",
  );
  input.value = filtrado;
  state.value.nome = filtrado;
}

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
          @input="filtrarNome"
        />
      </UFormField>

      <UFormField label="CPF" name="cpf" hint="(Opcional)">
        <InputCpfInput v-model="state.cpf" class="w-full" />
      </UFormField>

      <UFormField label="WhatsApp" name="telefonePrincipal" required>
        <InputTelefoneInput v-model="state.telefonePrincipal" class="w-full" />
      </UFormField>

      <UFormField
        label="Telefone secundário"
        name="telefoneSecundario"
        hint="(Opcional)"
      >
        <InputTelefoneInput v-model="state.telefoneSecundario" class="w-full" />
      </UFormField>

      <UFormField
        label="E-mail"
        name="email"
        hint="(Opcional)"
        class="md:col-span-2"
      >
        <UInput
          v-model="state.email"
          type="email"
          placeholder="joao@email.com"
          class="w-full"
        />
      </UFormField>

      <UFormField name="mensalista" class="md:col-span-2">
        <div class="flex items-center gap-3">
          <USwitch v-model="state.mensalista" />
          <span class="text-sm font-medium"
            >Cliente mensalista (plano mensal fixo)</span
          >
        </div>
      </UFormField>

      <template v-if="state.mensalista">
        <UFormField label="Valor mensal (R$)" name="valorMensal">
          <UInput
            v-model.number="state.valorMensal"
            type="number"
            min="0"
            step="0.01"
            placeholder="Ex: 150.00"
            class="w-full"
          />
        </UFormField>

        <UFormField
          label="Dia do vencimento"
          name="diaVencimento"
          hint="(1-31)"
        >
          <UInput
            v-model.number="state.diaVencimento"
            type="number"
            min="1"
            max="31"
            placeholder="Ex: 10"
            class="w-full"
          />
        </UFormField>
      </template>
    </div>
  </UForm>
</template>
