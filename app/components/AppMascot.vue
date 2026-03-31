<template>
  <img
    src="/logo_aninpet.png"
    alt="Anim Pet"
    :width="size"
    :height="size"
    class="object-contain block mx-auto"
  />
</template>

<script setup lang="ts">
withDefaults(defineProps<{ size?: number }>(), { size: 160 });
</script>
