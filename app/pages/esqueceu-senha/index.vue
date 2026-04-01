<script setup lang="ts">
import { z } from "zod";

definePageMeta({ layout: false });

const schema = z.object({
  email: z.string().email("Informe um e-mail válido"),
});

const form = reactive({ email: "" });
const erro = ref("");
const sucesso = ref(false);
const carregando = ref(false);

async function handleSubmit() {
  const result = schema.safeParse(form);
  if (!result.success) {
    erro.value = result.error.issues[0].message;
    return;
  }
  erro.value = "";
  carregando.value = true;

  try {
    const config = useRuntimeConfig();
    await $fetch(`${config.public.apiUrl}/auth/esqueceu-senha`, {
      method: "POST",
      body: { email: form.email },
    });
    sucesso.value = true;
  } catch {
    erro.value = "Ocorreu um erro. Tente novamente.";
  } finally {
    carregando.value = false;
  }
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center px-4">
    <UCard class="w-full max-w-sm shadow-lg bg-white! ring-0">
      <div class="flex flex-col items-center gap-6 py-4">
        <AppMascot :size="180" />

        <div class="w-full text-center">
          <h1 class="text-xl font-semibold text-gray-800">
            Esqueceu sua senha?
          </h1>
          <p class="text-sm text-gray-500 mt-1">
            Informe seu e-mail e enviaremos um link para criar uma nova senha.
          </p>
        </div>

        <!-- Sucesso -->
        <div
          v-if="sucesso"
          class="w-full rounded-lg bg-green-50 border border-green-200 p-4 text-center"
        >
          <UIcon
            name="i-lucide-mail-check"
            class="text-green-500 text-3xl mb-2"
          />
          <p class="text-green-700 font-medium text-sm">
            Link enviado! Verifique sua caixa de entrada (e o spam).
          </p>
        </div>

        <!-- Formulário -->
        <div v-else class="flex flex-col gap-3 w-full">
          <div class="flex flex-col gap-1">
            <UInput
              v-model="form.email"
              color="secondary"
              leading-icon="i-lucide-mail"
              placeholder="Seu e-mail cadastrado"
              type="email"
              size="lg"
              autocomplete="email"
              :class="erro ? 'ring-2 ring-red-400 rounded-md' : ''"
              @keyup.enter="handleSubmit"
            />
            <p v-if="erro" class="text-xs text-red-500 pl-1">{{ erro }}</p>
          </div>

          <UButton
            block
            size="lg"
            color="secondary"
            :loading="carregando"
            @click="handleSubmit"
          >
            Enviar link
          </UButton>
        </div>

        <NuxtLink
          to="/login"
          class="text-sm text-gray-500 hover:text-gray-700 transition-colors flex items-center gap-1"
        >
          <UIcon name="i-lucide-arrow-left" />
          Voltar para o login
        </NuxtLink>
      </div>
    </UCard>
  </div>
</template>
