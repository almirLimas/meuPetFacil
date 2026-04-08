<script setup lang="ts">
const {
  pendentes,
  count,
  loading,
  iniciar,
  parar,
  concluir,
  cancelar,
  naoCompareceu,
} = useNotificacoes();

const open = ref(false);
const rootRef = ref<HTMLElement | null>(null);

onMounted(() => {
  iniciar();
  document.addEventListener("mousedown", handleClickFora);
});

onUnmounted(() => {
  parar();
  document.removeEventListener("mousedown", handleClickFora);
});

function handleClickFora(e: MouseEvent) {
  if (rootRef.value && !rootRef.value.contains(e.target as Node)) {
    open.value = false;
  }
}

function toggleOpen() {
  open.value = !open.value;
}

function formatarHora(dataHora: string) {
  return new Date(dataHora).toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatarData(dataHora: string) {
  const d = new Date(dataHora);
  const hoje = new Date();
  const ontem = new Date();
  ontem.setDate(hoje.getDate() - 1);

  if (d.toDateString() === hoje.toDateString()) return "hoje";
  if (d.toDateString() === ontem.toDateString()) return "ontem";
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
}
</script>

<template>
  <div ref="rootRef" class="relative">
    <!-- Botão sino -->
    <div class="relative">
      <UButton
        icon="i-lucide-bell"
        color="neutral"
        variant="ghost"
        aria-label="Notificações"
        @click="toggleOpen"
      />
      <span
        v-if="count > 0"
        class="absolute -top-0.5 -right-0.5 text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center pointer-events-none"
        style="background-color: #8b5cf6"
      >
        {{ count > 9 ? "9+" : count }}
      </span>
    </div>

    <!-- Dropdown -->
    <div
      v-if="open"
      class="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-200 z-50 overflow-hidden"
    >
      <!-- Header -->
      <div
        class="flex items-center justify-between px-4 py-3 border-b border-gray-100"
      >
        <p class="text-sm font-semibold text-gray-800">
          Agendamentos pendentes
        </p>
        <div class="flex items-center gap-2">
          <UBadge
            v-if="count > 0"
            :label="String(count)"
            color="secondary"
            variant="subtle"
            size="sm"
          />
          <UButton
            icon="i-lucide-x"
            size="xs"
            color="neutral"
            variant="ghost"
            aria-label="Fechar"
            @click="open = false"
          />
        </div>
      </div>

      <!-- Lista -->
      <div class="max-h-80 overflow-y-auto divide-y divide-gray-50">
        <!-- Vazio -->
        <div
          v-if="count === 0"
          class="flex flex-col items-center gap-2 py-8 text-gray-400"
        >
          <UIcon name="i-lucide-bell-off" class="text-2xl" />
          <p class="text-sm">Nenhum agendamento pendente</p>
        </div>

        <!-- Itens -->
        <div
          v-for="ag in pendentes"
          :key="ag.id"
          class="px-4 py-3 hover:bg-gray-50 transition-colors"
        >
          <div class="flex items-start justify-between gap-2 mb-2">
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium text-gray-800 truncate">
                {{ ag.pet.nome }}
                <span class="text-gray-400 font-normal">·</span>
                {{ ag.servicos.map((s) => s.servico.nome).join(", ") }}
              </p>
              <p class="text-xs text-gray-500 mt-0.5">
                {{ ag.cliente.nome }} ·
                <span class="font-medium" style="color: #8b5cf6">
                  {{ formatarData(ag.dataHora) }} às
                  {{ formatarHora(ag.dataHora) }}
                </span>
              </p>
            </div>
          </div>

          <!-- Ações -->
          <div class="flex gap-2">
            <UButton
              size="xs"
              color="warning"
              variant="soft"
              label="Não Compareceu"
              icon="i-lucide-user-x"
              :loading="loading"
              class="flex-1"
              @click="naoCompareceu(ag.id)"
            />
            <UButton
              size="xs"
              color="success"
              variant="solid"
              label="Concluir"
              icon="i-lucide-check-check"
              :loading="loading"
              class="flex-1"
              @click="concluir(ag.id)"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
