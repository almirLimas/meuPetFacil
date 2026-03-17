<template>
  <UInput v-bind="props" :color="props.color ?? 'secondary'">
    <template v-for="(_, slot) in $slots" #[slot]="slotProps">
      <slot :name="slot" v-bind="slotProps" />
    </template>
  </UInput>
</template>

<script setup lang="ts">
const props = defineProps({
  color: {
    type: String as () =>
      | "neutral"
      | "primary"
      | "secondary"
      | "success"
      | "info"
      | "warning"
      | "error"
      | undefined,
    default: "secondary",
  },
});
</script>
