<script setup lang="ts">
import { useAuthStore } from "~/stores/auth";

const open = ref(true);
const route = useRoute();
const authStore = useAuthStore();

const nomeUsuario = computed(
  () => authStore.usuario?.nomeCompleto ?? "Usuário",
);
const iniciaisUsuario = computed(() => {
  const partes = nomeUsuario.value.trim().split(" ").filter(Boolean);
  if (partes.length === 1) return partes[0].slice(0, 2).toUpperCase();
  return (partes[0][0] + partes[partes.length - 1][0]).toUpperCase();
});

const menuUsuario = computed(() => [
  [
    {
      label: nomeUsuario.value,
      slot: "account",
      disabled: true,
    },
  ],
  [
    {
      label: "Meu Perfil",
      icon: "i-lucide-user-circle",
      onSelect: () => navigateTo("/configuracoes/perfil"),
    },
    {
      label: "Minha Assinatura",
      icon: "i-lucide-credit-card",
      suffix: statusAssinaturaLabel.value,
      onSelect: () => navigateTo("/configuracoes/assinatura"),
    },
    {
      label: "Sair",
      icon: "i-lucide-log-out",
      onSelect: () => authStore.logout(),
    },
  ],
]);

const menuItems = [
  { label: "Dashboard", icon: "i-lucide-layout-dashboard", to: "/dashboard" },
  { label: "Clientes", icon: "i-lucide-users", to: "/clientes" },
  { label: "Agenda", icon: "i-lucide-calendar", to: "/agenda" },
  { label: "Serviços", icon: "i-lucide-briefcase", to: "/servicos" },
  { label: "Estoque", icon: "i-lucide-package", to: "/estoque" },
  { label: "Financeiro", icon: "i-lucide-wallet", to: "/financeiro" },
  { label: "Relatórios", icon: "i-lucide-bar-chart-2", to: "/relatorios" },
  {
    label: "WhatsApp",
    icon: "i-logos-whatsapp-icon",
    to: "/configuracoes/whatsapp",
  },
  {
    label: "Primeiros passos",
    icon: "i-lucide-rocket",
    to: "/primeiros-passos",
  },
];

const breadcrumb = useBreadcrumb();

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

// Skeleton global de navegação
const pageLoading = ref(false);
const router = useRouter();
router.beforeEach(() => {
  pageLoading.value = true;
});
router.afterEach(() => {
  pageLoading.value = false;
});

const assinaturaStatus = computed(() => authStore.usuario?.assinaturaStatus);
const assinaturaSuspensa = computed(
  () => assinaturaStatus.value === "suspensa",
);

const diasRestantesTrial = computed(() => {
  if (assinaturaStatus.value !== "trial") return null;
  const expira = authStore.usuario?.trialExpiraEm;
  if (!expira) return null;
  const diff = new Date(expira).getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
});

const statusAssinaturaLabel = computed(() => {
  const status = assinaturaStatus.value;
  if (status === "ativa") return "✅  Assinatura ativa";
  if (status === "trial") {
    const dias = diasRestantesTrial.value;
    if (dias === null) return "🕐  Trial gratuito";
    if (dias === 0) return "⚠️  Trial expirado";
    if (dias === 1) return "⚠️  Trial expira hoje!";
    return `🕐  Trial: ${dias} dias restantes`;
  }
  if (status === "suspensa") return "🔴  Assinatura suspensa";
  if (status === "cancelada") return "🚫  Assinatura cancelada";
  if (status === "pendente") return "⏳  Pagamento pendente";
  return "📋  Ver assinatura";
});
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
          <AppLogo :size="100" />
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

      <template #right>
        <!-- Notificações -->
        <NotificacoesSino />

        <!-- Tema claro/escuro -->
        <UColorModeButton />

        <!-- Avatar usuário com dropdown -->
        <UDropdownMenu :items="menuUsuario">
          <div class="flex items-center gap-2 cursor-pointer">
            <div
              class="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
              style="background-color: #1d9fb6"
            >
              {{ iniciaisUsuario }}
            </div>
            <span class="text-sm font-medium hidden sm:inline">{{
              nomeUsuario
            }}</span>
            <UIcon name="i-lucide-chevron-down" class="size-4" />
          </div>
        </UDropdownMenu>
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
              route.path === item.to ||
              (item.to !== '/dashboard' && route.path.startsWith(item.to))
                ? 'text-white'
                : 'text-gray-500 dark:text-gray-400 hover:bg-sky-50 dark:hover:bg-neutral-700'
            "
            :style="
              route.path === item.to ||
              (item.to !== '/dashboard' && route.path.startsWith(item.to))
                ? { backgroundColor: '#1d9fb6' }
                : {}
            "
          >
            <UIcon :name="item.icon" class="size-4.5 shrink-0" />
            {{ item.label }}
          </NuxtLink>

          <!-- Separador + Suporte -->
          <div
            class="mx-2 my-1 border-t border-gray-100 dark:border-neutral-700"
          />
          <a
            href="https://wa.me/5511966389057?text=Olá!%20Preciso%20de%20ajuda%20com%20o%20sistema%20Anin%20Pet."
            target="_blank"
            rel="noopener noreferrer"
            class="flex items-center gap-3 mx-2 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors text-gray-500 dark:text-gray-400 hover:bg-green-50 dark:hover:bg-neutral-700 hover:text-green-600 dark:hover:text-green-400"
          >
            <UIcon name="i-lucide-headset" class="size-4.5 shrink-0" />
            Suporte
          </a>
        </aside>
      </transition>

      <main class="flex-1 p-4 overflow-auto flex flex-col gap-4">
        <!-- Banner: assinatura suspensa -->
        <div
          v-if="assinaturaSuspensa"
          class="flex items-center justify-between gap-3 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-sm"
        >
          <div class="flex items-center gap-2 text-red-700">
            <UIcon name="i-lucide-alert-triangle" class="text-base shrink-0" />
            <span
              >Seu período de teste encerrou. Ative sua assinatura para
              continuar usando o sistema.</span
            >
          </div>
          <UButton
            to="/renovar-assinatura"
            color="error"
            size="xs"
            class="shrink-0"
          >
            Ativar agora
          </UButton>
        </div>

        <!-- Banner: trial expirando em breve (≤ 3 dias) -->
        <div
          v-else-if="diasRestantesTrial !== null && diasRestantesTrial <= 3"
          class="flex items-center justify-between gap-3 px-4 py-3 rounded-xl bg-amber-50 border border-amber-200 text-sm"
        >
          <div class="flex items-center gap-2 text-amber-700">
            <UIcon name="i-lucide-clock" class="text-base shrink-0" />
            <span>
              Seu período de teste termina
              <strong>{{
                diasRestantesTrial === 0
                  ? "hoje"
                  : `em ${diasRestantesTrial} dia${diasRestantesTrial > 1 ? "s" : ""}`
              }}</strong
              >.
            </span>
          </div>
          <UButton
            to="/renovar-assinatura"
            color="warning"
            size="xs"
            class="shrink-0"
          >
            Assinar agora
          </UButton>
        </div>
        <UBreadcrumb
          v-if="breadcrumb.items.value.length > 1"
          :items="breadcrumb.items.value"
          class="-mb-2"
        />
        <!-- Skeleton global durante navegação -->
        <template v-if="pageLoading">
          <div class="flex items-center justify-between">
            <div class="flex flex-col gap-1.5">
              <USkeleton class="h-6 w-40" />
              <USkeleton class="h-4 w-28" />
            </div>
            <USkeleton class="h-9 w-32 rounded-md" />
          </div>
          <USkeleton class="h-10 w-full rounded-xl" />
          <div class="flex flex-col gap-3">
            <USkeleton v-for="i in 5" :key="i" class="h-16 w-full rounded-xl" />
          </div>
        </template>
        <slot v-else />
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
