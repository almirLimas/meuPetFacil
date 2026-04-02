<template>
  <div class="max-w-2xl mx-auto px-4 py-8 space-y-6">
    <!-- Cabeçalho -->
    <div>
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
        Meu Perfil
      </h1>
      <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
        Gerencie suas informações pessoais e senha de acesso.
      </p>
    </div>

    <!-- Card assinatura -->
    <div
      v-if="auth.usuario"
      class="rounded-2xl px-5 py-4 flex items-center justify-between text-sm"
      :class="assinaturaClass"
    >
      <div class="flex items-center gap-2">
        <UIcon :name="assinaturaIcon" class="size-4" />
        <span class="font-medium">{{ assinaturaLabel }}</span>
      </div>
      <span v-if="diasTrial !== null" class="text-xs opacity-80">
        {{ diasTrial > 0 ? `${diasTrial} dias restantes` : "Expirado" }}
      </span>
    </div>

    <!-- Dados pessoais -->
    <div
      class="bg-white dark:bg-neutral-800 rounded-2xl shadow-sm p-6 space-y-5"
    >
      <h2 class="font-semibold text-gray-800 dark:text-gray-100 text-base">
        Dados Pessoais
      </h2>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div class="flex flex-col gap-1.5">
          <label class="text-xs font-medium text-gray-600 dark:text-gray-300"
            >Nome completo</label
          >
          <UInput v-model="form.nomeCompleto" placeholder="Seu nome" />
        </div>
        <div class="flex flex-col gap-1.5">
          <label class="text-xs font-medium text-gray-600 dark:text-gray-300"
            >E-mail</label
          >
          <UInput :value="auth.usuario?.email" disabled placeholder="E-mail" />
          <span class="text-[11px] text-gray-400"
            >O e-mail não pode ser alterado.</span
          >
        </div>
        <div class="flex flex-col gap-1.5">
          <label class="text-xs font-medium text-gray-600 dark:text-gray-300"
            >Telefone</label
          >
          <UInput v-model="form.telefone" placeholder="(11) 99999-9999" />
        </div>
        <div class="flex flex-col gap-1.5">
          <label class="text-xs font-medium text-gray-600 dark:text-gray-300"
            >Petshop</label
          >
          <UInput
            :value="auth.usuario?.nomePetshop"
            disabled
            placeholder="Nome do petshop"
          />
        </div>
      </div>

      <div class="flex justify-end">
        <UButton
          :loading="salvandoDados"
          :disabled="salvandoDados"
          class="text-sm font-semibold rounded-xl text-white px-6"
          style="background-color: #f07030"
          @click="salvarDados"
        >
          Salvar Dados
        </UButton>
      </div>
    </div>

    <!-- Trocar senha -->
    <div
      class="bg-white dark:bg-neutral-800 rounded-2xl shadow-sm p-6 space-y-5"
    >
      <h2 class="font-semibold text-gray-800 dark:text-gray-100 text-base">
        Alterar Senha
      </h2>

      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div class="flex flex-col gap-1.5">
          <label class="text-xs font-medium text-gray-600 dark:text-gray-300"
            >Senha atual</label
          >
          <UInput
            v-model="senha.atual"
            :type="showSenhaAtual ? 'text' : 'password'"
            placeholder="••••••••"
          >
            <template #trailing>
              <UButton
                type="button"
                color="neutral"
                variant="ghost"
                size="sm"
                :icon="showSenhaAtual ? 'i-lucide-eye-off' : 'i-lucide-eye'"
                @click="showSenhaAtual = !showSenhaAtual"
              />
            </template>
          </UInput>
        </div>
        <div class="flex flex-col gap-1.5">
          <label class="text-xs font-medium text-gray-600 dark:text-gray-300"
            >Nova senha</label
          >
          <UInput
            v-model="senha.nova"
            :type="showSenhaNova ? 'text' : 'password'"
            placeholder="••••••••"
          >
            <template #trailing>
              <UButton
                type="button"
                color="neutral"
                variant="ghost"
                size="sm"
                :icon="showSenhaNova ? 'i-lucide-eye-off' : 'i-lucide-eye'"
                @click="showSenhaNova = !showSenhaNova"
              />
            </template>
          </UInput>
        </div>
        <div class="flex flex-col gap-1.5">
          <label class="text-xs font-medium text-gray-600 dark:text-gray-300"
            >Confirmar nova senha</label
          >
          <UInput
            v-model="senha.confirmar"
            :type="showSenhaConfirmar ? 'text' : 'password'"
            placeholder="••••••••"
          >
            <template #trailing>
              <UButton
                type="button"
                color="neutral"
                variant="ghost"
                size="sm"
                :icon="showSenhaConfirmar ? 'i-lucide-eye-off' : 'i-lucide-eye'"
                @click="showSenhaConfirmar = !showSenhaConfirmar"
              />
            </template>
          </UInput>
        </div>
      </div>

      <div class="flex justify-end">
        <UButton
          :loading="salvandoSenha"
          :disabled="
            salvandoSenha ||
            !senha.atual ||
            !senha.nova ||
            senha.nova !== senha.confirmar
          "
          class="text-sm font-semibold rounded-xl text-white px-6"
          style="background-color: #f07030"
          @click="salvarSenha"
        >
          Alterar Senha
        </UButton>
      </div>
      <p
        v-if="senha.nova && senha.confirmar && senha.nova !== senha.confirmar"
        class="text-xs text-red-500 -mt-2"
      >
        As senhas não coincidem.
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
useBreadcrumb().set([{ label: "Configurações" }, { label: "Perfil" }]);
import { useAuthStore } from "~/stores/auth";
const auth = useAuthStore();
const { show: showError } = useApiError();
const config = useRuntimeConfig();

// ── Form dados pessoais ────────────────────────────────────────────────────
const form = reactive({
  nomeCompleto: auth.usuario?.nomeCompleto ?? "",
  telefone: auth.usuario?.telefone ?? "",
});

// ── Form senha ─────────────────────────────────────────────────────────────
const senha = reactive({ atual: "", nova: "", confirmar: "" });
const showSenhaAtual = ref(false);
const showSenhaNova = ref(false);
const showSenhaConfirmar = ref(false);

// ── Loading states ─────────────────────────────────────────────────────────
const salvandoDados = ref(false);
const salvandoSenha = ref(false);

// ── Assinatura badge ───────────────────────────────────────────────────────
const diasTrial = computed(() => {
  if (auth.usuario?.assinaturaStatus !== "trial" || !auth.usuario.trialExpiraEm)
    return null;
  const diff = new Date(auth.usuario.trialExpiraEm).getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
});

const assinaturaLabel = computed(() => {
  const s = auth.usuario?.assinaturaStatus;
  const plano = auth.usuario?.plano ?? "basico";
  const nomes: Record<string, string> = {
    basico: "Básico",
    plus: "Plus",
    profissional: "Plus",
    completo: "Plus",
  };
  if (s === "trial") return `Período de teste — Plano ${nomes[plano]}`;
  if (s === "ativa") return `Assinatura ativa — Plano ${nomes[plano]}`;
  if (s === "suspensa") return "Assinatura suspensa";
  if (s === "cancelada") return "Assinatura cancelada";
  return `Plano ${nomes[plano]}`;
});

const assinaturaClass = computed(() => {
  const s = auth.usuario?.assinaturaStatus;
  if (s === "ativa")
    return "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400";
  if (s === "suspensa" || s === "cancelada")
    return "bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400";
  return "bg-sky-50 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400";
});

const assinaturaIcon = computed(() => {
  const s = auth.usuario?.assinaturaStatus;
  if (s === "ativa") return "i-lucide-badge-check";
  if (s === "suspensa" || s === "cancelada") return "i-lucide-alert-circle";
  return "i-lucide-clock";
});

// ── Actions ────────────────────────────────────────────────────────────────
async function salvarDados() {
  salvandoDados.value = true;
  try {
    await $fetch(`${config.public.apiUrl}/auth/perfil`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${useCookie("auth_token").value}` },
      body: { nomeCompleto: form.nomeCompleto, telefone: form.telefone },
    });
    if (auth.usuario) {
      auth.usuario.nomeCompleto = form.nomeCompleto;
      auth.usuario.telefone = form.telefone;
    }
    useToast().add({
      title: "Dados atualizados com sucesso!",
      color: "success",
    });
  } catch (err: unknown) {
    const data = (err as { data?: { message?: string | string[] } })?.data;
    const msg = Array.isArray(data?.message)
      ? data.message.join(", ")
      : (data?.message ?? "Erro ao salvar dados.");
    showError(msg);
  } finally {
    salvandoDados.value = false;
  }
}

async function salvarSenha() {
  salvandoSenha.value = true;
  try {
    await $fetch(`${config.public.apiUrl}/auth/perfil`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${useCookie("auth_token").value}` },
      body: { senhaAtual: senha.atual, novaSenha: senha.nova },
    });
    senha.atual = "";
    senha.nova = "";
    senha.confirmar = "";
    useToast().add({ title: "Senha alterada com sucesso!", color: "success" });
  } catch (err: unknown) {
    const data = (err as { data?: { message?: string | string[] } })?.data;
    const msg = Array.isArray(data?.message)
      ? data.message.join(", ")
      : (data?.message ?? "Senha atual incorreta.");
    showError(msg);
  } finally {
    salvandoSenha.value = false;
  }
}
</script>
