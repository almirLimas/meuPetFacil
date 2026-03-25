<script setup lang="ts">
import { useClienteStore } from "~/stores/cliente";

const route = useRoute();
const id = route.params.id as string;

const clienteStore = useClienteStore();

// Garante que o cliente está carregado
await useAsyncData(`cliente-${id}`, async () => {
  if (!clienteStore.buscarPorId(id)) await clienteStore.listar();
});

const cliente = computed(() => clienteStore.buscarPorId(id));

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

// -- Tabs ---------------------------------------------------------------------
const tabItems = [
  { label: "Dados", icon: "i-lucide-user", slot: "dados" as const },
  { label: "Pets", icon: "i-lucide-paw-print", slot: "pets" as const },
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
      value: `${c.rua}, ${c.numero}${c.complemento ? " — " + c.complemento : ""}`,
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
</script>

<template>
  <div v-if="cliente" class="flex flex-col gap-4">
    <!-- Header card -->
    <UCard class="bg-white! ring-0 shadow-sm">
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
            <h1 class="text-xl font-bold text-gray-800">{{ cliente.nome }}</h1>
            <UBadge
              :color="cliente.status === 'Ativo' ? 'success' : 'neutral'"
              variant="soft"
              size="sm"
            >
              {{ cliente.status }}
            </UBadge>
          </div>
          <div
            class="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-500 mt-1"
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
        <div class="flex gap-2 shrink-0">
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
        <UCard class="bg-white! ring-0 shadow-sm mt-2">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-5">
            <div v-for="field in dadosFields" :key="field.label">
              <p
                class="text-xs text-gray-400 uppercase tracking-wide font-medium"
              >
                {{ field.label }}
              </p>
              <p class="text-sm text-gray-800 font-medium mt-0.5">
                {{ field.value || "—" }}
              </p>
            </div>
          </div>
        </UCard>
      </template>

      <!-- Aba Pets -->
      <template #pets>
        <div class="mt-2 flex flex-col gap-4">
          <!-- Botão novo pet -->
          <div class="flex justify-end">
            <UButton color="secondary" leading-icon="i-lucide-plus" size="sm">
              Novo pet
            </UButton>
          </div>

          <!-- Empty state -->
          <div
            v-if="cliente.pets.length === 0"
            class="flex flex-col items-center justify-center gap-2 py-12 text-center text-gray-400 bg-white rounded-xl border border-gray-100"
          >
            <UIcon name="i-lucide-paw-print" class="text-5xl" />
            <p class="text-sm font-medium">Nenhum pet cadastrado</p>
            <p class="text-xs">Clique em "Novo pet" para adicionar</p>
          </div>

          <!-- Pet cards -->
          <div v-else class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <UCard
              v-for="pet in cliente.pets"
              :key="pet.id"
              class="bg-white! ring-0 shadow-sm"
            >
              <div class="flex items-start gap-3">
                <div
                  class="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                  style="background: #ffe0ec"
                >
                  <UIcon name="i-lucide-paw-print" class="text-[#E85A8A]" />
                </div>
                <div class="flex-1 min-w-0">
                  <p class="font-semibold text-gray-800">{{ pet.nome }}</p>
                  <p class="text-sm text-gray-500">{{ pet.raca }}</p>
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
                      v-if="pet.idade"
                      color="neutral"
                      variant="soft"
                      size="sm"
                    >
                      {{ pet.idade }}
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
                    class="text-xs text-gray-400 mt-2 italic"
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
                    variant="outline"
                    leading-icon="i-lucide-syringe"
                  >
                    Vacinas
                  </UButton>
                  <UButton
                    size="xs"
                    color="neutral"
                    variant="ghost"
                    leading-icon="i-lucide-pencil"
                  >
                    Editar
                  </UButton>
                </div>
              </template>
            </UCard>
          </div>
        </div>
      </template>
    </UTabs>
  </div>

  <!-- Não encontrado -->
  <div
    v-else
    class="flex flex-col items-center justify-center py-20 text-gray-400"
  >
    <UIcon name="i-lucide-user-x" class="text-5xl mb-4" />
    <p class="text-lg font-medium">Cliente não encontrado</p>
    <UButton class="mt-4" @click="navigateTo('/clientes')">
      Voltar para Clientes
    </UButton>
  </div>
</template>
