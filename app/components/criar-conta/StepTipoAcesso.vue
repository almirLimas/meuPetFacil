<script setup lang="ts">
import type { CriarContaFormState, UsuarioPerfil } from "~/types/usuario";
import { PERMISSOES } from "~/types/usuario";

const state = defineModel<CriarContaFormState>({ required: true });

const perfis: {
  value: UsuarioPerfil;
  label: string;
  descricao: string;
  icon: string;
  bg: string;
  iconColor: string;
}[] = [
  {
    value: "admin",
    label: "Administrador",
    descricao:
      "Acesso total ao sistema: clientes, agendamentos, financeiro, relatórios e gerenciamento de usuários.",
    icon: "i-lucide-shield-check",
    bg: "#EDE9FE",
    iconColor: "#8B5CF6",
  },
  {
    value: "staff",
    label: "Staff / Atendente",
    descricao:
      "Acesso operacional: clientes, pets, agendamentos, vacinas e estoque. Sem acesso a financeiro ou usuários.",
    icon: "i-lucide-user-check",
    bg: "#E0F2FE",
    iconColor: "#0EA5E9",
  },
];

const perfilLabel: Record<UsuarioPerfil, string> = {
  admin: "Administrador",
  staff: "Staff / Atendente",
};

const perfilIconColor: Record<UsuarioPerfil, string> = {
  admin: "#8B5CF6",
  staff: "#0EA5E9",
};

const moduloLabels: Record<string, string> = {
  dashboard: "Dashboard",
  clientes: "Clientes",
  pets: "Pets",
  agendamentos: "Agendamentos",
  vacinas: "Vacinas",
  estoque: "Estoque",
  financeiro: "Financeiro",
  relatorios: "Relatórios",
  usuarios: "Usuários",
  configuracoes: "Configurações",
};

const permissoesDoPerfil = computed(() =>
  PERMISSOES[state.value.perfil].map((m) => moduloLabels[m] ?? m),
);

function selecionarPerfil(perfil: UsuarioPerfil) {
  state.value.perfil = perfil;
}

defineExpose({
  validate(): boolean {
    return !!state.value.perfil;
  },
});
</script>

<template>
  <div class="flex flex-col gap-6">
    <!-- Seletor de perfil -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <button
        v-for="p in perfis"
        :key="p.value"
        type="button"
        class="flex flex-col items-start gap-3 p-5 rounded-xl border-2 transition-all text-left cursor-pointer"
        :class="
          state.perfil === p.value
            ? 'border-secondary-400 shadow-md'
            : 'border-gray-200 hover:border-gray-300'
        "
        :style="state.perfil === p.value ? `background: ${p.bg}` : ''"
        @click="selecionarPerfil(p.value)"
      >
        <div
          class="flex items-center justify-center w-10 h-10 rounded-lg"
          :style="`background: ${p.bg}`"
        >
          <UIcon
            :name="p.icon"
            class="text-xl"
            :style="`color: ${p.iconColor}`"
          />
        </div>
        <div>
          <p class="font-semibold text-gray-800">{{ p.label }}</p>
          <p class="text-sm text-gray-500 mt-1">{{ p.descricao }}</p>
        </div>
      </button>
    </div>

    <!-- Resumo de permissões -->
    <div
      v-if="state.perfil"
      class="rounded-xl border border-gray-200 p-4 bg-white"
    >
      <div class="flex items-center gap-2 mb-3">
        <UIcon
          name="i-lucide-key"
          class="text-base"
          :style="`color: ${perfilIconColor[state.perfil]}`"
        />
        <p class="text-sm font-semibold text-gray-700">
          Permissões do {{ perfilLabel[state.perfil] }}
        </p>
      </div>
      <div class="flex flex-wrap gap-2">
        <span
          v-for="modulo in permissoesDoPerfil"
          :key="modulo"
          class="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600"
        >
          {{ modulo }}
        </span>
      </div>
    </div>

    <!-- Status da conta -->
    <UFormField label="Status da conta" name="status">
      <div class="flex gap-3">
        <label
          v-for="opt in ['ativo', 'inativo']"
          :key="opt"
          class="flex items-center gap-2 cursor-pointer select-none"
        >
          <input
            v-model="state.status"
            type="radio"
            :value="opt"
            class="accent-secondary-500"
          />
          <span class="text-sm capitalize text-gray-700">{{ opt }}</span>
        </label>
      </div>
    </UFormField>
  </div>
</template>
