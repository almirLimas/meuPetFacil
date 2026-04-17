<script setup lang="ts">
const {
  mensagens,
  enviando,
  aberto,
  abrirAssistente,
  fecharAssistente,
  limparConversa,
  enviar,
} = useAssistente();

const input = ref("");
const messagesRef = ref<HTMLElement | null>(null);
const inputRef = ref<HTMLTextAreaElement | null>(null);

function focusInput() {
  nextTick(() => inputRef.value?.focus());
}

async function submit() {
  if (!input.value.trim() || enviando.value) return;
  const texto = input.value;
  input.value = "";
  await enviar(texto);
  focusInput();
}

function onKeydown(e: KeyboardEvent) {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    void submit();
  }
}

watch(mensagens, async () => {
  await nextTick();
  if (messagesRef.value) {
    messagesRef.value.scrollTop = messagesRef.value.scrollHeight;
  }
  focusInput();
});
</script>

<template>
  <!-- Painel de chat -->
  <Transition name="chat-panel">
    <div
      v-if="aberto"
      class="flex fixed z-50 flex-col bg-white dark:bg-gray-900 overflow-hidden inset-0 rounded-none sm:inset-auto sm:bottom-6 sm:right-6 sm:w-90 sm:max-w-[calc(100vw-2rem)] sm:h-130 sm:max-h-[calc(100vh-6rem)] sm:rounded-2xl sm:shadow-2xl sm:border sm:border-gray-200 dark:sm:border-gray-700"
    >
      <!-- Header -->
      <div
        class="flex items-center gap-2 px-4 py-3 bg-primary text-white shrink-0"
      >
        <img
          src="/anin.png"
          alt="Anin"
          class="size-16 object-contain drop-shadow"
        />
        <div class="flex-1 min-w-0">
          <p class="text-sm font-bold leading-tight">Assistente Anin</p>
          <p class="text-xs opacity-80 leading-tight">Powered by IA</p>
        </div>
        <button
          class="p-1 rounded-lg hover:bg-white/20 transition-colors"
          title="Nova conversa"
          @click="limparConversa"
        >
          <UIcon name="i-lucide-rotate-ccw" class="size-4" />
        </button>
        <button
          class="p-1 rounded-lg hover:bg-white/20 transition-colors"
          title="Fechar"
          @click="fecharAssistente"
        >
          <UIcon name="i-lucide-x" class="size-4" />
        </button>
      </div>

      <!-- Mensagens -->
      <div
        ref="messagesRef"
        class="flex-1 overflow-y-auto px-3 py-3 space-y-3 scroll-smooth"
      >
        <div
          v-for="msg in mensagens"
          :key="msg.id"
          :class="[
            'flex',
            msg.role === 'user' ? 'justify-end' : 'justify-start',
          ]"
        >
          <div
            v-if="msg.role === 'assistant'"
            class="flex items-end gap-1.5 max-w-[85%]"
          >
            <img
              src="/anin.png"
              alt="Anin"
              class="size-10 object-contain shrink-0 mb-0.5"
            />
            <div
              class="bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-100 rounded-2xl rounded-bl-sm px-3 py-2 text-sm leading-relaxed whitespace-pre-wrap"
            >
              {{ msg.content }}
            </div>
          </div>
          <div v-else class="max-w-[85%]">
            <div
              class="bg-primary text-white rounded-2xl rounded-br-sm px-3 py-2 text-sm leading-relaxed whitespace-pre-wrap"
            >
              {{ msg.content }}
            </div>
          </div>
        </div>

        <!-- Indicador de digitação -->
        <div v-if="enviando" class="flex items-end gap-1.5">
          <img
            src="/anin.png"
            alt="Anin"
            class="size-10 object-contain shrink-0"
          />
          <div
            class="bg-gray-100 dark:bg-gray-800 rounded-2xl rounded-bl-sm px-3 py-2.5"
          >
            <div class="flex gap-1 items-center">
              <span
                class="size-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:0ms]"
              />
              <span
                class="size-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:150ms]"
              />
              <span
                class="size-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:300ms]"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- Sugestões rápidas -->
      <div
        v-if="mensagens.length <= 1"
        class="px-3 pb-1 flex gap-1.5 flex-wrap"
      >
        <button
          v-for="sugestao in [
            'Cadastrar cliente',
            'Criar agendamento',
            'Buscar cliente',
            'Cadastrar serviço',
            'Cadastrar produto',
          ]"
          :key="sugestao"
          class="text-xs bg-primary/10 text-primary rounded-full px-2.5 py-1 hover:bg-primary/20 transition-colors"
          @click="enviar(sugestao)"
        >
          {{ sugestao }}
        </button>
      </div>

      <!-- Input -->
      <div
        class="px-3 pb-3 pt-1 shrink-0 border-t border-gray-100 dark:border-gray-800"
      >
        <div class="flex gap-2 items-end">
          <textarea
            ref="inputRef"
            v-model="input"
            rows="1"
            placeholder="Digite uma mensagem..."
            class="flex-1 resize-none bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-100 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/50 max-h-24 overflow-y-auto placeholder-gray-400"
            :disabled="enviando"
            @keydown="onKeydown"
            @input="
              ($event.target as HTMLTextAreaElement).style.height = 'auto';
              ($event.target as HTMLTextAreaElement).style.height =
                ($event.target as HTMLTextAreaElement).scrollHeight + 'px';
            "
          />
          <button
            class="size-9 rounded-xl bg-primary text-white flex items-center justify-center shrink-0 hover:bg-primary/80 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            :disabled="!input.trim() || enviando"
            @click="submit"
          >
            <UIcon name="i-lucide-send" class="size-4" />
          </button>
        </div>
      </div>
    </div>
  </Transition>

  <!-- Botão flutuante para abrir -->
  <Transition name="fab">
    <button
      v-if="!aberto"
      class="fixed bottom-6 right-4 sm:right-6 z-50 flex items-center gap-2 bg-white dark:bg-gray-800 shadow-xl border border-gray-200 dark:border-gray-700 transition-all group size-12 rounded-full p-0 justify-center sm:size-auto sm:rounded-2xl sm:px-3 sm:py-2 hover:shadow-2xl hover:scale-105"
      @click="abrirAssistente"
    >
      <!-- Ícone circular em mobile -->
      <img
        src="/anin.png"
        alt="Anin"
        class="size-8 sm:size-16 object-contain group-hover:scale-110 transition-transform"
      />
      <!-- Texto só em desktop -->
      <div class="hidden sm:block text-left pr-1">
        <p
          class="text-xs font-bold text-gray-800 dark:text-gray-100 leading-tight"
        >
          Assistente Anin
        </p>
        <p class="text-[10px] text-gray-400 leading-tight">
          Pergunte qualquer coisa
        </p>
      </div>
    </button>
  </Transition>
</template>

<style scoped>
.chat-panel-enter-active,
.chat-panel-leave-active {
  transition:
    opacity 0.25s,
    transform 0.25s;
}
.chat-panel-enter-from,
.chat-panel-leave-to {
  opacity: 0;
  transform: translateY(20px) scale(0.97);
}
.fab-enter-active,
.fab-leave-active {
  transition:
    opacity 0.2s,
    transform 0.2s;
}
.fab-enter-from,
.fab-leave-to {
  opacity: 0;
  transform: scale(0.8);
}
</style>
