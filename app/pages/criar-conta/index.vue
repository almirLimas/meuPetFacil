<script setup lang="ts">
import type { StepperItem } from "@nuxt/ui";
import type { CriarContaFormState } from "~/types/usuario";
import { useAuthStore } from "~/stores/auth";

definePageMeta({
  layout: false,
});

const auth = useAuthStore();
const toast = useToast();

// -- Estado compartilhado entre os steps -------------------------------------
const state = reactive<CriarContaFormState>({
  // Step 1
  nomeCompleto: "",
  email: "",
  telefone: "",
  senha: "",
  confirmarSenha: "",
  // Step 2
  plano: "profissional",
  // Step 3
  formaPagamento: "cartao",
  dadosCartao: { numero: "", nome: "", validade: "", cvv: "" },
  // Legacy (mantido para compatibilidade)
  perfil: "admin",
  status: "ativo",
});

// -- Stepper -----------------------------------------------------------------
const stepperItems: StepperItem[] = [
  {
    title: "Dados da Conta",
    description: "Acesso e segurança",
    icon: "i-lucide-user",
  },
  {
    title: "Escolha seu Plano",
    description: "Módulos e mensalidade",
    icon: "i-lucide-layout-grid",
  },
  {
    title: "Pagamento",
    description: "Forma de cobrança",
    icon: "i-lucide-credit-card",
  },
];

const currentStep = ref(0);
const isLastStep = computed(
  () => currentStep.value === stepperItems.length - 1,
);

// Steps além do atual ficam desabilitados (não clicáveis)
const stepperItemsComputed = computed(() =>
  stepperItems.map((item, idx) => ({
    ...item,
    disabled: idx > currentStep.value,
  })),
);

// Permite voltar para steps já visitados; bloqueia avançar via clique
const onStepClick = (index: string | number | undefined) => {
  if (typeof index === "number" && index < currentStep.value)
    currentStep.value = index;
};

// -- Refs dos componentes de step -------------------------------------------
const stepDados = ref();
const stepPlano = ref();
const stepPagamento = ref();
const stepRefs = [stepDados, stepPlano, stepPagamento];

// -- Navegação ---------------------------------------------------------------
const handleNext = async () => {
  const valid = await stepRefs[currentStep.value]?.value?.validate();
  if (!valid) return;

  if (isLastStep.value) {
    await submitForm();
  } else {
    currentStep.value++;
  }
};

const handlePrev = () => {
  if (currentStep.value > 0) currentStep.value--;
};

// -- Submit ------------------------------------------------------------------
const submitForm = async () => {
  try {
    await auth.registrar({
      nomeCompleto: state.nomeCompleto,
      email: state.email,
      telefone: state.telefone || undefined,
      senha: state.senha,
      plano: state.plano,
    });
    toast.add({
      title: "Conta criada com sucesso!",
      description:
        "Seus 14 dias gratuitos começam agora. Faça login para acessar o sistema.",
      color: "success",
    });
  } catch {
    toast.add({
      title: "Erro ao criar conta",
      description: "Tente novamente mais tarde.",
      color: "error",
    });
  }
};
</script>

<template>
  <div class="min-h-screen flex items-center justify-center px-4 py-10">
    <UCard class="w-full max-w-xl shadow-lg bg-white! ring-0">
      <!-- Cabeçalho com logo -->
      <template #header>
        <div class="flex flex-col items-center gap-4 pt-2 pb-1">
          <AppMascot :size="180" />
          <div class="text-center">
            <h1 class="text-xl font-bold text-gray-800">Criar conta</h1>
            <p class="text-sm text-gray-500 mt-0.5">
              Comece grátis por 14 dias, sem compromisso
            </p>
          </div>
          <UStepper
            :items="stepperItemsComputed"
            :model-value="currentStep"
            class="w-full mt-2"
            @update:model-value="onStepClick"
          />
        </div>
      </template>

      <!-- Conteúdo do step -->
      <div class="py-4 px-1">
        <CriarContaStepDadosConta
          v-if="currentStep === 0"
          ref="stepDados"
          v-model="state"
        />
        <CriarContaStepPlano
          v-else-if="currentStep === 1"
          ref="stepPlano"
          v-model="state"
        />
        <CriarContaStepPagamento
          v-else-if="currentStep === 2"
          ref="stepPagamento"
          v-model="state"
        />
      </div>

      <!-- Rodapé com navegação -->
      <template #footer>
        <div class="flex items-center justify-between gap-3">
          <!-- Voltar / link para login -->
          <div>
            <UButton
              v-if="currentStep > 0"
              color="neutral"
              variant="ghost"
              leading-icon="i-lucide-arrow-left"
              @click="handlePrev"
            >
              Voltar
            </UButton>
            <NuxtLink
              v-else
              to="/login"
              class="text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              ← Já tenho conta
            </NuxtLink>
          </div>

          <!-- Avançar / Criar -->
          <UButton
            color="secondary"
            :loading="auth.loading"
            :trailing-icon="
              isLastStep ? 'i-lucide-check' : 'i-lucide-arrow-right'
            "
            @click="handleNext"
          >
            {{ isLastStep ? "Criar conta" : "Continuar" }}
          </UButton>
        </div>
      </template>
    </UCard>
  </div>
</template>
