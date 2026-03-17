<script setup lang="ts">
import type { StepperItem } from "@nuxt/ui";
import type { ClienteFormState } from "~/types/cliente";

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
  status: "Ativo",
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
];

const currentStep = ref(0);
const isLastStep = computed(
  () => currentStep.value === stepperItems.length - 1,
);

// -- Refs dos componentes de step (para chamar validate()) ---------------------
const stepDados = ref();
const stepEndereco = ref();
const stepInfo = ref();
const stepRefs = [stepDados, stepEndereco, stepInfo];

// -- Navega��o -----------------------------------------------------------------
const isLoading = ref(false);

async function handleNext() {
  const valid = await stepRefs[currentStep.value]?.value?.validate();
  if (!valid) return;

  if (isLastStep.value) {
    await submitForm();
  } else {
    currentStep.value++;
  }
}

function handlePrev() {
  if (currentStep.value > 0) currentStep.value--;
}

// -- Submit final --------------------------------------------------------------
const toast = useToast();

async function submitForm() {
  isLoading.value = true;
  try {
    // TODO: integrar com API
    console.log("Cadastro cliente:", state);
    toast.add({ title: "Cliente cadastrado com sucesso!", color: "success" });
  } finally {
    isLoading.value = false;
  }
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center py-10">
    <div class="container mx-auto flex justify-center">
      <UCard class="py-4.25 px-4 w-241.25 m-4 shadow-lg bg-white! ring-0">
        <template #header>
          <h1 class="text-xl font-bold text-center mb-6">
            Cadastro de Cliente
          </h1>
          <UStepper
            :items="stepperItems"
            :model-value="currentStep"
            class="w-full"
          />
        </template>

        <div class="py-4">
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
              :loading="isLoading"
              @click="handleNext"
            >
              {{ isLastStep ? "Salvar cliente" : "Próximo" }}
            </UButton>
          </div>
        </template>
      </UCard>
    </div>
  </div>
</template>
