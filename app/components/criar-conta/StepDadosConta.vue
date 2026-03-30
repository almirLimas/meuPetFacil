<script setup lang="ts">
import * as z from "zod";
import type { CriarContaFormState } from "~/types/usuario";

const schema = z
  .object({
    nomePetshop: z.string().min(2, "Informe o nome do petshop"),
    nomeCompleto: z.string().min(3, "Informe o nome completo"),
    email: z.string().email("E-mail inválido"),
    telefone: z.string().optional(),
    senha: z.string().min(8, "Senha deve ter ao menos 8 caracteres"),
    confirmarSenha: z.string(),
  })
  .refine((v) => v.senha === v.confirmarSenha, {
    message: "As senhas não conferem",
    path: ["confirmarSenha"],
  });

const state = defineModel<CriarContaFormState>({ required: true });

const formRef = ref();
const showSenha = ref(false);
const showConfirmar = ref(false);

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
      <!-- Nome do petshop -->
      <UFormField
        label="Nome do petshop"
        name="nomePetshop"
        required
        class="md:col-span-2"
      >
        <UInput
          v-model="state.nomePetshop"
          leading-icon="i-lucide-store"
          placeholder="Ex: Pet & Cia, MegaPet"
          class="w-full"
        />
      </UFormField>

      <!-- Nome completo -->
      <UFormField
        label="Nome completo"
        name="nomeCompleto"
        required
        class="md:col-span-2"
      >
        <UInput
          v-model="state.nomeCompleto"
          leading-icon="i-lucide-user"
          placeholder="Maria da Silva"
          class="w-full"
        />
      </UFormField>

      <!-- Email -->
      <UFormField label="E-mail" name="email" required class="md:col-span-2">
        <UInput
          v-model="state.email"
          type="email"
          leading-icon="i-lucide-mail"
          placeholder="maria@meupetfacil.com"
          class="w-full"
        />
      </UFormField>

      <!-- Telefone -->
      <UFormField label="Telefone" name="telefone" class="md:col-span-2">
        <InputTelefoneInput
          v-model="state.telefone"
          leading-icon="i-lucide-phone"
          class="w-full"
        />
      </UFormField>

      <!-- Senha -->
      <UFormField label="Senha" name="senha" required>
        <UInput
          v-model="state.senha"
          :type="showSenha ? 'text' : 'password'"
          leading-icon="i-lucide-lock"
          :trailing-icon="showSenha ? 'i-lucide-eye-off' : 'i-lucide-eye'"
          placeholder="Mínimo 8 caracteres"
          class="w-full"
          @click:trailing="showSenha = !showSenha"
        />
      </UFormField>

      <!-- Confirmar senha -->
      <UFormField label="Confirmar senha" name="confirmarSenha" required>
        <UInput
          v-model="state.confirmarSenha"
          :type="showConfirmar ? 'text' : 'password'"
          leading-icon="i-lucide-lock-keyhole"
          :trailing-icon="showConfirmar ? 'i-lucide-eye-off' : 'i-lucide-eye'"
          placeholder="Repita a senha"
          class="w-full"
          @click:trailing="showConfirmar = !showConfirmar"
        />
      </UFormField>
    </div>
  </UForm>
</template>
