<script setup lang="ts">
useBreadcrumb().set([
  { label: "Clientes", to: "/clientes" },
  { label: "Novo cliente" },
]);

import type { StepperItem } from "@nuxt/ui";
import type { ClienteFormState } from "~/types/cliente";
import type { PetFormState } from "~/types/pet";
import type { PacoteServico } from "~/types/pacote";
import type { Servico } from "~/types/servico";
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
const PETS_STEP = 3;
const PACOTES_STEP = 4;

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
  {
    title: "Pacote",
    description: "Opcional",
    icon: "i-lucide-ticket",
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

// -- Pacotes (step 4) ---------------------------------------------------------
const { ativar: ativarPacote, fetchAll: fetchPacoteTemplates } = usePacotes();
const { servicos: todosServicos, fetchAll: fetchServicos } = useServicos();

const novoClienteId = ref<string | null>(null);
const novoClientePets = ref<{ id: string; nome: string }[]>([]);
const pacoteTemplates = ref<PacoteServico[]>([]);
const loadingAtivar = ref(false);

const formAtivar = reactive({
  pacoteId: "",
  petId: "none",
  agendarSessoes: false,
  diaDaSemana: 5,
  hora: "09:00",
  servicoIds: [] as string[],
  dataInicio: "",
  modalidade: "ClienteTraz",
});

const opcoesTemplates = computed(() =>
  pacoteTemplates.value.map((p) => ({
    label: `${p.nome} — ${Number(p.valor).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })} (${p.totalSessoes}x/${p.validadeDias}d)`,
    value: p.id,
  })),
);

const opcoesPets = computed(() => [
  { label: "Sem pet específico", value: "none" },
  ...novoClientePets.value.map((p) => ({ label: p.nome, value: p.id })),
]);

// -- Navegação -----------------------------------------------------------------
const salvarCliente = async (): Promise<boolean> => {
  try {
    const novoCliente = await clienteStore.salvar({ ...state });
    novoClienteId.value = novoCliente.id;
    novoClientePets.value = (novoCliente.pets ?? []) as {
      id: string;
      nome: string;
    }[];
    const [templates] = await Promise.all([
      fetchPacoteTemplates(true),
      fetchServicos(true),
    ]);
    pacoteTemplates.value = templates;
    formAtivar.pacoteId = templates[0]?.id ?? "";
    formAtivar.petId = novoClientePets.value[0]?.id ?? "none";
    return true;
  } catch {
    toast.add({ title: "Erro ao cadastrar cliente", color: "error" });
    return false;
  }
};

const handleNext = async () => {
  if (currentStep.value === PACOTES_STEP) {
    navigateTo("/clientes");
    return;
  }

  const valid = await stepRefs[currentStep.value]?.value?.validate();
  if (!valid) return;

  if (currentStep.value === PETS_STEP) {
    const ok = await salvarCliente();
    if (!ok) return;
    toast.add({ title: "Cliente cadastrado com sucesso!", color: "success" });
    currentStep.value = PACOTES_STEP;
  } else {
    currentStep.value++;
  }
};

const handlePrev = () => {
  if (currentStep.value > 0 && currentStep.value < PACOTES_STEP)
    currentStep.value--;
};

const ativarPacoteESalvar = async () => {
  if (!formAtivar.pacoteId || !novoClienteId.value) {
    navigateTo("/clientes");
    return;
  }
  if (formAtivar.agendarSessoes && !formAtivar.servicoIds.length) {
    toast.add({
      title: "Selecione ao menos um serviço para agendar as sessões",
      color: "warning",
    });
    return;
  }
  loadingAtivar.value = true;
  try {
    await ativarPacote({
      pacoteId: formAtivar.pacoteId,
      clienteId: novoClienteId.value,
      petId:
        formAtivar.petId && formAtivar.petId !== "none"
          ? formAtivar.petId
          : undefined,
      ...(formAtivar.agendarSessoes && {
        agendarSessoes: true,
        diaDaSemana: formAtivar.diaDaSemana,
        hora: formAtivar.hora,
        servicoIds: formAtivar.servicoIds,
        dataInicio: formAtivar.dataInicio || undefined,
        modalidade: formAtivar.modalidade,
      }),
    });
    toast.add({ title: "Pacote ativado com sucesso!", color: "success" });
    navigateTo("/clientes");
  } catch (e: any) {
    toast.add({
      title: e?.data?.message ?? "Erro ao ativar pacote",
      color: "error",
    });
  } finally {
    loadingAtivar.value = false;
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

        <!-- Step 4: Pacote (opcional) -->
        <div v-else-if="currentStep === 4" class="flex flex-col gap-5">
          <p class="text-sm text-gray-500 dark:text-gray-400 text-center">
            Deseja ativar um pacote de serviços para este cliente? (opcional)
          </p>

          <template v-if="pacoteTemplates.length === 0">
            <div
              class="flex flex-col items-center justify-center gap-2 py-12 text-center text-gray-400 dark:text-gray-500 rounded-xl border border-dashed border-gray-200 dark:border-neutral-700"
            >
              <UIcon name="i-lucide-ticket" class="text-4xl" />
              <p class="text-sm font-medium">Nenhum pacote criado ainda</p>
              <p class="text-xs">
                Crie pacotes em
                <NuxtLink to="/pacotes" class="text-primary underline"
                  >Pacotes</NuxtLink
                >
              </p>
            </div>
          </template>

          <template v-else>
            <!-- Pacote -->
            <UFormField label="Pacote">
              <USelect
                v-model="formAtivar.pacoteId"
                :items="opcoesTemplates"
                value-key="value"
                label-key="label"
                class="w-full"
              />
            </UFormField>

            <!-- Pet -->
            <UFormField v-if="novoClientePets.length > 0" label="Pet">
              <USelect
                v-model="formAtivar.petId"
                :items="opcoesPets"
                value-key="value"
                label-key="label"
                class="w-full"
              />
            </UFormField>

            <!-- Agendar sessões -->
            <div
              class="rounded-xl border border-gray-100 dark:border-neutral-700 bg-gray-50 dark:bg-neutral-800/50 p-4 flex flex-col gap-4"
            >
              <div class="flex items-center justify-between">
                <div>
                  <p
                    class="text-sm font-semibold text-gray-800 dark:text-gray-100"
                  >
                    Agendar todas as sessões agora
                  </p>
                  <p class="text-xs text-gray-400 mt-0.5">
                    Cria automaticamente N agendamentos semanais
                  </p>
                </div>
                <USwitch v-model="formAtivar.agendarSessoes" />
              </div>

              <template v-if="formAtivar.agendarSessoes">
                <div class="grid grid-cols-2 gap-3">
                  <UFormField label="Dia da semana">
                    <USelect
                      v-model.number="formAtivar.diaDaSemana"
                      :items="[
                        { label: 'Domingo', value: 0 },
                        { label: 'Segunda', value: 1 },
                        { label: 'Terça', value: 2 },
                        { label: 'Quarta', value: 3 },
                        { label: 'Quinta', value: 4 },
                        { label: 'Sexta', value: 5 },
                        { label: 'Sábado', value: 6 },
                      ]"
                      value-key="value"
                      label-key="label"
                      class="w-full"
                    />
                  </UFormField>
                  <UFormField label="Horário">
                    <UInput
                      v-model="formAtivar.hora"
                      type="time"
                      class="w-full"
                    />
                  </UFormField>
                </div>

                <UFormField label="Data de início (opcional)">
                  <UInput
                    v-model="formAtivar.dataInicio"
                    type="date"
                    class="w-full"
                  />
                </UFormField>

                <UFormField label="Modalidade">
                  <USelect
                    v-model="formAtivar.modalidade"
                    :items="[
                      { label: 'Cliente traz', value: 'ClienteTraz' },
                      { label: 'Busca no endereço', value: 'PetshopBusca' },
                    ]"
                    value-key="value"
                    label-key="label"
                    class="w-full"
                  />
                </UFormField>

                <UFormField label="Serviços de cada sessão">
                  <div class="flex flex-col gap-2 mt-1">
                    <div
                      v-for="s in (todosServicos as Servico[]).filter(
                        (s: Servico) => s.ativo,
                      )"
                      :key="s.id"
                      class="flex items-center gap-2 cursor-pointer"
                      @click="
                        formAtivar.servicoIds.includes(s.id)
                          ? formAtivar.servicoIds.splice(
                              formAtivar.servicoIds.indexOf(s.id),
                              1,
                            )
                          : formAtivar.servicoIds.push(s.id)
                      "
                    >
                      <div
                        class="w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 transition-colors"
                        :class="
                          formAtivar.servicoIds.includes(s.id)
                            ? 'bg-primary border-primary'
                            : 'border-gray-300 dark:border-neutral-600'
                        "
                      >
                        <UIcon
                          v-if="formAtivar.servicoIds.includes(s.id)"
                          name="i-lucide-check"
                          class="size-2.5 text-white"
                        />
                      </div>
                      <span class="text-sm text-gray-700 dark:text-gray-200">{{
                        s.nome
                      }}</span>
                    </div>
                  </div>
                  <p
                    v-if="!formAtivar.servicoIds.length"
                    class="text-xs text-amber-500 mt-1"
                  >
                    Selecione ao menos um serviço
                  </p>
                </UFormField>
              </template>
            </div>
          </template>
        </div>
      </div>

      <template #footer>
        <div class="flex justify-between">
          <!-- Botão esquerdo -->
          <UButton
            v-if="currentStep === PACOTES_STEP"
            variant="ghost"
            color="neutral"
            @click="navigateTo('/clientes')"
          >
            Pular
          </UButton>
          <UButton
            v-else
            variant="ghost"
            leading-icon="i-lucide-arrow-left"
            :disabled="currentStep === 0"
            @click="handlePrev"
          >
            Anterior
          </UButton>

          <!-- Botão direito -->
          <UButton
            v-if="currentStep === PACOTES_STEP && pacoteTemplates.length > 0"
            color="primary"
            :trailing-icon="
              formAtivar.agendarSessoes
                ? 'i-lucide-calendar-check'
                : 'i-lucide-check'
            "
            :loading="loadingAtivar"
            @click="ativarPacoteESalvar"
          >
            Ativar pacote e finalizar
          </UButton>
          <UButton
            v-else
            color="secondary"
            :trailing-icon="
              currentStep === PACOTES_STEP || isLastStep
                ? 'i-lucide-check'
                : 'i-lucide-arrow-right'
            "
            :loading="clienteStore.loading"
            @click="handleNext"
          >
            {{
              currentStep === PETS_STEP
                ? "Salvar e continuar"
                : currentStep === PACOTES_STEP
                  ? "Finalizar"
                  : "Próximo"
            }}
          </UButton>
        </div>
      </template>
    </UCard>
  </div>
</template>
