<script setup lang="ts">
import { z } from "zod";
import { useAuthStore } from "~/stores/auth";

definePageMeta({
  layout: false,
  colorMode: "light",
});

const auth = useAuthStore();

const schema = z.object({
  email: z.string().email("Informe um e-mail válido"),
  password: z
    .string()
    .min(5, "A senha deve ter no mínimo 5 caracteres")
    .max(15, "A senha deve ter no máximo 15 caracteres"),
});

type FormErrors = { email?: string; password?: string };

const form = reactive({ email: "", password: "" });
const errors = reactive<FormErrors>({});
const showPassword = ref(false);

function validate(): boolean {
  const result = schema.safeParse(form);
  errors.email = undefined;
  errors.password = undefined;

  if (!result.success) {
    for (const issue of result.error.issues) {
      const field = issue.path[0] as keyof FormErrors;
      errors[field] = issue.message;
    }
    return false;
  }
  return true;
}

async function handleLogin() {
  if (!validate()) return;
  await auth.login(form.email, form.password);
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center px-4">
    <UCard class="w-full max-w-sm shadow-lg bg-white! ring-0">
      <div class="flex flex-col items-center gap-6 py-4">
        <AppMascot :size="250" />

        <!-- Formulário -->
        <div class="flex flex-col gap-3 w-full">
          <div class="flex flex-col gap-1">
            <UInput
              v-model="form.email"
              color="secondary"
              leading-icon="i-lucide-mail"
              placeholder="E-mail"
              type="email"
              size="lg"
              autocomplete="email"
              :class="errors.email ? 'ring-2 ring-red-400 rounded-md' : ''"
            />
            <p v-if="errors.email" class="text-xs text-red-500 pl-1">
              {{ errors.email }}
            </p>
          </div>

          <div class="flex flex-col gap-1">
            <UInput
              v-model="form.password"
              color="secondary"
              leading-icon="i-lucide-lock"
              placeholder="Senha"
              :type="showPassword ? 'text' : 'password'"
              size="lg"
              maxlength="15"
              autocomplete="current-password"
              :class="errors.password ? 'ring-2 ring-red-400 rounded-md' : ''"
            >
              <template #trailing>
                <UButton
                  type="button"
                  color="neutral"
                  variant="ghost"
                  size="sm"
                  :icon="showPassword ? 'i-lucide-eye-off' : 'i-lucide-eye'"
                  @click="showPassword = !showPassword"
                />
              </template>
            </UInput>
            <p v-if="errors.password" class="text-xs text-red-500 pl-1">
              {{ errors.password }}
            </p>
          </div>

          <UButton
            block
            size="lg"
            color="secondary"
            :loading="auth.loading"
            @click="handleLogin"
          >
            Entrar
          </UButton>
        </div>

        <!-- Rodapé -->
        <div
          class="flex items-center justify-center gap-3 text-sm text-gray-500"
        >
          <NuxtLink
            to="/esqueceu-senha"
            class="hover:text-gray-700 transition-colors"
          >
            Esqueceu a senha?
          </NuxtLink>
          <span aria-hidden="true">|</span>
          <NuxtLink
            to="/criar-conta"
            class="text-blue-500 underline underline-offset-2 hover:text-blue-700 transition-colors"
          >
            Criar conta
          </NuxtLink>
        </div>
      </div>
    </UCard>
  </div>
</template>
