<template>
  <img
    :src="'/anninLogo.png'"
    alt="Mascote Pet-Fácil"
    :width="size"
    :height="size"
    class="object-contain block mx-auto"
  />
</template>

<script setup lang="ts">
withDefaults(defineProps<{ size?: number }>(), { size: 160 });
</script>
