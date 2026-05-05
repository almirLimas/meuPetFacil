<script setup lang="ts">
useBreadcrumb().set([{ label: "Pacotes" }]);

import { z } from "zod";
import type { PacoteServico, PacoteClienteAtivo } from "~/types/pacote";
import type { Servico } from "~/types/servico";
import type { Cliente } from "~/types/cliente";

const {
  pacotes,
  loading,
  fetchAll,
  create,
  update,
  remove,
  fetchTodosAtivos,
  enviarWhatsapp,
} = usePacotes();
const { servicos, fetchAll: fetchServicos } = useServicos();
const { apiFetch } = useApi();
const toast = useToast();

const aba = ref<"templates" | "ativos">("templates");
const pacotesAtivos = ref<PacoteClienteAtivo[]>([]);
const loadingAtivos = ref(false);

onMounted(async () => {
  await Promise.all([fetchAll(), fetchServicos(true)]);
  loadingAtivos.value = true;
  try {
    pacotesAtivos.value = await fetchTodosAtivos();
  } finally {
    loadingAtivos.value = false;
  }
});

// ── Helpers ──────────────────────────────────────────────────────────────────
const formatPreco = (v: number) =>
  Number(v).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const diasRestantes = (expiraEm: string) => {
  const diff = new Date(expiraEm).getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
};

const statusBadge = (p: PacoteClienteAtivo) => {
  if (p.status === "Cancelado")
    return { label: "Cancelado", color: "error" as const };
  if (p.status === "Expirado")
    return { label: "Expirado", color: "neutral" as const };
  const dias = diasRestantes(p.expiraEm);
  if (dias <= 3)
    return { label: `Vence em ${dias}d`, color: "warning" as const };
  return { label: "Ativo", color: "success" as const };
};

// ── Busca ─────────────────────────────────────────────────────────────────
const busca = ref("");
const pacotesFiltrados = computed(() =>
  pacotes.value.filter(
    (p) =>
      !busca.value ||
      p.nome.toLowerCase().includes(busca.value.toLowerCase()) ||
      p.descricao?.toLowerCase().includes(busca.value.toLowerCase()),
  ),
);

const ativosFiltrados = computed(() =>
  pacotesAtivos.value.filter(
    (p) =>
      !busca.value ||
      p.cliente?.nome.toLowerCase().includes(busca.value.toLowerCase()) ||
      p.pacote?.nome.toLowerCase().includes(busca.value.toLowerCase()),
  ),
);

// ── Modal criar / editar ─────────────────────────────────────────────────────
const isModalOpen = ref(false);
const editando = ref<PacoteServico | null>(null);
const loadingSalvar = ref(false);

const schemaPacote = z.object({
  nome: z.string().min(1, "Nome é obrigatório"),
  valor: z
    .number({ error: "Valor é obrigatório" })
    .min(0.01, "Valor deve ser maior que zero"),
  totalSessoes: z
    .number({ error: "Sessões é obrigatório" })
    .int()
    .min(1, "Mínimo de 1 sessão"),
  validadeDias: z
    .number({ error: "Validade é obrigatória" })
    .int()
    .min(1, "Mínimo de 1 dia"),
});
const formRef = ref();

const form = reactive({
  nome: "",
  descricao: "",
  valor: 0,
  totalSessoes: 4,
  validadeDias: 30,
  ativo: true,
  servicosIds: [] as string[],
});

// serviços agrupados por categoria para o seletor
const servicosOpcoes = computed(() =>
  servicos.value
    .filter((s: Servico) => s.ativo)
    .map((s: Servico) => ({ label: `${s.nome} (${s.categoria})`, value: s.id }))
    .sort((a, b) => a.label.localeCompare(b.label)),
);

const toggleServico = (id: string) => {
  const idx = form.servicosIds.indexOf(id);
  if (idx === -1) form.servicosIds.push(id);
  else form.servicosIds.splice(idx, 1);
};

const nomeServico = (id: string) =>
  servicos.value.find((s: Servico) => s.id === id)?.nome ?? id;

const abrirNovo = () => {
  editando.value = null;
  Object.assign(form, {
    nome: "",
    descricao: "",
    valor: 0,
    totalSessoes: 4,
    validadeDias: 30,
    ativo: true,
    servicosIds: [],
  });
  isModalOpen.value = true;
};

const abrirEditar = (p: PacoteServico) => {
  editando.value = p;
  Object.assign(form, {
    nome: p.nome,
    descricao: p.descricao ?? "",
    valor: Number(p.valor),
    totalSessoes: p.totalSessoes,
    validadeDias: p.validadeDias,
    ativo: p.ativo,
    servicosIds: (p.servicos ?? []).map((s) => s.id),
  });
  isModalOpen.value = true;
};

const salvar = async () => {
  const result = await formRef.value?.validate?.();
  if (result?.errors?.length) return;
  loadingSalvar.value = true;
  try {
    const payload = {
      nome: form.nome,
      descricao: form.descricao || undefined,
      valor: form.valor,
      totalSessoes: form.totalSessoes,
      validadeDias: form.validadeDias,
      ativo: form.ativo,
      servicosIds: form.servicosIds,
    };
    if (editando.value) {
      await update(editando.value.id, payload);
      toast.add({ title: "Pacote atualizado!", color: "success" });
    } else {
      await create(payload as any);
      toast.add({ title: "Pacote criado!", color: "success" });
    }
    isModalOpen.value = false;
  } catch {
    toast.add({ title: "Erro ao salvar pacote", color: "error" });
  } finally {
    loadingSalvar.value = false;
  }
};

// ── Enviar por WhatsApp ──────────────────────────────────────────────────────
const modalWhatsapp = ref<PacoteServico | null>(null);
const buscaCliente = ref("");
const clientesSelecionado = ref<string>("");
const clientes = ref<Cliente[]>([]);
const loadingClientes = ref(false);
const loadingEnvio = ref(false);

const abrirEnviarWhatsapp = async (p: PacoteServico) => {
  modalWhatsapp.value = p;
  clientesSelecionado.value = "";
  buscaCliente.value = "";
  if (clientes.value.length === 0) {
    loadingClientes.value = true;
    try {
      const res = await apiFetch<{ data: Cliente[] }>("/clientes?limit=500");
      clientes.value = res.data ?? [];
    } finally {
      loadingClientes.value = false;
    }
  }
};

const clientesFiltradosWpp = computed(() =>
  clientes.value.filter(
    (c) =>
      !buscaCliente.value ||
      c.nome.toLowerCase().includes(buscaCliente.value.toLowerCase()) ||
      c.telefonePrincipal?.includes(buscaCliente.value),
  ),
);

const enviarMensagem = async () => {
  if (!modalWhatsapp.value || !clientesSelecionado.value) return;
  loadingEnvio.value = true;
  try {
    const res = await enviarWhatsapp(
      modalWhatsapp.value.id,
      clientesSelecionado.value,
    );
    toast.add({
      title: res.simulado
        ? "Simulado! (modo simulação ativo)"
        : "Mensagem enviada pelo WhatsApp!",
      color: res.simulado ? "warning" : "success",
    });
    modalWhatsapp.value = null;
  } catch (e: any) {
    toast.add({
      title: e?.data?.message ?? "Erro ao enviar mensagem",
      color: "error",
    });
  } finally {
    loadingEnvio.value = false;
  }
};

// ── Excluir ──────────────────────────────────────────────────────────────────
const confirmarExcluir = ref<PacoteServico | null>(null);
const loadingExcluir = ref(false);

const excluir = async () => {
  if (!confirmarExcluir.value) return;
  loadingExcluir.value = true;
  try {
    await remove(confirmarExcluir.value.id);
    confirmarExcluir.value = null;
    toast.add({ title: "Pacote removido", color: "neutral" });
  } catch (e: any) {
    toast.add({
      title: e?.data?.message ?? "Erro ao remover pacote",
      color: "error",
    });
  } finally {
    loadingExcluir.value = false;
  }
};
</script>

<template>
  <div class="flex flex-col gap-6">
    <!-- Cabeçalho -->
    <div
      class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
    >
      <div>
        <h1 class="text-xl font-bold text-gray-800 dark:text-gray-100">
          Pacotes de Serviços
        </h1>
        <p class="text-sm text-gray-500 dark:text-gray-400">
          Crie pacotes mensais e vincule a clientes
        </p>
      </div>
      <UButton
        icon="i-lucide-plus"
        label="Novo pacote"
        color="primary"
        @click="abrirNovo"
      />
    </div>

    <!-- Abas -->
    <UTabs
      :items="[
        { label: 'Templates', slot: 'templates', value: 'templates' },
        {
          label: `Ativos (${pacotesAtivos.filter((p) => p.status === 'Ativo').length})`,
          slot: 'ativos',
          value: 'ativos',
        },
      ]"
      :model-value="aba"
      @update:model-value="(v) => (aba = v as typeof aba)"
    >
      <!-- ── Aba templates ───────────────────────────────────────────────── -->
      <template #templates>
        <div class="mt-4 flex flex-col gap-4">
          <UInput
            v-model="busca"
            icon="i-lucide-search"
            placeholder="Buscar pacote..."
            class="max-w-sm"
          />

          <div v-if="loading" class="flex justify-center py-10">
            <UIcon
              name="i-lucide-loader-circle"
              class="animate-spin text-2xl text-primary"
            />
          </div>

          <div
            v-else-if="pacotesFiltrados.length === 0"
            class="rounded-xl border border-dashed border-gray-200 dark:border-neutral-700 py-12 text-center text-gray-400"
          >
            <UIcon name="i-lucide-package" class="mx-auto mb-2 text-3xl" />
            <p class="text-sm">Nenhum pacote criado ainda.</p>
            <UButton
              variant="ghost"
              size="sm"
              class="mt-2"
              label="Criar primeiro pacote"
              @click="abrirNovo"
            />
          </div>

          <div v-else class="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <div
              v-for="p in pacotesFiltrados"
              :key="p.id"
              class="flex flex-col gap-3 rounded-xl border border-gray-100 dark:border-neutral-700 bg-white dark:bg-neutral-800/60 p-4 shadow-sm"
            >
              <div class="flex items-start justify-between gap-2">
                <div class="flex items-center gap-2">
                  <span
                    class="inline-flex size-9 items-center justify-center rounded-lg bg-primary-50 dark:bg-primary-900/30"
                  >
                    <UIcon
                      name="i-lucide-ticket"
                      class="text-primary text-lg"
                    />
                  </span>
                  <div>
                    <p
                      class="font-semibold text-gray-800 dark:text-gray-100 text-sm leading-tight"
                    >
                      {{ p.nome }}
                    </p>
                    <p
                      v-if="p.descricao"
                      class="text-xs text-gray-400 line-clamp-1"
                    >
                      {{ p.descricao }}
                    </p>
                  </div>
                </div>
                <UBadge
                  :label="p.ativo ? 'Ativo' : 'Inativo'"
                  :color="p.ativo ? 'success' : 'neutral'"
                  variant="subtle"
                  size="sm"
                />
              </div>

              <div class="grid grid-cols-3 gap-2 text-center">
                <div class="rounded-lg bg-gray-50 dark:bg-neutral-700/50 p-2">
                  <p class="text-xs text-gray-400">Valor</p>
                  <p class="text-sm font-bold text-primary">
                    {{ formatPreco(p.valor) }}
                  </p>
                </div>
                <div class="rounded-lg bg-gray-50 dark:bg-neutral-700/50 p-2">
                  <p class="text-xs text-gray-400">Sessões</p>
                  <p class="text-sm font-bold text-gray-700 dark:text-gray-200">
                    {{ p.totalSessoes }}x
                  </p>
                </div>
                <div class="rounded-lg bg-gray-50 dark:bg-neutral-700/50 p-2">
                  <p class="text-xs text-gray-400">Validade</p>
                  <p class="text-sm font-bold text-gray-700 dark:text-gray-200">
                    {{ p.validadeDias }}d
                  </p>
                </div>
              </div>

              <!-- Serviços do pacote -->
              <div
                v-if="(p.servicos ?? []).length > 0"
                class="flex flex-wrap gap-1"
              >
                <span
                  v-for="s in p.servicos"
                  :key="s.id"
                  class="inline-block rounded-full bg-gray-100 dark:bg-neutral-700 px-2 py-0.5 text-xs text-gray-600 dark:text-gray-300"
                >
                  {{ s.nome }}
                </span>
              </div>

              <div class="flex gap-2 mt-auto">
                <UButton
                  icon="i-lucide-pencil"
                  variant="ghost"
                  size="xs"
                  color="neutral"
                  class="flex-1"
                  label="Editar"
                  @click="abrirEditar(p)"
                />
                <UButton
                  icon="i-simple-icons-whatsapp"
                  variant="ghost"
                  size="xs"
                  color="success"
                  class="flex-1"
                  label="WhatsApp"
                  @click="abrirEnviarWhatsapp(p)"
                />
                <UButton
                  icon="i-lucide-trash-2"
                  variant="ghost"
                  size="xs"
                  color="error"
                  @click="confirmarExcluir = p"
                />
              </div>
            </div>
          </div>
        </div>
      </template>

      <!-- ── Aba ativos ─────────────────────────────────────────────────── -->
      <template #ativos>
        <div class="mt-4 flex flex-col gap-4">
          <UInput
            v-model="busca"
            icon="i-lucide-search"
            placeholder="Buscar cliente ou pacote..."
            class="max-w-sm"
          />

          <div v-if="loadingAtivos" class="flex justify-center py-10">
            <UIcon
              name="i-lucide-loader-circle"
              class="animate-spin text-2xl text-primary"
            />
          </div>

          <div
            v-else-if="ativosFiltrados.length === 0"
            class="rounded-xl border border-dashed border-gray-200 dark:border-neutral-700 py-12 text-center text-gray-400"
          >
            <UIcon name="i-lucide-users" class="mx-auto mb-2 text-3xl" />
            <p class="text-sm">Nenhum pacote vinculado a clientes ainda.</p>
          </div>

          <div v-else class="flex flex-col gap-3">
            <div
              v-for="p in ativosFiltrados"
              :key="p.id"
              class="flex flex-col gap-2 rounded-xl border border-gray-100 dark:border-neutral-700 bg-white dark:bg-neutral-800/60 p-4 shadow-sm sm:flex-row sm:items-center sm:gap-4"
            >
              <!-- Info cliente -->
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2 flex-wrap">
                  <p
                    class="font-semibold text-sm text-gray-800 dark:text-gray-100"
                  >
                    {{ p.cliente?.nome ?? "—" }}
                  </p>
                  <UBadge v-bind="statusBadge(p)" variant="subtle" size="sm" />
                </div>
                <p class="text-xs text-gray-400 mt-0.5">
                  {{ p.pacote?.nome }}
                  <span v-if="p.pet"> · {{ p.pet.nome }}</span>
                </p>
              </div>

              <!-- Progresso sessões -->
              <div class="flex flex-col gap-1 min-w-[120px]">
                <div
                  class="flex justify-between text-xs text-gray-500 dark:text-gray-400"
                >
                  <span>Sessões</span>
                  <span>{{ p.sessoesUsadas }}/{{ p.totalSessoes }}</span>
                </div>
                <UProgress
                  :value="
                    p.totalSessoes > 0
                      ? Math.round(
                          ((p.sessoesUsadas ?? 0) / p.totalSessoes) * 100,
                        )
                      : 0
                  "
                  :color="
                    p.sessoesUsadas >= p.totalSessoes ? 'neutral' : 'primary'
                  "
                  animation="none"
                  size="sm"
                />
              </div>

              <!-- Validade -->
              <div class="text-right min-w-[80px]">
                <p class="text-xs text-gray-400">Vence</p>
                <p class="text-sm font-medium text-gray-700 dark:text-gray-200">
                  {{ new Date(p.expiraEm).toLocaleDateString("pt-BR") }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </template>
    </UTabs>
  </div>

  <!-- Modal criar / editar ────────────────────────────────────────────────── -->
  <UModal
    v-model:open="isModalOpen"
    :title="editando ? 'Editar pacote' : 'Novo pacote'"
  >
    <template #body>
      <UForm
        ref="formRef"
        :schema="schemaPacote"
        :state="form"
        class="flex flex-col gap-4"
        @submit="salvar"
      >
        <UFormField name="nome" label="Nome do pacote">
          <UInput
            v-model="form.nome"
            placeholder="Ex: 4 Banhos Mensais"
            class="w-full"
          />
        </UFormField>

        <UFormField name="descricao" label="Descrição (opcional)">
          <UInput
            v-model="form.descricao"
            placeholder="Ex: Inclui banho simples"
            class="w-full"
          />
        </UFormField>

        <div class="grid grid-cols-3 gap-3">
          <UFormField name="valor" label="Valor (R$)">
            <UInput
              v-model.number="form.valor"
              type="number"
              min="0.01"
              step="0.01"
              placeholder="Ex: 40.00"
              class="w-full"
            />
          </UFormField>

          <UFormField name="totalSessoes" label="Sessões">
            <UInputNumber
              v-model="form.totalSessoes"
              :min="1"
              :step="1"
              class="w-full"
            />
          </UFormField>

          <UFormField name="validadeDias" label="Validade (dias)">
            <UInputNumber
              v-model="form.validadeDias"
              :min="1"
              :step="1"
              class="w-full"
            />
          </UFormField>
        </div>

        <UFormField name="ativo" label="Status">
          <USwitch
            v-model="form.ativo"
            :label="form.ativo ? 'Ativo' : 'Inativo'"
          />
        </UFormField>

        <!-- Seleção de serviços -->
        <UFormField label="Serviços incluídos (opcional)">
          <div class="flex flex-col gap-2">
            <p class="text-xs text-gray-400">
              Selecione os serviços que fazem parte deste pacote
            </p>
            <!-- Chips selecionados -->
            <div
              v-if="form.servicosIds.length > 0"
              class="flex flex-wrap gap-1.5"
            >
              <span
                v-for="sid in form.servicosIds"
                :key="sid"
                class="inline-flex items-center gap-1 rounded-full bg-primary-50 dark:bg-primary-900/30 px-2.5 py-0.5 text-xs font-medium text-primary"
              >
                {{ nomeServico(sid) }}
                <button
                  type="button"
                  class="hover:text-primary-700"
                  @click="toggleServico(sid)"
                >
                  <UIcon name="i-lucide-x" class="size-3" />
                </button>
              </span>
            </div>
            <!-- Lista de opções -->
            <div
              v-if="servicosOpcoes.length > 0"
              class="max-h-36 overflow-y-auto rounded-lg border border-gray-100 dark:border-neutral-700 divide-y divide-gray-50 dark:divide-neutral-700"
            >
              <label
                v-for="op in servicosOpcoes"
                :key="op.value"
                class="flex cursor-pointer items-center gap-2.5 px-3 py-2 hover:bg-gray-50 dark:hover:bg-neutral-700 transition-colors"
              >
                <input
                  type="checkbox"
                  :checked="form.servicosIds.includes(op.value)"
                  class="accent-primary"
                  @change="toggleServico(op.value)"
                />
                <span class="text-sm text-gray-700 dark:text-gray-200">{{
                  op.label
                }}</span>
              </label>
            </div>
            <p v-else class="text-xs text-gray-400 italic">
              Nenhum serviço ativo cadastrado.
            </p>
          </div>
        </UFormField>
      </UForm>
    </template>
    <template #footer>
      <div class="flex justify-end gap-3">
        <UButton
          variant="ghost"
          color="neutral"
          label="Cancelar"
          @click="isModalOpen = false"
        />
        <UButton
          color="primary"
          label="Salvar"
          :loading="loadingSalvar"
          @click="salvar"
        />
      </div>
    </template>
  </UModal>

  <!-- Modal enviar por WhatsApp ──────────────────────────────────────────── -->
  <UModal
    :open="!!modalWhatsapp"
    title="Enviar pacote por WhatsApp"
    @update:open="
      (v) => {
        if (!v) modalWhatsapp = null;
      }
    "
  >
    <template #body>
      <div class="flex flex-col gap-4">
        <div
          class="rounded-lg bg-primary-50 dark:bg-primary-900/20 p-3 flex items-center gap-2"
        >
          <UIcon name="i-lucide-ticket" class="text-primary text-lg shrink-0" />
          <div>
            <p class="font-semibold text-sm text-gray-800 dark:text-gray-100">
              {{ modalWhatsapp?.nome }}
            </p>
            <p class="text-xs text-gray-500">
              {{ formatPreco(modalWhatsapp?.valor ?? 0) }} ·
              {{ modalWhatsapp?.totalSessoes }} sessões
            </p>
          </div>
        </div>

        <UFormField label="Selecionar cliente">
          <div class="flex flex-col gap-2">
            <UInput
              v-model="buscaCliente"
              icon="i-lucide-search"
              placeholder="Buscar cliente..."
              class="w-full"
            />
            <div v-if="loadingClientes" class="flex justify-center py-4">
              <UIcon
                name="i-lucide-loader-circle"
                class="animate-spin text-xl text-primary"
              />
            </div>
            <div
              v-else
              class="max-h-48 overflow-y-auto rounded-lg border border-gray-100 dark:border-neutral-700 divide-y divide-gray-50 dark:divide-neutral-700"
            >
              <label
                v-for="c in clientesFiltradosWpp"
                :key="c.id"
                class="flex cursor-pointer items-center gap-2.5 px-3 py-2 hover:bg-gray-50 dark:hover:bg-neutral-700 transition-colors"
                :class="
                  clientesSelecionado === c.id
                    ? 'bg-primary-50 dark:bg-primary-900/20'
                    : ''
                "
              >
                <input
                  type="radio"
                  :value="c.id"
                  v-model="clientesSelecionado"
                  class="accent-primary"
                />
                <div class="flex-1 min-w-0">
                  <p
                    class="text-sm text-gray-700 dark:text-gray-200 font-medium truncate"
                  >
                    {{ c.nome }}
                  </p>
                  <p class="text-xs text-gray-400">
                    {{ c.telefonePrincipal || "Sem telefone" }}
                  </p>
                </div>
              </label>
              <div
                v-if="clientesFiltradosWpp.length === 0 && !loadingClientes"
                class="py-6 text-center text-sm text-gray-400"
              >
                Nenhum cliente encontrado
              </div>
            </div>
          </div>
        </UFormField>
      </div>
    </template>
    <template #footer>
      <div class="flex justify-end gap-3">
        <UButton
          variant="ghost"
          color="neutral"
          label="Cancelar"
          @click="modalWhatsapp = null"
        />
        <UButton
          icon="i-simple-icons-whatsapp"
          color="success"
          label="Enviar"
          :loading="loadingEnvio"
          :disabled="!clientesSelecionado"
          @click="enviarMensagem"
        />
      </div>
    </template>
  </UModal>

  <!-- Confirmar exclusão ───────────────────────────────────────────────────── -->
  <UModal
    :open="!!confirmarExcluir"
    title="Excluir pacote"
    @update:open="
      (v) => {
        if (!v) confirmarExcluir = null;
      }
    "
  >
    <template #body>
      <p class="text-sm text-gray-600 dark:text-gray-300">
        Tem certeza que deseja excluir o pacote
        <strong>{{ confirmarExcluir?.nome }}</strong
        >? Esta ação não pode ser desfeita.
      </p>
    </template>
    <template #footer>
      <div class="flex justify-end gap-3">
        <UButton
          variant="ghost"
          color="neutral"
          label="Cancelar"
          @click="confirmarExcluir = null"
        />
        <UButton
          color="error"
          label="Excluir"
          :loading="loadingExcluir"
          @click="excluir"
        />
      </div>
    </template>
  </UModal>
</template>
