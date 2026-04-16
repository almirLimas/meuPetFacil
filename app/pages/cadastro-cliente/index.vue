<script setup lang="ts">
useBreadcrumb().set([
  { label: "Clientes", to: "/clientes" },
  { label: "Novo cliente" },
]);

import type { StepperItem } from "@nuxt/ui";
import type { ClienteFormState } from "~/types/cliente";
import type { PetFormState } from "~/types/pet";
import { useClienteStore } from "~/stores/cliente";

const clienteStore = useClienteStore();
const toast = useToast();
const { abrirAssistente } = useAssistente();

// -- Estado compartilhado entre os steps --------------------------------------
const state = reactive<ClienteFormState>({
  nome: "",
  cpf: "",
  telefonePrincipal: "",
  telefoneSecundario: "",
  email: "",
  cep: "",
  rua: "",
  numero: "",
  complemento: "",
  bairro: "",
  cidade: "",
  estado: "",
  dataNascimento: "",
  comoConheceu: "",
  observacoes: "",
  mensalista: false,
  valorMensal: null,
  diaVencimento: null,
  status: "Ativo",
  pets: [] as PetFormState[],
});

// -- Stepper -------------------------------------------------------------------
const stepperItems: StepperItem[] = [
  {
    title: "Dados Pessoais",
    description: "Nome, CPF, contatos",
    icon: "i-lucide-user",
  },
  {
    title: "Endereço",
    description: "CEP, rua, cidade...",
    icon: "i-lucide-map-pin",
  },
  {
    title: "Informações",
    description: "Status e observações",
    icon: "i-lucide-clipboard-list",
  },
  {
    title: "Pets",
    description: "Nome, raça e mais",
    icon: "i-lucide-paw-print",
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

// Bloqueia navegação via clique direto no stepper para frente;
// permite voltar para steps anteriores já visitados
const onStepClick = (index: string | number | undefined) => {
  if (typeof index === "number" && index < currentStep.value)
    currentStep.value = index;
};

// -- Refs dos componentes de step (para chamar validate()) ---------------------
const stepDados = ref();
const stepEndereco = ref();
const stepInfo = ref();
const stepPets = ref();
const stepRefs = [stepDados, stepEndereco, stepInfo, stepPets];

// -- Navegação -----------------------------------------------------------------
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

// -- Submit final --------------------------------------------------------------
const submitForm = async () => {
  try {
    await clienteStore.salvar({ ...state });
    toast.add({ title: "Cliente cadastrado com sucesso!", color: "success" });
    navigateTo("/clientes");
  } catch {
    toast.add({ title: "Erro ao cadastrar cliente", color: "error" });
  }
};
</script>

<template>
  <div class="flex flex-col gap-4">
    <!-- Cabeçalho -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-xl font-bold text-gray-800 dark:text-gray-100">
          Cadastro de Cliente
        </h1>
        <p class="text-sm text-gray-500 dark:text-gray-400">
          Preencha os dados para registrar um novo cliente
        </p>
      </div>
      <UButton
        to="/clientes"
        variant="ghost"
        leading-icon="i-lucide-arrow-left"
      >
        Voltar para clientes
      </UButton>
    </div>

    <!-- Banner IA -->
    <div
      class="flex items-center gap-2 px-3 py-2 rounded-lg bg-sky-50 dark:bg-sky-950 border border-sky-200 dark:border-sky-800 text-sm text-sky-700 dark:text-sky-300"
    >
      <img src="/anin.png" alt="Anin" class="size-5 object-contain shrink-0" />
      <span>Prefere que a <strong>Anin</strong> faça o cadastro pra você?</span>
      <button
        class="ml-auto font-medium underline underline-offset-2 hover:text-sky-900 dark:hover:text-sky-100 transition-colors"
        @click="abrirAssistente()"
      >
        Abrir chat
      </button>
    </div>

    <!-- Card do formulário -->
    <UCard class="ring-0 shadow-sm">
      <template #header>
        <UStepper
          :items="stepperItemsComputed"
          :model-value="currentStep"
          class="w-full"
          @update:model-value="onStepClick"
        />
      </template>

      <div class="py-4 max-w-3xl mx-auto">
        <CadastroClienteStepDadosPessoais
          v-if="currentStep === 0"
          ref="stepDados"
          v-model="state"
        />
        <CadastroClienteStepEndereco
          v-else-if="currentStep === 1"
          ref="stepEndereco"
          v-model="state"
        />
        <CadastroClienteStepInformacoes
          v-else-if="currentStep === 2"
          ref="stepInfo"
          v-model="state"
        />
        <CadastroClienteStepPets
          v-else-if="currentStep === 3"
          ref="stepPets"
          v-model="state.pets"
        />
      </div>

      <template #footer>
        <div class="flex justify-between">
          <UButton
            variant="ghost"
            leading-icon="i-lucide-arrow-left"
            :disabled="currentStep === 0"
            @click="handlePrev"
          >
            Anterior
          </UButton>

          <UButton
            color="secondary"
            :trailing-icon="
              isLastStep ? 'i-lucide-check' : 'i-lucide-arrow-right'
            "
            :loading="clienteStore.loading"
            @click="handleNext"
          >
            {{ isLastStep ? "Salvar cliente" : "Próximo" }}
          </UButton>
        </div>
      </template>
    </UCard>
  </div>
</template>
