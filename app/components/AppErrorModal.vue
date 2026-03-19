<script setup lang="ts">
const { message, clear } = useApiError();
</script>

<template>
  <UModal
    :open="!!message"
    :ui="{ footer: 'justify-center' }"
    @update:open="clear"
  >
    <template #content>
      <div class="flex flex-col items-center gap-4 p-6 text-center">
        <div class="rounded-full bg-red-100 p-3">
          <UIcon name="i-lucide-circle-alert" class="size-8 text-red-500" />
        </div>
        <div>
          <p class="font-semibold text-gray-800 text-base">Ocorreu um erro</p>
          <p class="text-sm text-gray-500 mt-1">{{ message }}</p>
        </div>
        <UButton color="secondary" class="w-full" @click="clear">
          Fechar
        </UButton>
      </div>
    </template>
  </UModal>
</template>
