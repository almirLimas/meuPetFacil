<script setup lang="ts">
definePageMeta({ layout: "landing" });

const route = useRoute();
const nota = Number(route.query.nota);
const repetido = route.query.repetido === "1";

const emojis: Record<number, string> = {
  1: "😞",
  2: "😕",
  3: "😐",
  4: "🙂",
  5: "😍",
};

const mensagens: Record<number, string> = {
  1: "Sentimos muito. Seu feedback vai nos ajudar a melhorar.",
  2: "Obrigado por ser honesto. Vamos trabalhar para melhorar.",
  3: "Obrigado! Estamos sempre buscando melhorar.",
  4: "Que bom! Continuaremos trabalhando para chegar no excelente.",
  5: "Uhuuu! Isso nos motiva muito a continuar! 🚀",
};
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 px-6">
    <div
      class="max-w-md w-full bg-white rounded-2xl shadow-sm border border-gray-100 p-10 text-center flex flex-col items-center gap-5"
    >
      <template v-if="repetido">
        <div class="text-5xl">✅</div>
        <h1 class="text-2xl font-bold text-gray-800">Você já respondeu!</h1>
        <p class="text-gray-500 text-sm">
          Sua avaliação já foi registrada. Obrigado!
        </p>
      </template>
      <template v-else>
        <div class="text-6xl">{{ emojis[nota] ?? "🐾" }}</div>
        <h1 class="text-2xl font-bold text-gray-800">
          Obrigado pelo feedback!
        </h1>
        <p class="text-gray-500 text-sm leading-relaxed">
          {{ mensagens[nota] ?? "Sua avaliação foi registrada com sucesso." }}
        </p>
        <p class="text-xs text-gray-400">
          Sua opinião é muito importante para o AninPet continuar crescendo.
        </p>
      </template>
      <NuxtLink
        to="/dashboard"
        class="mt-2 inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-semibold text-sm transition-colors"
      >
        Voltar ao sistema
      </NuxtLink>
    </div>
  </div>
</template>
