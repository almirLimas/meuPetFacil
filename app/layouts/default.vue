<script setup lang="ts">
const open = ref(true);
const route = useRoute();

const menuItems = [
  { label: "Dashboard", icon: "i-lucide-layout-dashboard", to: "/dashboard" },
  { label: "Clientes", icon: "i-lucide-users", to: "/clientes" },
  { label: "Agenda", icon: "i-lucide-calendar", to: "/agenda" },
  { label: "Vacinas", icon: "i-lucide-syringe", to: "/vacinas" },
  { label: "Serviços", icon: "i-lucide-briefcase", to: "/servicos" },
  { label: "Relatórios", icon: "i-lucide-bar-chart-2", to: "/relatorios" },
];
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
        class="rounded-full max-w-xs w-full"
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
            style="background-color: #f5a523"
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
      <!-- Sidebar -->
      <transition name="sidebar">
        <aside
          v-show="open"
          class="w-44 shrink-0 m-4 mr-0 bg-white dark:bg-neutral-800 rounded-2xl shadow-sm py-3 flex flex-col gap-0.5"
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
              route.path === item.to ? { backgroundColor: '#4AADE8' } : {}
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
  width: 0;
  opacity: 0;
  margin: 0;
}
</style>
