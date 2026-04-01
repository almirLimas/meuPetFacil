<script setup lang="ts">
definePageMeta({ layout: false });
</script>

<template>
  <div class="min-h-screen flex items-center justify-center px-4 bg-gray-50">
    <div class="text-center flex flex-col items-center gap-6 max-w-sm">
      <div
        class="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center"
      >
        <UIcon name="i-lucide-x-circle" class="text-5xl text-red-400" />
      </div>
      <div>
        <h1 class="text-2xl font-bold text-gray-800">
          Pagamento não concluído
        </h1>
        <p class="text-gray-500 text-sm mt-2">
          Seu pagamento não foi processado. Tente novamente ou use outro cartão.
        </p>
      </div>
      <div class="flex gap-3">
        <UButton to="/renovar-assinatura" color="primary">
          Tentar novamente
        </UButton>
        <UButton
          :to="`https://wa.me/5511966389057?text=Problema+no+pagamento+AninPet`"
          target="_blank"
          color="neutral"
          variant="soft"
        >
          Falar com suporte
        </UButton>
      </div>
    </div>
  </div>
</template>
