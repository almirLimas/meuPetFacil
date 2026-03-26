<script setup lang="ts">
const open = ref(true);
const route = useRoute();

const menuItems = [
  { label: "Dashboard", icon: "i-lucide-layout-dashboard", to: "/dashboard" },
  { label: "Clientes", icon: "i-lucide-users", to: "/clientes" },
  {
    label: "Novo Cliente",
    icon: "i-lucide-user-plus",
    to: "/cadastro-cliente",
  },
  { label: "Agenda", icon: "i-lucide-calendar", to: "/agenda" },
  { label: "Vacinas", icon: "i-lucide-syringe", to: "/vacinas" },
  { label: "Serviços", icon: "i-lucide-briefcase", to: "/servicos" },
  { label: "Estoque", icon: "i-lucide-package", to: "/estoque" },
  { label: "Relatórios", icon: "i-lucide-bar-chart-2", to: "/relatorios" },
];

// Começa fechado no mobile
onMounted(() => {
  if (window.innerWidth < 768) open.value = false;
});

// Fecha a sidebar ao navegar no mobile
watch(
  () => route.path,
  () => {
    if (import.meta.client && window.innerWidth < 768) open.value = false;
  },
);
</script>

<template>
  <div class="min-h-screen flex flex-col bg-[#f8f8f5] dark:bg-neutral-950">
    <!-- ===== HEADER (NuxtUI) ===== -->
    <UHeader
      toggle-side="left"
      :toggle="false"
      :ui="{ container: 'max-w-full px-4 sm:px-6' }"
    >
      <template #left>
        <!-- Logo -->
        <div class="flex items-center gap-2 ml-2">
          <AppMascot />
        </div>
        <!-- Sidebar toggle -->
        <UButton
          icon="i-lucide-panel-left"
          color="neutral"
          variant="ghost"
          aria-label="Toggle sidebar"
          @click="open = !open"
        />
      </template>

      <!-- Search (center) -->
      <UInput
        placeholder="Buscar..."
        leading-icon="i-lucide-search"
        size="sm"
        class="rounded-full max-w-xs w-full hidden md:block"
      />

      <template #right>
        <!-- Notificações -->
        <div class="relative">
          <UButton
            icon="i-lucide-bell"
            color="neutral"
            variant="ghost"
            aria-label="Notificações"
          />
          <span
            class="absolute -top-0.5 -right-0.5 text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center pointer-events-none"
            style="background-color: #8B5CF6"
            >3</span
          >
        </div>

        <!-- Mensagens -->
        <UButton
          icon="i-lucide-mail"
          color="neutral"
          variant="ghost"
          aria-label="Mensagens"
        />

        <!-- Tema claro/escuro -->
        <UColorModeButton />

        <!-- Avatar usuário -->
        <div class="flex items-center gap-2 cursor-pointer">
          <div
            class="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
            style="background-color: #e85a8a"
          >
            AV
          </div>
          <span class="text-sm font-medium hidden sm:inline"
            >Ana Veterinária</span
          >
          <UIcon name="i-lucide-chevron-down" class="size-4" />
        </div>
      </template>
    </UHeader>

    <!-- ===== BODY (sidebar + page content) ===== -->
    <div class="flex flex-1 min-h-0">
      <!-- Backdrop mobile -->
      <Teleport to="body">
        <div
          v-if="open"
          class="fixed inset-0 bg-black/40 z-40 md:hidden"
          @click="open = false"
        />
      </Teleport>

      <!-- Sidebar -->
      <transition name="sidebar">
        <aside
          v-show="open"
          class="fixed top-16 left-0 bottom-0 z-50 w-56 md:relative md:top-auto md:left-auto md:bottom-auto md:z-auto md:w-44 shrink-0 md:m-4 md:mr-0 bg-white dark:bg-neutral-800 md:rounded-2xl shadow-xl md:shadow-sm py-3 flex flex-col gap-0.5 overflow-y-auto"
        >
          <NuxtLink
            v-for="item in menuItems"
            :key="item.label"
            :to="item.to"
            class="flex items-center gap-3 mx-2 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors"
            :class="
              route.path === item.to
                ? 'text-white'
                : 'text-gray-500 dark:text-gray-400 hover:bg-blue-50 dark:hover:bg-neutral-700'
            "
            :style="
              route.path === item.to ? { backgroundColor: '#0EA5E9' } : {}
            "
          >
            <UIcon :name="item.icon" class="size-4.5 shrink-0" />
            {{ item.label }}
          </NuxtLink>
        </aside>
      </transition>

      <main class="flex-1 p-4 overflow-auto flex flex-col gap-4">
        <slot />
      </main>
    </div>
  </div>
</template>

<style scoped>
/* Mobile: slide in/out from left */
.sidebar-enter-active,
.sidebar-leave-active {
  transition:
    transform 0.25s ease,
    opacity 0.2s ease;
}
.sidebar-enter-from,
.sidebar-leave-to {
  transform: translateX(-100%);
  opacity: 0;
}

/* Desktop: shrink width */
@media (min-width: 768px) {
  .sidebar-enter-active,
  .sidebar-leave-active {
    transition:
      width 0.2s ease,
      opacity 0.2s ease,
      margin 0.2s ease;
    overflow: hidden;
  }
  .sidebar-enter-from,
  .sidebar-leave-to {
    transform: none;
    width: 0;
    opacity: 0;
    margin: 0;
  }
}
</style>
