<script setup lang="ts">
import type { StepperItem } from "@nuxt/ui";
import type { CriarContaFormState } from "~/types/usuario";
import type { ResultadoPagamento } from "~/composables/usePagamento";
import { useAuthStore } from "~/stores/auth";

definePageMeta({
  layout: false,
  colorMode: "light",
});

useSeoMeta({
  robots: "index, follow",
});

useHead({
  link: [{ rel: "canonical", href: "https://www.aninpet.com.br/criar-conta" }],
});

const auth = useAuthStore();
const toast = useToast();

// -- Estado compartilhado entre os steps -------------------------------------
const state = reactive<CriarContaFormState>({
  // Step 1
  nomePetshop: "",
  nomeCompleto: "",
  email: "",
  cpf: "",
  telefone: "",
  senha: "",
  confirmarSenha: "",
  // Step 2
  plano: "plus",
  // Step 3
  formaPagamento: "cartao",
  // Legacy
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
    description: "7 dias grátis",
    icon: "i-lucide-layout-grid",
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
const stepRefs = [stepDados, stepPlano];

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
const pixCheckout = useState<ResultadoPagamento | null>(
  "pix-checkout",
  () => null,
);

const submitForm = async () => {
  try {
    const res = await auth.registrar({
      nomePetshop: state.nomePetshop,
      nomeCompleto: state.nomeCompleto,
      email: state.email,
      cpf: state.cpf,
      telefone: state.telefone || undefined,
      senha: state.senha,
      plano: state.plano,
    });

    if (!res) return; // erro já exibido pelo store

    const { iniciarPagamento } = usePagamento();
    const resultado = await iniciarPagamento({
      plano: state.plano,
    });

    if (resultado.tipo === "checkout") {
      globalThis.location.href = resultado.url;
    } else if (resultado.tipo === "trial") {
      await navigateTo("/criar-conta/sucesso");
    }
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
    <UCard class="w-full max-w-xl shadow-lg ring-0">
      <!-- Cabeçalho com logo -->
      <template #header>
        <div class="flex flex-col items-center gap-4 pt-2 pb-1">
          <AppMascot :size="180" />
          <div class="text-center">
            <h1 class="text-xl font-bold text-gray-800 dark:text-gray-100">
              Criar conta
            </h1>
            <p class="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              7 dias grátis — cancele quando quiser
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
