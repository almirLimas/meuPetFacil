<script setup lang="ts">
definePageMeta({ layout: false });

onMounted(() => {
  setTimeout(() => navigateTo("/dashboard"), 4000);
});
</script>

<template>
  <div class="min-h-screen flex items-center justify-center px-4 bg-gray-50">
    <div class="text-center flex flex-col items-center gap-6 max-w-sm">
      <div
        class="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center"
      >
        <UIcon name="i-lucide-check-circle-2" class="text-5xl text-green-500" />
      </div>
      <div>
        <h1 class="text-2xl font-bold text-gray-800">Assinatura ativada!</h1>
        <p class="text-gray-500 text-sm mt-2">
          Obrigado! Seu acesso foi reativado. Redirecionando para o dashboard…
        </p>
      </div>
      <UIcon
        name="i-lucide-loader-circle"
        class="animate-spin text-secondary-400 text-2xl"
      />
      <UButton to="/dashboard" color="primary" variant="soft">
        Ir para o dashboard agora
      </UButton>
    </div>
  </div>
</template>
