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
          Houve um problema ao processar seu pagamento. Nenhuma cobrança foi
          realizada. Você pode tentar novamente ou escolher outra forma de
          pagamento.
        </p>
      </div>

      <div class="flex flex-col gap-3 w-full">
        <UButton
          to="/criar-conta"
          block
          class="font-semibold rounded-xl text-white"
          style="background-color: #f07030"
        >
          Tentar novamente
        </UButton>
        <UButton to="/login" block variant="ghost" color="neutral">
          Já tenho conta — Fazer login
        </UButton>
      </div>

      <p class="text-xs text-gray-400">
        Dúvidas? Fale conosco pelo
        <a
          href="mailto:suporte@aninpet.com.br"
          class="underline hover:text-gray-600 transition-colors"
          >suporte@aninpet.com.br</a
        >
      </p>
    </div>
  </div>
</template>
