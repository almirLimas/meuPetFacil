<script setup lang="ts">
useBreadcrumb().set([
  { label: "Configuracoes", to: "/configuracoes/perfil" },
  { label: "Equipe" },
]);

import { z } from "zod";
import {
  PERFIL_LABELS,
  PERFIS_STAFF,
  type UsuarioPerfil,
} from "~/types/usuario";
import { useAuthStore } from "~/stores/auth";

interface StaffItem {
  id: string;
  nomeCompleto: string;
  email: string;
  perfil: string;
  telefone?: string;
  status: string;
}

const { apiFetch } = useApi();
const toast = useToast();

const staff = ref<StaffItem[]>([]);
const carregando = ref(true);
const salvando = ref(false);
const removendoId = ref<string | null>(null);
const isModalStaff = ref(false);
const isModalRemover = ref(false);
const staffParaRemover = ref<StaffItem | null>(null);
const erroModal = ref("");
const mostrarSenha = ref(false);
const formRef = ref();
const emailDisponivel = ref<boolean | null>(null);
const verificandoEmail = ref(false);
const modoModal = ref<"criar" | "editar">("criar");
const editandoStaff = ref<StaffItem | null>(null);

const schemaCriar = z.object({
  nomeCompleto: z.string().min(1, "Nome e obrigatorio"),
  email: z.string().email("E-mail invalido"),
  telefone: z
    .string()
    .optional()
    .refine(
      (v) => !v || v.replace(/\D/g, "").length >= 10,
      "Celular incompleto",
    ),
  perfil: z.enum(["gerente", "atendente", "caixa", "motoboy"], {
    error: "Selecione um perfil",
  }),
  senha: z.string().min(6, "A senha deve ter no minimo 6 caracteres"),
});

const schemaEditar = z.object({
  nomeCompleto: z.string().min(1, "Nome e obrigatorio"),
  telefone: z
    .string()
    .optional()
    .refine(
      (v) => !v || v.replace(/\D/g, "").length >= 10,
      "Celular incompleto",
    ),
  perfil: z.enum(["gerente", "atendente", "caixa", "motoboy"], {
    error: "Selecione um perfil",
  }),
  novaSenha: z
    .union([z.string().min(6, "Minimo 6 caracteres"), z.literal("")])
    .optional(),
});

interface FormState {
  nomeCompleto: string;
  email: string;
  telefone: string;
  perfil: "gerente" | "atendente" | "caixa" | "motoboy";
  senha: string;
  novaSenha: string;
}

const form = reactive<FormState>({
  nomeCompleto: "",
  email: "",
  telefone: "",
  perfil: "caixa",
  senha: "",
  novaSenha: "",
});

const opcoesPerfilStaff = PERFIS_STAFF.map((p) => ({
  value: p,
  label: PERFIL_LABELS[p as UsuarioPerfil],
}));

const descricaoPerfil: Record<string, string> = {
  gerente: "Acessa tudo exceto financeiro e configuracoes",
  atendente: "Acessa agenda, clientes e pets",
  caixa: "Acessa agenda e PDV (vendas)",
  motoboy: "Acessa agenda e clientes (sem PDV)",
};

function badgeColor(perfil: string) {
  if (perfil === "gerente") return "blue";
  if (perfil === "atendente") return "green";
  if (perfil === "caixa") return "yellow";
  if (perfil === "motoboy") return "orange";
  return "neutral";
}

async function carregarStaff() {
  carregando.value = true;
  try {
    staff.value = await apiFetch<StaffItem[]>("/auth/staff");
  } finally {
    carregando.value = false;
  }
}

function abrirModal() {
  modoModal.value = "criar";
  editandoStaff.value = null;
  Object.assign(form, {
    nomeCompleto: "",
    email: "",
    telefone: "",
    perfil: "caixa",
    senha: "",
    novaSenha: "",
  });
  erroModal.value = "";
  emailDisponivel.value = null;
  mostrarSenha.value = false;
  isModalStaff.value = true;
}

function abrirModalEdicao(s: StaffItem) {
  modoModal.value = "editar";
  editandoStaff.value = s;
  Object.assign(form, {
    nomeCompleto: s.nomeCompleto,
    email: s.email,
    telefone: s.telefone ?? "",
    perfil: s.perfil as FormState["perfil"],
    senha: "",
    novaSenha: "",
  });
  erroModal.value = "";
  emailDisponivel.value = null;
  mostrarSenha.value = false;
  isModalStaff.value = true;
}

async function verificarEmailDisponivel() {
  const emailValido = z.string().email().safeParse(form.email).success;
  if (!emailValido) {
    emailDisponivel.value = null;
    return;
  }
  verificandoEmail.value = true;
  try {
    const res = await apiFetch<{ disponivel: boolean }>(
      `/auth/verificar-email?email=${encodeURIComponent(form.email)}`,
    );
    emailDisponivel.value = res.disponivel;
  } catch {
    emailDisponivel.value = null;
  } finally {
    verificandoEmail.value = false;
  }
}

async function salvarStaff() {
  erroModal.value = "";
  salvando.value = true;
  try {
    if (modoModal.value === "editar" && editandoStaff.value) {
      const atualizado = await apiFetch<StaffItem>(
        `/auth/staff/${editandoStaff.value.id}`,
        {
          method: "PATCH",
          body: {
            nomeCompleto: form.nomeCompleto,
            telefone: form.telefone,
            perfil: form.perfil,
            ...(form.novaSenha ? { novaSenha: form.novaSenha } : {}),
          },
        },
      );
      const idx = staff.value.findIndex((s) => s.id === atualizado.id);
      if (idx !== -1) staff.value[idx] = atualizado;
      isModalStaff.value = false;
      toast.add({
        title: "Funcionario atualizado com sucesso!",
        color: "green",
      });
    } else {
      const novo = await apiFetch<StaffItem>("/auth/staff", {
        method: "POST",
        body: {
          nomeCompleto: form.nomeCompleto,
          email: form.email,
          telefone: form.telefone || undefined,
          perfil: form.perfil,
          senha: form.senha,
        },
      });
      staff.value.push(novo);
      isModalStaff.value = false;
      toast.add({
        title: "Funcionario cadastrado com sucesso!",
        color: "green",
      });
    }
  } catch (err: any) {
    const data = err?.data;
    const msg = Array.isArray(data?.message)
      ? data.message.join(", ")
      : (data?.message ?? "Erro ao salvar funcionario.");
    toast.add({ title: msg, color: "error", icon: "i-lucide-circle-alert" });
  } finally {
    salvando.value = false;
  }
}

function confirmarRemocao(s: StaffItem) {
  staffParaRemover.value = s;
  isModalRemover.value = true;
}

async function removerStaff() {
  if (!staffParaRemover.value) return;
  removendoId.value = staffParaRemover.value.id;
  try {
    await apiFetch(`/auth/staff/${staffParaRemover.value.id}`, {
      method: "DELETE",
    });
    staff.value = staff.value.filter(
      (s) => s.id !== staffParaRemover.value!.id,
    );
    isModalRemover.value = false;
    toast.add({ title: "Funcionario removido.", color: "green" });
  } catch {
    toast.add({ title: "Erro ao remover funcionario.", color: "red" });
  } finally {
    removendoId.value = null;
  }
}

const limiteStaff = computed(() => {
  const plano = useAuthStore().usuario?.plano;
  return plano === "plus" ? 5 : 3;
});

onMounted(carregarStaff);

const mostrarPermissoes = ref(false);

const tabelaPermissoes = [
  {
    label: "Dashboard",
    gerente: true,
    atendente: true,
    caixa: false,
    motoboy: false,
  },
  {
    label: "Clientes — visualizar / cadastrar",
    gerente: true,
    atendente: true,
    caixa: true,
    motoboy: true,
  },
  {
    label: "Clientes — excluir",
    gerente: true,
    atendente: false,
    caixa: false,
    motoboy: false,
  },
  {
    label: "Agenda — visualizar",
    gerente: true,
    atendente: true,
    caixa: true,
    motoboy: true,
  },
  {
    label: "Agenda — criar / editar",
    gerente: true,
    atendente: true,
    caixa: false,
    motoboy: true,
  },
  {
    label: "Agenda — confirmar / concluir",
    gerente: true,
    atendente: true,
    caixa: true,
    motoboy: true,
  },
  {
    label: "Agenda — cancelar / excluir",
    gerente: true,
    atendente: true,
    caixa: false,
    motoboy: false,
  },
  {
    label: "Vendas (PDV)",
    gerente: false,
    atendente: false,
    caixa: true,
    motoboy: false,
  },
  {
    label: "Fechamento de Caixa",
    gerente: false,
    atendente: false,
    caixa: false,
    motoboy: false,
  },
  {
    label: "Estoque",
    gerente: true,
    atendente: false,
    caixa: false,
    motoboy: false,
  },
  {
    label: "Relatórios",
    gerente: true,
    atendente: false,
    caixa: false,
    motoboy: false,
  },
  {
    label: "Avaliações",
    gerente: true,
    atendente: false,
    caixa: false,
    motoboy: false,
  },
  {
    label: "Financeiro",
    gerente: false,
    atendente: false,
    caixa: false,
    motoboy: false,
  },
  {
    label: "Configurações",
    gerente: false,
    atendente: false,
    caixa: false,
    motoboy: false,
  },
];
</script>

<template>
  <div class="max-w-2xl mx-auto px-4 py-8 space-y-6">
    <div>
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Equipe</h1>
      <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
        Gerencie os funcionarios do seu petshop. Maximo de
        {{ limiteStaff }} funcionarios.
      </p>
    </div>

    <div
      class="bg-white dark:bg-neutral-800 rounded-2xl shadow-sm p-6 space-y-4"
    >
      <div class="flex items-center justify-between">
        <h2 class="font-semibold text-gray-800 dark:text-gray-100 text-base">
          Funcionarios ({{ staff.length }}/{{ limiteStaff }})
        </h2>
        <UButton
          v-if="staff.length < limiteStaff"
          size="sm"
          icon="i-lucide-plus"
          class="text-sm font-semibold rounded-xl text-white"
          style="background-color: #f07030"
          @click="abrirModal"
        >
          Adicionar
        </UButton>
      </div>

      <div v-if="carregando" class="py-8 flex justify-center">
        <UIcon
          name="i-lucide-loader-circle"
          class="size-6 animate-spin text-gray-400"
        />
      </div>

      <div
        v-else-if="staff.length === 0"
        class="py-8 text-center text-sm text-gray-400 dark:text-gray-500"
      >
        Nenhum funcionario cadastrado ainda.
      </div>

      <div v-else class="divide-y divide-gray-100 dark:divide-neutral-700">
        <div
          v-for="s in staff"
          :key="s.id"
          class="flex items-center justify-between py-3"
        >
          <div class="flex items-center gap-3">
            <div
              class="size-9 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-orange-600 dark:text-orange-400 font-bold text-sm uppercase"
            >
              {{ s.nomeCompleto.charAt(0) }}
            </div>
            <div>
              <p class="text-sm font-medium text-gray-800 dark:text-gray-100">
                {{ s.nomeCompleto }}
              </p>
              <p class="text-xs text-gray-500 dark:text-gray-400">
                {{ s.email }}
              </p>
            </div>
          </div>
          <div class="flex items-center gap-2">
            <UBadge
              :label="PERFIL_LABELS[s.perfil as UsuarioPerfil] ?? s.perfil"
              :color="badgeColor(s.perfil)"
              variant="subtle"
              size="sm"
            />
            <UButton
              icon="i-lucide-pencil"
              size="xs"
              color="neutral"
              variant="ghost"
              @click="abrirModalEdicao(s)"
            />
            <UButton
              icon="i-lucide-trash-2"
              size="xs"
              color="neutral"
              variant="ghost"
              :loading="removendoId === s.id"
              @click="confirmarRemocao(s)"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Tabela de permissões por perfil -->
    <div
      class="bg-white dark:bg-neutral-800 rounded-2xl shadow-sm overflow-hidden"
    >
      <button
        class="w-full flex items-center justify-between px-6 py-4 text-left"
        @click="mostrarPermissoes = !mostrarPermissoes"
      >
        <div class="flex items-center gap-2">
          <UIcon name="i-lucide-shield-check" class="size-4 text-orange-500" />
          <span class="font-semibold text-gray-800 dark:text-gray-100 text-sm"
            >Permissões por perfil</span
          >
        </div>
        <UIcon
          :name="
            mostrarPermissoes ? 'i-lucide-chevron-up' : 'i-lucide-chevron-down'
          "
          class="size-4 text-gray-400"
        />
      </button>

      <div v-if="mostrarPermissoes" class="px-6 pb-6">
        <p class="text-xs text-gray-400 mb-4">
          Veja o que cada perfil pode acessar e fazer no sistema.
        </p>
        <div class="overflow-x-auto">
          <table class="w-full text-xs">
            <thead>
              <tr class="border-b border-gray-100 dark:border-neutral-700">
                <th
                  class="text-left py-2 pr-4 font-medium text-gray-500 dark:text-gray-400 w-48"
                >
                  Funcionalidade
                </th>
                <th
                  class="text-center py-2 px-3 font-medium text-blue-600 dark:text-blue-400"
                >
                  Gerente
                </th>
                <th
                  class="text-center py-2 px-3 font-medium text-green-600 dark:text-green-400"
                >
                  Atendente
                </th>
                <th
                  class="text-center py-2 px-3 font-medium text-yellow-600 dark:text-yellow-400"
                >
                  Caixa
                </th>
                <th
                  class="text-center py-2 px-3 font-medium text-orange-600 dark:text-orange-400"
                >
                  Motoboy
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-50 dark:divide-neutral-700/50">
              <tr v-for="linha in tabelaPermissoes" :key="linha.label">
                <td class="py-2 pr-4 text-gray-700 dark:text-gray-300">
                  {{ linha.label }}
                </td>
                <td class="py-2 px-3 text-center">
                  <UIcon
                    v-if="linha.gerente"
                    name="i-lucide-check"
                    class="size-3.5 text-green-500"
                  />
                  <UIcon
                    v-else
                    name="i-lucide-minus"
                    class="size-3.5 text-gray-300 dark:text-neutral-600"
                  />
                </td>
                <td class="py-2 px-3 text-center">
                  <UIcon
                    v-if="linha.atendente"
                    name="i-lucide-check"
                    class="size-3.5 text-green-500"
                  />
                  <UIcon
                    v-else
                    name="i-lucide-minus"
                    class="size-3.5 text-gray-300 dark:text-neutral-600"
                  />
                </td>
                <td class="py-2 px-3 text-center">
                  <UIcon
                    v-if="linha.caixa"
                    name="i-lucide-check"
                    class="size-3.5 text-green-500"
                  />
                  <UIcon
                    v-else
                    name="i-lucide-minus"
                    class="size-3.5 text-gray-300 dark:text-neutral-600"
                  />
                </td>
                <td class="py-2 px-3 text-center">
                  <UIcon
                    v-if="linha.motoboy"
                    name="i-lucide-check"
                    class="size-3.5 text-green-500"
                  />
                  <UIcon
                    v-else
                    name="i-lucide-minus"
                    class="size-3.5 text-gray-300 dark:text-neutral-600"
                  />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <UModal
      v-model:open="isModalStaff"
      title="Novo Funcionario"
      @update:open="
        (v) => {
          if (!v) {
            modoModal = 'criar';
            editandoStaff = null;
            Object.assign(form, {
              nomeCompleto: '',
              email: '',
              telefone: '',
              perfil: 'caixa',
              senha: '',
              novaSenha: '',
            });
            emailDisponivel = null;
            erroModal = '';
          }
        }
      "
    >
      <template #content>
        <UCard class="ring-0">
          <template #header>
            <div class="flex items-center justify-between">
              <h3 class="font-semibold text-gray-800 dark:text-gray-100">
                {{
                  modoModal === "criar"
                    ? "Novo Funcionario"
                    : "Editar Funcionario"
                }}
              </h3>
              <UButton
                icon="i-lucide-x"
                color="neutral"
                variant="ghost"
                size="xs"
                @click="isModalStaff = false"
              />
            </div>
          </template>

          <UForm
            ref="formRef"
            :schema="modoModal === 'criar' ? schemaCriar : schemaEditar"
            :state="form"
            class="flex flex-col gap-4"
            autocomplete="new-password"
            @submit="salvarStaff"
          >
            <!-- honeypot: engana o browser e impede autocomplete -->
            <input
              type="text"
              name="username"
              style="display: none"
              tabindex="-1"
              aria-hidden="true"
            />
            <input
              type="password"
              name="password"
              style="display: none"
              tabindex="-1"
              aria-hidden="true"
            />
            <UFormField name="nomeCompleto" label="Nome completo *">
              <UInput
                v-model="form.nomeCompleto"
                placeholder="Ex: Maria da Silva"
                class="w-full"
              />
            </UFormField>

            <UFormField
              v-if="modoModal === 'criar'"
              name="email"
              label="E-mail de acesso *"
            >
              <UInput
                v-model="form.email"
                type="email"
                placeholder="Ex: caixa@meupetshop.com"
                class="w-full"
                @blur="verificarEmailDisponivel"
              >
                <template #trailing>
                  <UIcon
                    v-if="verificandoEmail"
                    name="i-lucide-loader-circle"
                    class="size-4 animate-spin text-gray-400"
                  />
                  <UIcon
                    v-else-if="emailDisponivel === true"
                    name="i-lucide-circle-check"
                    class="size-4 text-green-500"
                  />
                  <UIcon
                    v-else-if="emailDisponivel === false"
                    name="i-lucide-circle-x"
                    class="size-4 text-red-500"
                  />
                </template>
              </UInput>
              <template v-if="emailDisponivel === false" #help>
                <span class="text-[11px] text-red-500"
                  >E-mail já cadastrado</span
                >
              </template>
            </UFormField>

            <UFormField v-else name="email" label="E-mail de acesso">
              <UInput
                :model-value="form.email"
                type="email"
                class="w-full"
                disabled
              >
                <template #trailing>
                  <UIcon name="i-lucide-lock" class="size-4 text-gray-400" />
                </template>
              </UInput>
              <template #help>
                <span class="text-[11px] text-gray-400"
                  >O e-mail não pode ser alterado</span
                >
              </template>
            </UFormField>

            <UFormField name="telefone" label="Celular (opcional)">
              <InputTelefoneInput
                v-model="form.telefone"
                autocomplete="off"
                class="w-full"
              />
            </UFormField>

            <UFormField name="perfil" label="Perfil de acesso *">
              <USelect
                v-model="form.perfil"
                :items="opcoesPerfilStaff"
                value-key="value"
                label-key="label"
                class="w-full"
              />
              <template v-if="form.perfil" #help>
                <span class="text-[11px] text-gray-400">{{
                  descricaoPerfil[form.perfil]
                }}</span>
              </template>
            </UFormField>

            <UFormField
              v-if="modoModal === 'criar'"
              name="senha"
              label="Senha de acesso *"
            >
              <UInput
                v-model="form.senha"
                :type="mostrarSenha ? 'text' : 'password'"
                placeholder="Minimo 6 caracteres"
                autocomplete="off"
                class="w-full"
              >
                <template #trailing>
                  <UButton
                    type="button"
                    color="neutral"
                    variant="ghost"
                    size="sm"
                    :icon="mostrarSenha ? 'i-lucide-eye-off' : 'i-lucide-eye'"
                    @click="mostrarSenha = !mostrarSenha"
                  />
                </template>
              </UInput>
            </UFormField>

            <UFormField
              v-if="modoModal === 'editar'"
              name="novaSenha"
              label="Nova senha (opcional)"
            >
              <UInput
                v-model="form.novaSenha"
                :type="mostrarSenha ? 'text' : 'password'"
                placeholder="Deixe em branco para não alterar"
                autocomplete="off"
                class="w-full"
              >
                <template #trailing>
                  <UButton
                    type="button"
                    color="neutral"
                    variant="ghost"
                    size="sm"
                    :icon="mostrarSenha ? 'i-lucide-eye-off' : 'i-lucide-eye'"
                    @click="mostrarSenha = !mostrarSenha"
                  />
                </template>
              </UInput>
            </UFormField>

            <div class="flex justify-end gap-2 pt-1">
              <UButton
                color="neutral"
                variant="ghost"
                @click="isModalStaff = false"
                >Cancelar</UButton
              >
              <UButton
                type="submit"
                :loading="salvando"
                class="text-sm font-semibold rounded-xl text-white"
                style="background-color: #f07030"
              >
                {{ modoModal === "criar" ? "Cadastrar" : "Salvar" }}
              </UButton>
            </div>
          </UForm>
        </UCard>
      </template>
    </UModal>

    <UModal v-model:open="isModalRemover" title="Remover funcionario">
      <template #content>
        <UCard class="ring-0">
          <template #header>
            <div class="flex items-center justify-between">
              <h3 class="font-semibold text-gray-800 dark:text-gray-100">
                Remover funcionario?
              </h3>
              <UButton
                icon="i-lucide-x"
                color="neutral"
                variant="ghost"
                size="xs"
                @click="isModalRemover = false"
              />
            </div>
          </template>

          <p class="text-sm text-gray-500 dark:text-gray-400">
            Tem certeza que deseja remover
            <strong class="text-gray-800 dark:text-gray-100">{{
              staffParaRemover?.nomeCompleto
            }}</strong
            >? O acesso sera revogado imediatamente.
          </p>

          <template #footer>
            <div class="flex justify-end gap-2">
              <UButton
                color="neutral"
                variant="ghost"
                @click="isModalRemover = false"
                >Cancelar</UButton
              >
              <UButton
                color="error"
                :loading="removendoId !== null"
                @click="removerStaff"
                >Remover</UButton
              >
            </div>
          </template>
        </UCard>
      </template>
    </UModal>
  </div>
</template>
