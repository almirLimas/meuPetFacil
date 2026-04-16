<script setup lang="ts">
import { useAuthStore } from "~/stores/auth";

const auth = useAuthStore();
</script>

<template>
  <UApp :toaster="{ position: 'top-center' }">
    <NuxtLoadingIndicator color="#1d9fb6" />
    <NuxtRouteAnnouncer />
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
    <AppAssistente v-if="auth.isAutenticado" />
  </UApp>
</template>
