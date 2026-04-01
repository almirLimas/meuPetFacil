<template>
  <img
    src="/logo_aninpet.png"
    alt="Anim Pet"
    :style="{ maxWidth: size + 'px' }"
    class="h-full w-auto object-contain"
  />
</template>

<script setup lang="ts">
withDefaults(defineProps<{ size?: number }>(), { size: 160 });
</script>
