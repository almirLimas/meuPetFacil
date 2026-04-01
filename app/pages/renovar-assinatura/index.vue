<script setup lang="ts">
definePageMeta({ layout: false });

const { renovarAssinatura } = usePagamento();
const toast = useToast();
const erro = ref(false);
const carregando = ref(true);

onMounted(async () => {
  try {
    const resultado = await renovarAssinatura();
    globalThis.location.href = resultado.url;
  } catch {
    carregando.value = false;
    erro.value = true;
    toast.add({
      title: "Erro ao iniciar pagamento",
      description:
        "Tente novamente mais tarde ou entre em contato com o suporte.",
      color: "error",
    });
  }
});
</script>

<template>
  <div class="min-h-screen flex items-center justify-center px-4 bg-gray-50">
    <div class="text-center flex flex-col items-center gap-6 max-w-sm">
      <template v-if="carregando">
        <UIcon
          name="i-lucide-loader-circle"
          class="animate-spin text-secondary-400 text-4xl"
        />
        <div>
          <h1 class="text-xl font-bold text-gray-800">Preparando pagamento…</h1>
          <p class="text-gray-500 text-sm mt-1">
            Você será redirecionado ao Mercado Pago em instantes.
          </p>
        </div>
      </template>

      <template v-else-if="erro">
        <div
          class="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center"
        >
          <UIcon name="i-lucide-x-circle" class="text-5xl text-red-400" />
        </div>
        <div>
          <h1 class="text-xl font-bold text-gray-800">Algo deu errado</h1>
          <p class="text-gray-500 text-sm mt-1">
            Não foi possível iniciar o pagamento.
          </p>
        </div>
        <div class="flex gap-3">
          <UButton @click="$router.go(0)" color="primary"
            >Tentar novamente</UButton
          >
          <UButton
            :to="`https://wa.me/5511966389057?text=Preciso+renovar+minha+assinatura+AninPet`"
            target="_blank"
            color="neutral"
            variant="soft"
          >
            Falar com suporte
          </UButton>
        </div>
      </template>
    </div>
  </div>
</template>
