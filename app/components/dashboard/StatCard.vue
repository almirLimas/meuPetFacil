<script setup lang="ts">
defineProps<{
  lines: string[];
  value: string;
  icon: string;
  bgColor: string;
  iconColor: string;
}>();
</script>

<template>
  <div
    class="bg-white dark:bg-neutral-800 rounded-2xl p-4 shadow-sm flex items-center justify-between gap-3"
  >
    <div>
      <p class="text-xs text-gray-500 dark:text-gray-400 leading-snug">
        <span v-for="(line, i) in lines" :key="i">
          {{ line }}<br v-if="i < lines.length - 1" />
        </span>
      </p>
      <p
        class="text-3xl font-extrabold text-gray-800 dark:text-gray-100 mt-1 leading-none"
      >
        {{ value }}
      </p>
    </div>
    <div
      class="w-12 h-12 rounded-full flex items-center justify-center shrink-0"
      :style="{ backgroundColor: bgColor }"
    >
      <UIcon :name="icon" class="size-6" :style="{ color: iconColor }" />
    </div>
  </div>
</template>
