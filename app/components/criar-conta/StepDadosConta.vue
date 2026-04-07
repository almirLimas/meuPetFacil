<script setup lang="ts">
import * as z from "zod";
import type { CriarContaFormState } from "~/types/usuario";

const { maskCpf, isValidCpf } = useMask();

const schema = z
  .object({
    nomePetshop: z.string().min(2, "Informe o nome do petshop"),
    nomeCompleto: z
      .string()
      .min(3, "Informe o nome completo")
      .regex(
        /^[A-Za-zÀ-ÖØ-öø-ÿ\s'-]+$/,
        "Use apenas letras e acentos, sem números ou símbolos",
      ),
    email: z.string().email("E-mail inválido"),
    cpf: z
      .string()
      .min(1, "CPF é obrigatório")
      .refine(isValidCpf, "CPF inválido"),
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

function filtrarNomeCompleto(e: Event) {
  const input = e.target as HTMLInputElement;
  const filtrado = input.value.replaceAll(
    /[^A-Za-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u00FF\s'-]/g,
    "",
  );
  input.value = filtrado;
  state.value.nomeCompleto = filtrado;
}

function onCpfInput(e: Event) {
  const input = e.target as HTMLInputElement;
  const masked = maskCpf(input.value);
  input.value = masked;
  state.value.cpf = masked;
}

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
          @input="filtrarNomeCompleto"
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

      <!-- CPF -->
      <UFormField label="CPF" name="cpf" required class="md:col-span-2">
        <UInput
          v-model="state.cpf"
          leading-icon="i-lucide-id-card"
          placeholder="000.000.000-00"
          maxlength="14"
          class="w-full"
          @input="onCpfInput"
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
          placeholder="Mínimo 8 caracteres"
          class="w-full"
        >
          <template #trailing>
            <UButton
              type="button"
              color="neutral"
              variant="ghost"
              size="sm"
              :icon="showSenha ? 'i-lucide-eye-off' : 'i-lucide-eye'"
              @click="showSenha = !showSenha"
            />
          </template>
        </UInput>
      </UFormField>

      <!-- Confirmar senha -->
      <UFormField label="Confirmar senha" name="confirmarSenha" required>
        <UInput
          v-model="state.confirmarSenha"
          :type="showConfirmar ? 'text' : 'password'"
          leading-icon="i-lucide-lock-keyhole"
          placeholder="Repita a senha"
          class="w-full"
        >
          <template #trailing>
            <UButton
              type="button"
              color="neutral"
              variant="ghost"
              size="sm"
              :icon="showConfirmar ? 'i-lucide-eye-off' : 'i-lucide-eye'"
              @click="showConfirmar = !showConfirmar"
            />
          </template>
        </UInput>
      </UFormField>
    </div>
  </UForm>
</template>
