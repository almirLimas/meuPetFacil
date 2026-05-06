<script setup lang="ts">
import { useClienteStore } from "~/stores/cliente";

const route = useRoute();
const id = route.params.id as string;

const clienteStore = useClienteStore();

// Garante que o cliente está carregado com pets
await useAsyncData(`cliente-${id}`, () => clienteStore.buscarUm(id));

const cliente = computed(() => clienteStore.buscarPorId(id));

const { set: setBreadcrumb } = useBreadcrumb();
watchEffect(() => {
  setBreadcrumb([
    { label: "Clientes", to: "/clientes" },
    { label: cliente.value?.nome ?? "..." },
  ]);
});

watchEffect(() => {
  if (!cliente.value) navigateTo("/clientes");
});

// -- Avatar -------------------------------------------------------------------
const AVATAR_COLORS = [
  "#FFDAAA",
  "#B5E5C8",
  "#F9C5D1",
  "#AACFF5",
  "#D4C5F9",
  "#F9E4B7",
  "#C5EEF9",
  "#F9C5D7",
];

const avatarColor = computed(() => {
  const hash = id.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return AVATAR_COLORS[hash % AVATAR_COLORS.length];
});

const initials = computed(
  () =>
    cliente.value?.nome
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() ?? "",
);

// -- Mensalidade -------------------------------------------------------------
const loadingPagamento = ref(false);
const toast = useToast();

const jaPageuEsseMes = computed(() => {
  const ultima = cliente.value?.ultimaMensalidadePaga;
  if (!ultima) return false;
  const d = new Date(ultima);
  const agora = new Date();
  return (
    d.getFullYear() === agora.getFullYear() && d.getMonth() === agora.getMonth()
  );
});

async function confirmarMensalidade() {
  loadingPagamento.value = true;
  try {
    const { apiFetch } = useApi();
    await apiFetch(`/clientes/${id}/pagar-mensalidade`, { method: "POST" });
    // Recarrega o cliente para atualizar ultimaMensalidadePaga
    await clienteStore.buscarUm(id);
    toast.add({
      title: "Mensalidade confirmada!",
      description: `Lançamento de R$ ${Number(cliente.value?.valorMensal ?? 0).toFixed(2)} adicionado ao faturamento.`,
      color: "success",
    });
  } catch {
    toast.add({
      title: "Mensalidade já confirmada neste mês",
      color: "warning",
    });
  } finally {
    loadingPagamento.value = false;
  }
}

// -- Tabs ---------------------------------------------------------------------
const tabItems = [
  { label: "Dados", icon: "i-lucide-user", slot: "dados" as const },
  { label: "Pets", icon: "i-lucide-paw-print", slot: "pets" as const },
  { label: "Pacotes", icon: "i-lucide-ticket", slot: "pacotes" as const },
];

// -- Dados fields -------------------------------------------------------------
const dadosFields = computed(() => {
  if (!cliente.value) return [];
  const c = cliente.value;
  return [
    { label: "CPF", value: c.cpf },
    { label: "Telefone principal", value: c.telefonePrincipal },
    { label: "WhatsApp / Tel. 2", value: c.telefoneSecundario },
    { label: "E-mail", value: c.email },
    {
      label: "Data de nascimento",
      value: c.dataNascimento
        ? new Date(c.dataNascimento + "T00:00:00").toLocaleDateString("pt-BR")
        : "",
    },
    { label: "Como conheceu", value: c.comoConheceu },
    { label: "CEP", value: c.cep },
    {
      label: "Endereço",
      value: [c.rua, c.numero, c.complemento].filter(Boolean).join(", ") || "",
    },
    { label: "Bairro", value: c.bairro },
    { label: "Cidade / UF", value: `${c.cidade} / ${c.estado}` },
    { label: "Observações", value: c.observacoes },
    {
      label: "Cadastrado em",
      value: new Date(c.createdAt).toLocaleDateString("pt-BR"),
    },
  ];
});

// -- Pacotes ------------------------------------------------------------------
import type { PacoteServico, PacoteClienteAtivo } from "~/types/pacote";

const {
  fetchPacotesCliente,
  ativar: ativarPacote,
  registrarUso: registrarUsoPacote,
  cancelar: cancelarPacote,
  fetchAll: fetchPacoteTemplates,
} = usePacotes();

const pacotesCliente = ref<PacoteClienteAtivo[]>([]);
const pacoteTemplates = ref<PacoteServico[]>([]);
const loadingPacotes = ref(false);
const isModalAtivarOpen = ref(false);
const loadingAtivar = ref(false);
const formAtivar = reactive({
  pacoteId: "",
  petId: "none",
  agendarSessoes: false,
  diaDaSemana: 5, // sexta
  hora: "09:00",
  dataInicio: "",
  modalidade: "ClienteTraz",
});

onMounted(async () => {
  loadingPacotes.value = true;
  try {
    const [pacotes, templates] = await Promise.all([
      fetchPacotesCliente(id),
      fetchPacoteTemplates(true),
    ]);
    pacotesCliente.value = pacotes;
    pacoteTemplates.value = templates;
  } finally {
    loadingPacotes.value = false;
  }
});

const opcoesTemplates = computed(() =>
  pacoteTemplates.value.map((p) => ({
    label: `${p.nome} — ${Number(p.valor).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })} (${p.totalSessoes}x/${p.validadeDias}d)`,
    value: p.id,
  })),
);

const opcoesPets = computed(() => [
  { label: "Sem pet específico", value: "none" },
  ...(cliente.value?.pets ?? []).map((p) => ({ label: p.nome, value: p.id })),
]);

const abrirModalAtivar = () => {
  formAtivar.pacoteId = opcoesTemplates.value[0]?.value ?? "";
  formAtivar.petId = opcoesPets.value[1]?.value ?? "none";
  formAtivar.agendarSessoes = false;
  formAtivar.diaDaSemana = 5;
  formAtivar.hora = "09:00";
  formAtivar.dataInicio = "";
  formAtivar.modalidade = "ClienteTraz";
  isModalAtivarOpen.value = true;
};

const salvarAtivar = async () => {
  if (!formAtivar.pacoteId) return;
  loadingAtivar.value = true;
  try {
    const novo = await ativarPacote({
      pacoteId: formAtivar.pacoteId,
      clienteId: id,
      petId:
        formAtivar.petId && formAtivar.petId !== "none"
          ? formAtivar.petId
          : undefined,
      ...(formAtivar.agendarSessoes && {
        agendarSessoes: true,
        diaDaSemana: formAtivar.diaDaSemana,
        hora: formAtivar.hora,
        dataInicio: formAtivar.dataInicio || undefined,
        modalidade: formAtivar.modalidade,
      }),
    });
    pacotesCliente.value.unshift(novo);
    isModalAtivarOpen.value = false;
    toast.add({
      title: formAtivar.agendarSessoes
        ? "Pacote ativado e sessões agendadas!"
        : "Pacote ativado!",
      color: "success",
    });
  } catch (e: any) {
    toast.add({
      title: e?.data?.message ?? "Erro ao ativar pacote",
      color: "error",
    });
  } finally {
    loadingAtivar.value = false;
  }
};

const usarSessao = async (pacoteClienteId: string) => {
  try {
    const updated = await registrarUsoPacote(pacoteClienteId);
    const idx = pacotesCliente.value.findIndex((p) => p.id === pacoteClienteId);
    if (idx !== -1) pacotesCliente.value[idx] = updated;
    toast.add({ title: "Sessão registrada!", color: "success" });
  } catch (e: any) {
    toast.add({
      title: e?.data?.message ?? "Erro ao registrar sessão",
      color: "error",
    });
  }
};

const cancelarPacoteCliente = async (pacoteClienteId: string) => {
  try {
    const updated = await cancelarPacote(pacoteClienteId);
    const idx = pacotesCliente.value.findIndex((p) => p.id === pacoteClienteId);
    if (idx !== -1) pacotesCliente.value[idx] = updated;
    toast.add({ title: "Pacote cancelado", color: "neutral" });
  } catch (e: any) {
    toast.add({
      title: e?.data?.message ?? "Erro ao cancelar",
      color: "error",
    });
  }
};

const formatPreco = (v: number) =>
  Number(v).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const statusPacoteBadge = (p: PacoteClienteAtivo) => {
  if (p.status === "Cancelado")
    return { label: "Cancelado", color: "error" as const };
  if (p.status === "Expirado")
    return { label: "Expirado", color: "neutral" as const };
  const dias = Math.max(
    0,
    Math.ceil(
      (new Date(p.expiraEm).getTime() - Date.now()) / (1000 * 60 * 60 * 24),
    ),
  );
  if (dias <= 3)
    return { label: `Vence em ${dias}d`, color: "warning" as const };
  return { label: "Ativo", color: "success" as const };
};
</script>

<template>
  <div v-if="cliente" class="flex flex-col gap-4">
    <!-- Header card -->
    <UCard class="ring-0 shadow-sm">
      <div class="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <!-- Avatar -->
        <div
          class="w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold text-gray-700 shrink-0"
          :style="`background: ${avatarColor}`"
        >
          {{ initials }}
        </div>

        <!-- Info -->
        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-3 flex-wrap">
            <h1 class="text-xl font-bold text-gray-800 dark:text-gray-100">
              {{ cliente.nome }}
            </h1>
            <UBadge
              :color="cliente.status === 'Ativo' ? 'success' : 'neutral'"
              variant="soft"
              size="sm"
            >
              {{ cliente.status }}
            </UBadge>
          </div>
          <div
            class="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-500 dark:text-gray-400 mt-1"
          >
            <span class="flex items-center gap-1">
              <UIcon name="i-lucide-mail" class="text-xs" />
              {{ cliente.email }}
            </span>
            <span class="flex items-center gap-1">
              <UIcon name="i-lucide-phone" class="text-xs" />
              {{ cliente.telefonePrincipal }}
            </span>
            <span class="flex items-center gap-1">
              <UIcon name="i-lucide-map-pin" class="text-xs" />
              {{ cliente.cidade }} / {{ cliente.estado }}
            </span>
          </div>
        </div>

        <!-- Actions -->
        <div class="flex gap-2 shrink-0 flex-wrap">
          <UButton
            color="neutral"
            variant="outline"
            leading-icon="i-lucide-arrow-left"
            @click="navigateTo('/clientes')"
          >
            Voltar
          </UButton>
          <UButton
            color="secondary"
            leading-icon="i-lucide-pencil"
            @click="navigateTo(`/clientes/${id}/editar`)"
          >
            Editar
          </UButton>
        </div>
      </div>
    </UCard>

    <!-- Tabs -->
    <UTabs :items="tabItems" class="w-full">
      <!-- Aba Dados -->
      <template #dados>
        <!-- Card mensalidade -->
        <UCard
          v-if="cliente.mensalista"
          class="ring-0 shadow-sm mt-2 border border-orange-200 dark:border-orange-800"
        >
          <div
            class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
          >
            <div class="flex items-center gap-3">
              <div
                class="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center shrink-0"
              >
                <UIcon
                  name="i-lucide-calendar-check"
                  class="text-orange-500 text-lg"
                />
              </div>
              <div>
                <p
                  class="text-sm font-semibold text-gray-800 dark:text-gray-100"
                >
                  Plano Mensalista
                </p>
                <p class="text-sm text-gray-500 dark:text-gray-400">
                  Valor:
                  <span class="font-medium text-gray-800 dark:text-gray-100"
                    >R$ {{ Number(cliente.valorMensal ?? 0).toFixed(2) }}</span
                  >
                  <span v-if="cliente.diaVencimento">
                    · Vencimento dia
                    <span
                      class="font-medium text-gray-800 dark:text-gray-100"
                      >{{ cliente.diaVencimento }}</span
                    ></span
                  >
                </p>
              </div>
            </div>
            <div class="flex flex-col items-end gap-1">
              <UButton
                :color="jaPageuEsseMes ? 'neutral' : 'secondary'"
                :variant="jaPageuEsseMes ? 'soft' : 'solid'"
                :leading-icon="
                  jaPageuEsseMes ? 'i-lucide-check' : 'i-lucide-circle-check'
                "
                :loading="loadingPagamento"
                :disabled="jaPageuEsseMes"
                @click="confirmarMensalidade"
              >
                {{ jaPageuEsseMes ? "Pago este mês" : "Confirmar pagamento" }}
              </UButton>
              <p
                v-if="jaPageuEsseMes"
                class="text-xs text-gray-400 dark:text-gray-500"
              >
                Pago em
                {{
                  new Date(cliente.ultimaMensalidadePaga!).toLocaleDateString(
                    "pt-BR",
                  )
                }}
              </p>
            </div>
          </div>
        </UCard>

        <UCard class="ring-0 shadow-sm mt-2">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-5">
            <div v-for="field in dadosFields" :key="field.label">
              <p
                class="text-xs text-gray-400 dark:text-gray-500 uppercase tracking-wide font-medium"
              >
                {{ field.label }}
              </p>
              <p
                class="text-sm text-gray-800 dark:text-gray-100 font-medium mt-0.5"
              >
                {{ field.value || "—" }}
              </p>
            </div>
          </div>
        </UCard>
      </template>

      <!-- Aba Pets -->
      <template #pets>
        <div class="mt-2 flex flex-col gap-4">
          <!-- Empty state -->
          <div
            v-if="(cliente.pets ?? []).length === 0"
            class="flex flex-col items-center justify-center gap-2 py-12 text-center text-gray-400 dark:text-gray-500 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700"
          >
            <UIcon name="i-lucide-paw-print" class="text-5xl" />
            <p class="text-sm font-medium">Nenhum pet cadastrado</p>
            <p class="text-xs">Clique em "Novo pet" para adicionar</p>
          </div>

          <!-- Pet cards -->
          <div v-else class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <UCard
              v-for="pet in cliente.pets ?? []"
              :key="pet.id"
              class="ring-0 shadow-sm"
            >
              <div class="flex items-start gap-3">
                <div
                  class="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                  style="background: #ffe0ec"
                >
                  <UIcon name="i-lucide-paw-print" class="text-[#E85A8A]" />
                </div>
                <div class="flex-1 min-w-0">
                  <p class="font-semibold text-gray-800 dark:text-gray-100">
                    {{ pet.nome }}
                  </p>
                  <p class="text-sm text-gray-500 dark:text-gray-400">
                    {{ pet.raca }}
                  </p>
                  <div class="flex flex-wrap gap-2 mt-2">
                    <UBadge
                      v-if="pet.especie"
                      color="neutral"
                      variant="soft"
                      size="sm"
                    >
                      {{ pet.especie }}
                    </UBadge>
                    <UBadge
                      v-if="pet.tamanho"
                      color="neutral"
                      variant="soft"
                      size="sm"
                    >
                      {{ pet.tamanho }}
                    </UBadge>
                    <UBadge
                      v-if="pet.dataNascimento"
                      color="neutral"
                      variant="soft"
                      size="sm"
                    >
                      {{ pet.dataNascimento }}
                    </UBadge>
                    <UBadge
                      v-if="pet.peso"
                      color="neutral"
                      variant="soft"
                      size="sm"
                    >
                      {{ pet.peso }} kg
                    </UBadge>
                  </div>
                  <p
                    v-if="pet.observacoes"
                    class="text-xs text-gray-400 dark:text-gray-500 mt-2 italic"
                  >
                    {{ pet.observacoes }}
                  </p>
                </div>
              </div>
              <template #footer>
                <div class="flex gap-2">
                  <UButton
                    size="xs"
                    color="neutral"
                    variant="ghost"
                    leading-icon="i-lucide-pencil"
                    @click="
                      navigateTo(`/clientes/${id}/editar?petId=${pet.id}`)
                    "
                  >
                    Editar
                  </UButton>
                </div>
              </template>
            </UCard>
          </div>
        </div>
      </template>

      <!-- Aba Pacotes -->
      <template #pacotes>
        <div class="mt-2 flex flex-col gap-4">
          <div class="flex items-center justify-between">
            <p class="text-sm text-gray-500 dark:text-gray-400">
              {{ pacotesCliente.filter((p) => p.status === "Ativo").length }}
              pacote(s) ativo(s)
            </p>
            <UButton
              icon="i-lucide-plus"
              size="sm"
              color="primary"
              label="Ativar pacote"
              :disabled="pacoteTemplates.length === 0"
              @click="abrirModalAtivar"
            />
          </div>

          <div v-if="loadingPacotes" class="flex justify-center py-10">
            <UIcon
              name="i-lucide-loader-circle"
              class="animate-spin text-2xl text-primary"
            />
          </div>

          <div
            v-else-if="pacotesCliente.length === 0"
            class="flex flex-col items-center justify-center gap-2 py-12 text-center text-gray-400 dark:text-gray-500 bg-white dark:bg-neutral-800 rounded-xl border border-dashed border-gray-200 dark:border-neutral-700"
          >
            <UIcon name="i-lucide-ticket" class="text-4xl" />
            <p class="text-sm font-medium">Nenhum pacote ativado</p>
            <UButton
              v-if="pacoteTemplates.length > 0"
              variant="ghost"
              size="sm"
              label="Ativar primeiro pacote"
              @click="abrirModalAtivar"
            />
            <p v-else class="text-xs">
              Crie pacotes em
              <NuxtLink to="/pacotes" class="text-primary underline"
                >Pacotes</NuxtLink
              >
            </p>
          </div>

          <div v-else class="flex flex-col gap-3">
            <div
              v-for="p in pacotesCliente"
              :key="p.id"
              class="rounded-xl border border-gray-100 dark:border-neutral-700 bg-white dark:bg-neutral-800 p-4 shadow-sm flex flex-col gap-3"
            >
              <div class="flex items-center justify-between gap-2 flex-wrap">
                <div>
                  <p
                    class="font-semibold text-sm text-gray-800 dark:text-gray-100"
                  >
                    {{ p.pacote?.nome ?? "Pacote" }}
                  </p>
                  <p class="text-xs text-gray-400 mt-0.5">
                    {{ formatPreco(p.valor) }}
                    <span v-if="p.pet"> · {{ p.pet.nome }}</span>
                    · Vence
                    {{ new Date(p.expiraEm).toLocaleDateString("pt-BR") }}
                  </p>
                </div>
                <UBadge
                  v-bind="statusPacoteBadge(p)"
                  variant="subtle"
                  size="sm"
                />
              </div>

              <div class="flex flex-col gap-1">
                <div class="flex justify-between text-xs text-gray-400">
                  <span>Sessões usadas</span>
                  <span>{{ p.sessoesUsadas }} / {{ p.totalSessoes }}</span>
                </div>
                <UProgress
                  :model-value="p.sessoesUsadas ?? 0"
                  :max="p.totalSessoes"
                  :color="
                    p.sessoesUsadas >= p.totalSessoes ? 'neutral' : 'primary'
                  "
                  size="sm"
                />
              </div>

              <div v-if="p.status === 'Ativo'" class="flex gap-2">
                <UButton
                  icon="i-lucide-circle-plus"
                  size="xs"
                  color="primary"
                  variant="soft"
                  label="Registrar uso"
                  :disabled="p.sessoesUsadas >= p.totalSessoes"
                  @click="usarSessao(p.id)"
                />
                <UButton
                  icon="i-lucide-x-circle"
                  size="xs"
                  color="error"
                  variant="ghost"
                  label="Cancelar"
                  @click="cancelarPacoteCliente(p.id)"
                />
              </div>
            </div>
          </div>
        </div>
      </template>
    </UTabs>
  </div>

  <!-- Não encontrado -->
  <div
    v-else
    class="flex flex-col items-center justify-center py-20 text-gray-400 dark:text-gray-500"
  >
    <UIcon name="i-lucide-user-x" class="text-5xl mb-4" />
    <p class="text-lg font-medium">Cliente não encontrado</p>
    <UButton class="mt-4" @click="navigateTo('/clientes')">
      Voltar para Clientes
    </UButton>
  </div>

  <!-- Modal ativar pacote -->
  <UModal
    v-model:open="isModalAtivarOpen"
    title="Ativar pacote para este cliente"
    class="max-w-lg"
  >
    <template #body>
      <div class="flex flex-col gap-4">
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
        <UFormField label="Pet">
          <USelect
            v-model="formAtivar.petId"
            :items="opcoesPets"
            value-key="value"
            label-key="label"
            class="w-full"
          />
        </UFormField>

        <!-- Agendar sessões automaticamente -->
        <div
          class="rounded-xl border border-gray-100 dark:border-neutral-700 bg-gray-50 dark:bg-neutral-800/50 p-4 flex flex-col gap-4"
        >
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-semibold text-gray-800 dark:text-gray-100">
                Agendar todas as sessões agora
              </p>
              <p class="text-xs text-gray-400 mt-0.5">
                Cria automaticamente N agendamentos semanais
              </p>
            </div>
            <USwitch v-model="formAtivar.agendarSessoes" />
          </div>

          <template v-if="formAtivar.agendarSessoes">
            <!-- Dia da semana + horário -->
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
                <UInput v-model="formAtivar.hora" type="time" class="w-full" />
              </UFormField>
            </div>

            <!-- Data de início (opcional) -->
            <UFormField label="Data de início (opcional)">
              <UInput
                v-model="formAtivar.dataInicio"
                type="date"
                class="w-full"
              />
            </UFormField>

            <!-- Modalidade -->
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
          </template>
        </div>
      </div>
    </template>
    <template #footer>
      <div class="flex justify-end gap-3">
        <UButton
          variant="ghost"
          color="neutral"
          label="Cancelar"
          @click="isModalAtivarOpen = false"
        />
        <UButton
          color="primary"
          :label="
            formAtivar.agendarSessoes ? 'Ativar e agendar sessões' : 'Ativar'
          "
          :loading="loadingAtivar"
          @click="salvarAtivar"
        />
      </div>
    </template>
  </UModal>
</template>
