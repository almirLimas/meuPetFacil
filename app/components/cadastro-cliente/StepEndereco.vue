<script setup lang="ts">
import * as z from "zod";
import type { ClienteFormState } from "~/types/cliente";

const schema = z.object({
  cep: z.string().min(8, "CEP inválido"),
  rua: z.string().min(1, "Informe a rua"),
  numero: z.string().min(1, "Informe o número"),
  complemento: z.string().optional(),
  bairro: z.string().min(1, "Informe o bairro"),
  cidade: z.string().min(1, "Informe a cidade"),
  estado: z.string().min(2, "Informe o estado"),
});

const state = defineModel<ClienteFormState>({ required: true });

const formRef = ref();
const cepLoading = ref(false);
const cepError = ref<string | null>(null);

// Controla quais campos foram bloqueados pelo retorno do CEP
const cepLocked = reactive({
  rua: false,
  bairro: false,
  cidade: false,
  estado: false,
});

async function buscarCep() {
  const cepNumeros = state.value.cep?.replace(/\D/g, "") ?? "";
  if (cepNumeros.length !== 8) return;

  // Limpa bloqueios anteriores ao buscar novo CEP
  cepLocked.rua = false;
  cepLocked.bairro = false;
  cepLocked.cidade = false;
  cepLocked.estado = false;

  cepLoading.value = true;
  cepError.value = null;

  try {
    const res = await fetch(`https://viacep.com.br/ws/${cepNumeros}/json/`);
    if (!res.ok) throw new Error("Erro na requisição");

    const data = await res.json();
    if (data.erro) {
      cepError.value = "CEP não encontrado";
      return;
    }

    if (data.logradouro) {
      state.value.rua = data.logradouro;
      cepLocked.rua = true;
    } else {
      state.value.rua = "";
    }
    if (data.bairro) {
      state.value.bairro = data.bairro;
      cepLocked.bairro = true;
    } else {
      state.value.bairro = "";
    }
    if (data.localidade) {
      state.value.cidade = data.localidade;
      cepLocked.cidade = true;
    } else {
      state.value.cidade = "";
    }
    if (data.uf) {
      state.value.estado = data.uf;
      cepLocked.estado = true;
    } else {
      state.value.estado = "";
    }
  } catch {
    cepError.value = "Não foi possível buscar o CEP. Tente novamente.";
  } finally {
    cepLoading.value = false;
  }
}

defineExpose({
  validate: async (): Promise<boolean> => {
    try {
      await formRef.value?.validate();
    } catch {
      // erros de campo são mostrados pelo UForm
    }
    return schema.safeParse(state.value).success;
  },
});
</script>

<template>
  <UForm ref="formRef" :schema="schema" :state="state" @submit="() => {}">
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <UFormField
        label="CEP"
        name="cep"
        required
        :error="cepError ?? undefined"
      >
        <UInput
          v-model="state.cep"
          placeholder="00000-000"
          class="w-full"
          :loading="cepLoading"
          :disabled="cepLoading"
          @blur="buscarCep"
        />
      </UFormField>

      <UFormField label="Rua" name="rua" required>
        <UInput
          v-model="state.rua"
          placeholder="Rua das Flores"
          class="w-full"
          :disabled="cepLocked.rua"
        />
      </UFormField>

      <UFormField label="Número" name="numero" required>
        <UInput v-model="state.numero" placeholder="123" class="w-full" />
      </UFormField>

      <UFormField label="Complemento" name="complemento">
        <UInput
          v-model="state.complemento"
          placeholder="Apto 42"
          class="w-full"
        />
      </UFormField>

      <UFormField label="Bairro" name="bairro" required>
        <UInput
          v-model="state.bairro"
          placeholder="Centro"
          class="w-full"
          :disabled="cepLocked.bairro"
        />
      </UFormField>

      <UFormField label="Cidade" name="cidade" required>
        <UInput
          v-model="state.cidade"
          placeholder="São Paulo"
          class="w-full"
          :disabled="cepLocked.cidade"
        />
      </UFormField>

      <UFormField label="Estado" name="estado" required>
        <UInput
          v-model="state.estado"
          placeholder="SP"
          class="w-full"
          :disabled="cepLocked.estado"
        />
      </UFormField>
    </div>
  </UForm>
</template>
