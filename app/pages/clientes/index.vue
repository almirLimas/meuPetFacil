<script setup lang="ts">
useBreadcrumb().set([{ label: "Clientes" }]);

import { getPaginationRowModel } from "@tanstack/vue-table";
import type { TableColumn } from "@nuxt/ui";
import type { Cliente } from "~/types/cliente";
import { useClienteStore } from "~/stores/cliente";

const table = useTemplateRef("table");
const clienteStore = useClienteStore();

const onSelectRow = (_e: Event, row: { original: { id: string } }) => {
  navigateTo(`/clientes/${row.original.id}`);
};

// -- Dados da API -------------------------------------------------------------
const { pending } = await useAsyncData("clientes", () => clienteStore.listar());
const clientes = computed(() => clienteStore.clientes);

// -- Colunas ------------------------------------------------------------------
const columns: TableColumn<Cliente>[] = [
  {
    accessorKey: "codigo",
    header: "Código",
    cell: ({ row }) => row.getValue<number>("codigo"),
  },
  {
    accessorKey: "nome",
    header: "Nome",
  },
  {
    accessorKey: "email",
    header: "E-mail",
  },
  {
    accessorKey: "telefonePrincipal",
    header: "Telefone",
  },
  {
    accessorKey: "cidade",
    header: "Cidade / UF",
    cell: ({ row }) =>
      `${row.getValue<string>("cidade")} / ${row.original.estado}`,
  },
  {
    accessorKey: "status",
    header: "Status",
  },
  {
    accessorKey: "createdAt",
    header: "Cadastro",
    cell: ({ row }) =>
      new Date(row.getValue<string>("createdAt")).toLocaleDateString("pt-BR"),
  },
  {
    id: "acoes",
    header: "Ações",
  },
];

// -- Paginação e filtro -------------------------------------------------------
const pagination = ref({ pageIndex: 0, pageSize: 8 });
const globalFilter = ref("");
const soMensalistas = ref(false);

const clientesFiltrados = computed(() => {
  if (!soMensalistas.value) return clientes.value;
  return clientes.value.filter((c) => c.mensalista);
});

// -- Cores dos avatares -------------------------------------------------------
const avatarColors = [
  "#F9C5D1",
  "#B5E5C8",
  "#FFDAAA",
  "#AACFF5",
  "#D4C5F9",
  "#F9E4B7",
];

const getAvatarColor = (id: string) => {
  const hash = id
    .split("")
    .reduce((acc, c) => acc + (c.codePointAt(0) ?? 0), 0);
  return avatarColors[hash % avatarColors.length];
};
</script>

<template>
  <div class="flex flex-col gap-4">
    <!-- Cabeçalho -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-xl font-bold text-gray-800 dark:text-gray-100">
          Clientes
        </h1>
        <p class="text-sm text-gray-500 dark:text-gray-400">
          {{ clientes.length }} clientes cadastrados
        </p>
      </div>
      <UButton
        to="/cadastro-cliente"
        color="secondary"
        leading-icon="i-lucide-user-plus"
      >
        Novo cliente
      </UButton>
    </div>

    <!-- Card da tabela -->
    <UCard
      class="bg-white dark:bg-neutral-900 ring-0 shadow-sm p-0 overflow-hidden"
    >
      <!-- Filtro -->
      <div class="flex items-center gap-3 px-4 py-3 border-b border-gray-100">
        <UInput
          v-model="globalFilter"
          leading-icon="i-lucide-search"
          placeholder="Buscar por nome, e-mail, cidade..."
          class="max-w-sm w-full"
          @update:model-value="pagination.pageIndex = 0"
        />
        <UButton
          :color="soMensalistas ? 'secondary' : 'neutral'"
          :variant="soMensalistas ? 'solid' : 'outline'"
          size="sm"
          leading-icon="i-lucide-calendar-check"
          @click="
            soMensalistas = !soMensalistas;
            pagination.pageIndex = 0;
          "
        >
          Mensalistas
        </UButton>
        <UBadge color="neutral" variant="soft" class="ml-auto">
          {{
            table?.tableApi?.getFilteredRowModel().rows.length ??
            clientesFiltrados.length
          }}
          resultado(s)
        </UBadge>
      </div>

      <!-- Tabela -->
      <div class="overflow-x-auto">
        <UTable
          ref="table"
          v-model:pagination="pagination"
          v-model:global-filter="globalFilter"
          :data="clientesFiltrados"
          :columns="columns"
          :loading="pending"
          :pagination-options="{
            getPaginationRowModel: getPaginationRowModel(),
          }"
          :ui="{
            tr: 'hover:bg-gray-50 dark:hover:bg-neutral-800 transition-colors cursor-pointer',
            th: 'whitespace-nowrap',
          }"
          @select="onSelectRow"
        >
          <!-- Coluna nome com avatar -->
          <template #nome-cell="{ row }">
            <div class="flex items-center gap-3">
              <div
                class="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-gray-700 shrink-0"
                :style="`background: ${getAvatarColor(row.original.id)}`"
              >
                {{
                  row.original.nome
                    .split(" ")
                    .map((n: string) => n[0])
                    .slice(0, 2)
                    .join("")
                    .toUpperCase()
                }}
              </div>
              <span class="font-medium text-gray-800 dark:text-gray-100">{{
                row.original.nome
              }}</span>
              <UBadge
                v-if="row.original.mensalista"
                color="secondary"
                variant="outline"
                size="sm"
                leading-icon="i-lucide-calendar-check"
              >
                Mensalista
              </UBadge>
              <span
                v-if="(row.original._count?.pacotesAtivos ?? 0) > 0"
                class="inline-flex items-center gap-0.5 text-xs font-semibold px-1.5 py-0.5 rounded-full bg-violet-100 dark:bg-violet-900/40 text-violet-700 dark:text-violet-400"
              >
                <UIcon name="i-lucide-ticket" class="size-3" />
                Pacotes
              </span>
            </div>
          </template>

          <!-- Coluna status com badge -->
          <template #status-cell="{ row }">
            <UBadge
              :color="row.original.status === 'Ativo' ? 'success' : 'neutral'"
              variant="soft"
              size="sm"
            >
              {{ row.original.status }}
            </UBadge>
          </template>

          <!-- Coluna ações -->
          <template #acoes-cell="{ row }">
            <div class="flex items-center justify-end gap-1">
              <UButton
                icon="i-lucide-eye"
                color="neutral"
                variant="ghost"
                size="xs"
                :aria-label="`Ver ${row.original.nome}`"
                @click="navigateTo(`/clientes/${row.original.id}`)"
              />
              <UButton
                icon="i-lucide-pencil"
                color="neutral"
                variant="ghost"
                size="xs"
                :aria-label="`Editar ${row.original.nome}`"
                @click="navigateTo(`/clientes/${row.original.id}/editar`)"
              />
            </div>
          </template>

          <!-- Empty state PT-BR -->
          <template #empty>
            <div
              class="flex flex-col items-center justify-center py-12 gap-2 text-gray-400"
            >
              <UIcon name="i-lucide-users" class="text-4xl" />
              <p class="text-sm font-medium">Nenhum cliente encontrado</p>
            </div>
          </template>
        </UTable>
      </div>

      <!-- Paginação -->
      <div
        class="flex items-center justify-between border-t border-gray-100 px-4 py-3"
      >
        <p class="text-sm text-gray-500">
          Página
          {{ (table?.tableApi?.getState().pagination.pageIndex ?? 0) + 1 }} de
          {{ table?.tableApi?.getPageCount() ?? 1 }}
        </p>
        <UPagination
          :page="(table?.tableApi?.getState().pagination.pageIndex ?? 0) + 1"
          :items-per-page="table?.tableApi?.getState().pagination.pageSize"
          :total="table?.tableApi?.getFilteredRowModel().rows.length"
          @update:page="(p) => table?.tableApi?.setPageIndex(p - 1)"
        />
      </div>
    </UCard>
  </div>
</template>
