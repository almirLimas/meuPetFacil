<template>
  <UInput
    v-bind="$attrs"
    :model-value="masked"
    placeholder="000.000.000-00"
    maxlength="14"
    inputmode="numeric"
    @keydown="onKeydown"
    @paste="onPaste"
    @input="onInput"
  />
</template>

<script setup lang="ts">
defineOptions({ inheritAttrs: false });

const props = defineProps<{
  modelValue?: string;
}>();

const emit = defineEmits<{
  "update:modelValue": [value: string];
}>();

const { maskCpf } = useMask();

const masked = computed(() => maskCpf(props.modelValue ?? ""));

const ALLOWED_KEYS = new Set([
  "Backspace",
  "Delete",
  "Tab",
  "Escape",
  "Enter",
  "ArrowLeft",
  "ArrowRight",
  "ArrowUp",
  "ArrowDown",
  "Home",
  "End",
]);

const onKeydown = (event: KeyboardEvent) => {
  if (event.ctrlKey || event.metaKey) return; // allow Ctrl+C, Ctrl+V etc.
  if (ALLOWED_KEYS.has(event.key)) return;
  if (!/^\d$/.test(event.key)) event.preventDefault();
};

const onPaste = (event: ClipboardEvent) => {
  event.preventDefault();
  const text = event.clipboardData?.getData("text") ?? "";
  emit("update:modelValue", maskCpf(text));
};

const onInput = (event: Event) => {
  const input = event.target as HTMLInputElement;
  emit("update:modelValue", maskCpf(input.value));
};
</script>
