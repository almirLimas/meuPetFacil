<template>
  <div>Redirecionando…</div>
</template>

<script setup>
import { onMounted } from "vue";
import { navigateTo } from "#imports";

onMounted(() => {
  navigateTo("/login");
});
</script>
