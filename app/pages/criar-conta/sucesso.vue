<script setup lang="ts">
definePageMeta({ layout: false, colorMode: "light" });
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
        <h1 class="text-2xl font-bold text-gray-800">Conta criada!</h1>
        <p class="text-gray-500 text-sm mt-2">
          Você tem <strong>14 dias grátis</strong> para explorar o sistema. A primeira cobrança ocorre somente após o período de teste.
        </p>
      </div>

      <UButton to="/login" color="primary" size="lg">
        Fazer login e começar
      </UButton>
    </div>
  </div>
</template>
