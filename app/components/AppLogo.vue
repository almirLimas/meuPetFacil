<template>
  <img src="/logo_aninpet.png" alt="Anim Pet" :style="{ maxWidth: size + 'px' }" class="w-full h-auto object-contain" />
</template>

<script setup lang="ts">
withDefaults(defineProps<{ size?: number }>(), { size: 160 });
</script>