<template>
  <UApp :toaster="{ position: 'top-center' }">
    <NuxtLoadingIndicator color="#1d9fb6" />
    <NuxtRouteAnnouncer />
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </UApp>
</template>
