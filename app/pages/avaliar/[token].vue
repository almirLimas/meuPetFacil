<script setup lang="ts">
definePageMeta({ layout: "landing" });

const route = useRoute();
const config = useRuntimeConfig();

const token = route.params.token as string;
const nota = ref<number | null>(null);
const enviado = ref(false);
const erro = ref(false);
const carregando = ref(false);

// Se vier da URL com ?nota=X (clicou direto no e-mail)
onMounted(() => {
  const notaQuery = Number(route.query.nota);
  if (notaQuery >= 1 && notaQuery <= 5) {
    nota.value = notaQuery;
    enviar();
  }
});

async function enviar() {
  if (!nota.value || carregando.value) return;
  carregando.value = true;
  try {
    await $fetch(`${config.public.apiUrl}/avaliacoes/responder/${token}`, {
      method: "POST",
      body: { nota: nota.value },
    });
    enviado.value = true;
  } catch {
    erro.value = true;
  } finally {
    carregando.value = false;
  }
}

const emojis = ["😞", "😕", "😐", "🙂", "😍"];
const labels = [
  "Muito insatisfeito",
  "Insatisfeito",
  "Neutro",
  "Satisfeito",
  "Muito satisfeito",
];
</script>

<template>
  <div
    class="min-h-screen flex items-center justify-center bg-linear-to-br from-[#e8f9fc] to-[#f0fffe] p-4"
  >
    <div class="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
      <!-- Logo -->
      <div class="flex justify-center mb-6">
        <AppLogo />
      </div>

      <!-- Enviado com sucesso -->
      <template v-if="enviado">
        <div class="text-5xl mb-4">🎉</div>
        <h2 class="text-xl font-bold text-gray-800 mb-2">
          Obrigado pela avaliação!
        </h2>
        <p class="text-gray-500 text-sm">
          Sua opinião nos ajuda a oferecer um serviço ainda melhor para você e
          seu pet. 🐾
        </p>
      </template>

      <!-- Erro: já respondida ou token inválido -->
      <template v-else-if="erro">
        <div class="text-5xl mb-4">😕</div>
        <h2 class="text-xl font-bold text-gray-800 mb-2">
          Ops, algo deu errado
        </h2>
        <p class="text-gray-500 text-sm">
          Esta avaliação pode já ter sido respondida ou o link expirou.
        </p>
      </template>

      <!-- Formulário de avaliação -->
      <template v-else>
        <h2 class="text-xl font-bold text-gray-800 mb-2">
          Como foi sua experiência?
        </h2>
        <p class="text-gray-500 text-sm mb-8">
          Toque em uma estrela para avaliar o atendimento:
        </p>

        <!-- Estrelas -->
        <div class="flex justify-center gap-2 mb-6">
          <button
            v-for="n in 5"
            :key="n"
            type="button"
            class="flex flex-col items-center gap-1 px-3 py-2 rounded-xl border-2 transition-all"
            :class="
              nota === n
                ? 'border-sky-500 bg-[#e8f9fc]'
                : 'border-gray-200 bg-gray-50 hover:border-sky-500'
            "
            @click="nota = n"
          >
            <span class="text-3xl">{{ emojis[n - 1] }}</span>
            <span class="text-[10px] text-gray-500 leading-tight max-w-13">{{
              labels[n - 1]
            }}</span>
          </button>
        </div>

        <button
          type="button"
          class="w-full py-3 rounded-xl text-white font-semibold text-sm transition-opacity disabled:opacity-50"
          style="background-color: #1d9fb6"
          :disabled="!nota || carregando"
          @click="enviar"
        >
          <span v-if="carregando">Enviando...</span>
          <span v-else>Enviar avaliação</span>
        </button>
      </template>

      <p class="text-gray-300 text-xs mt-8">Powered by AninPet</p>
    </div>
  </div>
</template>
