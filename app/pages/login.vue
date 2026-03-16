<script setup lang="ts">
definePageMeta({
  layout: false,
});

const form = reactive({
  email: "",
  password: "",
});

const loading = ref(false);

async function handleLogin() {
  loading.value = true;
  try {
    // TODO: integrar com API de autenticação
    console.log("Login:", form);
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center px-4">
    <UCard class="w-full max-w-sm shadow-lg bg-white! ring-0">
      <div class="flex flex-col items-center gap-6 py-4">
        <AppMascot :size="250" />

        <!-- Formulário -->
        <div class="flex flex-col gap-3 w-full">
          <UInput
            v-model="form.email"
            color="secondary"
            leading-icon="i-lucide-mail"
            placeholder="E-mail"
            type="email"
            size="lg"
            autocomplete="email"
          />

          <UInput
            v-model="form.password"
            color="secondary"
            leading-icon="i-lucide-lock"
            placeholder="Senha"
            type="password"
            size="lg"
            autocomplete="current-password"
          />

          <UButton
            block
            size="lg"
            color="secondary"
            :loading="loading"
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
            to="/cadastro"
            class="text-blue-500 underline underline-offset-2 hover:text-blue-700 transition-colors"
          >
            Criar conta
          </NuxtLink>
        </div>
      </div>
    </UCard>
  </div>
</template>
