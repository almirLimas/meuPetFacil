<script setup lang="ts">
import { z } from "zod";

definePageMeta({ layout: false });

const route = useRoute();
const token = computed(() => route.query.token as string | undefined);

const schema = z
  .object({
    novaSenha: z.string().min(6, "A senha deve ter no mínimo 6 caracteres"),
    confirmar: z.string(),
  })
  .refine((d) => d.novaSenha === d.confirmar, {
    message: "As senhas não coincidem",
    path: ["confirmar"],
  });

type FormErrors = { novaSenha?: string; confirmar?: string };

const form = reactive({ novaSenha: "", confirmar: "" });
const errors = reactive<FormErrors>({});
const sucesso = ref(false);
const carregando = ref(false);
const showSenha = ref(false);

function validate() {
  const result = schema.safeParse(form);
  errors.novaSenha = undefined;
  errors.confirmar = undefined;
  if (!result.success) {
    for (const issue of result.error.issues) {
      const field = issue.path[0] as keyof FormErrors;
      errors[field] = issue.message;
    }
    return false;
  }
  return true;
}

async function handleSubmit() {
  if (!validate()) return;
  if (!token.value) return;

  carregando.value = true;
  try {
    const config = useRuntimeConfig();
    await $fetch(`${config.public.apiUrl}/auth/redefinir-senha`, {
      method: "POST",
      body: { token: token.value, novaSenha: form.novaSenha },
    });
    sucesso.value = true;
  } catch {
    errors.novaSenha = "Token inválido ou expirado. Solicite um novo link.";
  } finally {
    carregando.value = false;
  }
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center px-4">
    <UCard class="w-full max-w-sm shadow-lg ring-0">
      <div class="flex flex-col items-center gap-6 py-4">
        <AppMascot :size="180" />

        <!-- Token ausente -->
        <div
          v-if="!token"
          class="w-full rounded-lg bg-red-50 border border-red-200 p-4 text-center"
        >
          <p class="text-red-700 text-sm font-medium">
            Link inválido. Solicite um novo link de redefinição.
          </p>
          <NuxtLink
            to="/esqueceu-senha"
            class="text-blue-500 underline text-sm mt-2 inline-block"
          >
            Solicitar novo link
          </NuxtLink>
        </div>

        <!-- Sucesso -->
        <template v-else-if="sucesso">
          <div
            class="w-full rounded-lg bg-green-50 border border-green-200 p-4 text-center"
          >
            <UIcon
              name="i-lucide-check-circle"
              class="text-green-500 text-3xl mb-2"
            />
            <p class="text-green-700 font-medium text-sm">
              Senha redefinida com sucesso!
            </p>
          </div>
          <NuxtLink
            to="/login"
            class="text-sm text-blue-500 underline hover:text-blue-700 transition-colors"
          >
            Ir para o login
          </NuxtLink>
        </template>

        <!-- Formulário -->
        <template v-else>
          <div class="w-full text-center">
            <h1 class="text-xl font-semibold text-gray-800">
              Criar nova senha
            </h1>
            <p class="text-sm text-gray-500 mt-1">
              Escolha uma nova senha para sua conta.
            </p>
          </div>

          <div class="flex flex-col gap-3 w-full">
            <div class="flex flex-col gap-1">
              <UInput
                v-model="form.novaSenha"
                color="secondary"
                leading-icon="i-lucide-lock"
                placeholder="Nova senha"
                :type="showSenha ? 'text' : 'password'"
                size="lg"
                :class="
                  errors.novaSenha ? 'ring-2 ring-red-400 rounded-md' : ''
                "
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
              <p v-if="errors.novaSenha" class="text-xs text-red-500 pl-1">
                {{ errors.novaSenha }}
              </p>
            </div>

            <div class="flex flex-col gap-1">
              <UInput
                v-model="form.confirmar"
                color="secondary"
                leading-icon="i-lucide-lock-keyhole"
                placeholder="Confirmar nova senha"
                :type="showSenha ? 'text' : 'password'"
                size="lg"
                :class="
                  errors.confirmar ? 'ring-2 ring-red-400 rounded-md' : ''
                "
                @keyup.enter="handleSubmit"
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
              <p v-if="errors.confirmar" class="text-xs text-red-500 pl-1">
                {{ errors.confirmar }}
              </p>
            </div>

            <UButton
              block
              size="lg"
              color="secondary"
              :loading="carregando"
              @click="handleSubmit"
            >
              Salvar nova senha
            </UButton>
          </div>

          <NuxtLink
            to="/login"
            class="text-sm text-gray-500 hover:text-gray-700 transition-colors flex items-center gap-1"
          >
            <UIcon name="i-lucide-arrow-left" />
            Voltar para o login
          </NuxtLink>
        </template>
      </div>
    </UCard>
  </div>
</template>
