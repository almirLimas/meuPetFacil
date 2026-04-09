<script setup lang="ts">
definePageMeta({ layout: "default" });
useBreadcrumb().set([{ label: "Primeiros passos" }]);
</script>

<template>
  <div class="flex flex-col gap-4">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-xl font-bold text-gray-800 dark:text-gray-100">
          Primeiros passos
        </h1>
        <p class="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
          Siga essa sequência para configurar seu sistema e começar a usar.
        </p>
      </div>
    </div>

    <!-- Steps -->
    <div class="flex flex-col gap-3">
      <!-- 1 -->
      <UCard class="ring-0 shadow-sm">
        <div class="flex gap-4">
          <div
            class="shrink-0 w-9 h-9 rounded-full bg-[#1d9fb6] flex items-center justify-center text-white font-bold text-sm"
          >
            1
          </div>
          <div class="flex flex-col gap-1 flex-1">
            <div class="flex items-center justify-between gap-2 flex-wrap">
              <p class="font-semibold text-gray-800 dark:text-gray-100">
                Cadastre seus serviços
              </p>
              <UButton
                size="xs"
                color="secondary"
                variant="soft"
                to="/servicos"
                trailing-icon="i-lucide-arrow-right"
              >
                Ir para Serviços
              </UButton>
            </div>
            <p class="text-sm text-gray-500 dark:text-gray-400">
              Antes de criar agendamentos, você precisa ter pelo menos um
              serviço cadastrado (ex: Banho, Tosa, Consulta). Defina o nome,
              preço e duração.
            </p>
          </div>
        </div>
      </UCard>

      <!-- 2 -->
      <UCard class="ring-0 shadow-sm">
        <div class="flex gap-4">
          <div
            class="shrink-0 w-9 h-9 rounded-full bg-[#1d9fb6] flex items-center justify-center text-white font-bold text-sm"
          >
            2
          </div>
          <div class="flex flex-col gap-1 flex-1">
            <div class="flex items-center justify-between gap-2 flex-wrap">
              <p class="font-semibold text-gray-800 dark:text-gray-100">
                Configure a taxa de busca (taxidog)
              </p>
              <UButton
                size="xs"
                color="secondary"
                variant="soft"
                to="/configuracoes/perfil"
                trailing-icon="i-lucide-arrow-right"
              >
                Ir para Configurações
              </UButton>
            </div>
            <p class="text-sm text-gray-500 dark:text-gray-400">
              Se o seu petshop busca o pet na casa do cliente (taxidog), acesse
              <strong>Configurações → Perfil</strong> e preencha o campo
              <strong>Taxa de Busca (R$)</strong> com o valor cobrado por busca.
              A partir disso:
            </p>
            <ul
              class="mt-1.5 text-sm text-gray-500 dark:text-gray-400 list-disc list-inside space-y-1"
            >
              <li>
                Ao criar um agendamento, marque a opção
                <strong>"Petshop busca"</strong> e o valor da taxa será somado
                automaticamente ao total do serviço.
              </li>
              <li>
                O lançamento financeiro gerado já incluirá a taxa de busca no
                valor total.
              </li>
              <li>
                Se não cobrar taxa de busca, basta deixar o campo em branco ou
                zerado.
              </li>
            </ul>
          </div>
        </div>
      </UCard>

      <!-- 3 -->
      <UCard class="ring-0 shadow-sm">
        <div class="flex gap-4">
          <div
            class="shrink-0 w-9 h-9 rounded-full bg-[#1d9fb6] flex items-center justify-center text-white font-bold text-sm"
          >
            3
          </div>
          <div class="flex flex-col gap-1 flex-1">
            <div class="flex items-center justify-between gap-2 flex-wrap">
              <p class="font-semibold text-gray-800 dark:text-gray-100">
                Cadastre seus clientes
              </p>
              <UButton
                size="xs"
                color="secondary"
                variant="soft"
                to="/clientes"
                trailing-icon="i-lucide-arrow-right"
              >
                Ir para Clientes
              </UButton>
            </div>
            <p class="text-sm text-gray-500 dark:text-gray-400">
              Adicione os dados dos seus clientes: nome, telefone, e-mail e
              endereço. Você também pode cadastrar os pets de cada cliente
              diretamente no cadastro.
            </p>
            <p
              class="mt-2 text-sm font-semibold text-gray-700 dark:text-gray-300"
            >
              Cliente mensalista
            </p>
            <p class="text-sm text-gray-500 dark:text-gray-400">
              Se um cliente paga um valor fixo por mês (ex: banho toda semana
              por R$ 120/mês), ative o campo
              <strong>"Cliente mensalista"</strong> já no primeiro passo do
              cadastro:
            </p>
            <ul
              class="mt-1.5 text-sm text-gray-500 dark:text-gray-400 list-disc list-inside space-y-1"
            >
              <li>
                Informe o <strong>valor mensal</strong> combinado e o
                <strong>dia do vencimento</strong> (ex: todo dia 10).
              </li>
              <li>
                O sistema registrará esse cliente como mensalista e exibirá essa
                informação no perfil dele.
              </li>
              <li>
                Os agendamentos do mensalista são criados normalmente; o
                controle de pagamento mensal é feito na aba
                <strong>Financeiro</strong>.
              </li>
            </ul>
          </div>
        </div>
      </UCard>

      <!-- 3 -->
      <UCard class="ring-0 shadow-sm">
        <div class="flex gap-4">
          <div
            class="shrink-0 w-9 h-9 rounded-full bg-[#1d9fb6] flex items-center justify-center text-white font-bold text-sm"
          >
            4
          </div>
          <div class="flex flex-col gap-1 flex-1">
            <div class="flex items-center justify-between gap-2 flex-wrap">
              <p class="font-semibold text-gray-800 dark:text-gray-100">
                Crie seu primeiro agendamento
              </p>
              <UButton
                size="xs"
                color="secondary"
                variant="soft"
                to="/agenda"
                trailing-icon="i-lucide-arrow-right"
              >
                Ir para Agenda
              </UButton>
            </div>
            <p class="text-sm text-gray-500 dark:text-gray-400">
              Na agenda, clique em "Novo Agendamento", escolha o cliente, o pet,
              o serviço e o horário. O sistema valida automaticamente conflitos
              de horário.
            </p>
          </div>
        </div>
      </UCard>

      <!-- 5 -->
      <UCard class="ring-0 shadow-sm">
        <div class="flex gap-4">
          <div
            class="shrink-0 w-9 h-9 rounded-full bg-[#1d9fb6] flex items-center justify-center text-white font-bold text-sm"
          >
            5
          </div>
          <div class="flex flex-col gap-1 flex-1">
            <div class="flex items-center justify-between gap-2 flex-wrap">
              <p class="font-semibold text-gray-800 dark:text-gray-100">
                Controle seu estoque
              </p>
              <UButton
                size="xs"
                color="secondary"
                variant="soft"
                to="/estoque"
                trailing-icon="i-lucide-arrow-right"
              >
                Ir para Estoque
              </UButton>
            </div>
            <p class="text-sm text-gray-500 dark:text-gray-400">
              Cadastre os produtos que você usa ou vende (shampoos, rações,
              acessórios). O estoque avisa quando o estoque estiver baixo.
            </p>
          </div>
        </div>
      </UCard>

      <!-- 6 -->
      <UCard class="ring-0 shadow-sm">
        <div class="flex gap-4">
          <div
            class="shrink-0 w-9 h-9 rounded-full bg-[#1d9fb6] flex items-center justify-center text-white font-bold text-sm"
          >
            6
          </div>
          <div class="flex flex-col gap-1 flex-1">
            <div class="flex items-center justify-between gap-2 flex-wrap">
              <p class="font-semibold text-gray-800 dark:text-gray-100">
                Use o PDV para registrar vendas no balcão
              </p>
              <UButton
                size="xs"
                color="secondary"
                variant="soft"
                to="/pdv"
                trailing-icon="i-lucide-arrow-right"
              >
                Ir para Vendas
              </UButton>
            </div>
            <p class="text-sm text-gray-500 dark:text-gray-400">
              O Ponto de Venda permite registrar vendas rápidas de produtos e
              serviços diretamente no balcão, sem precisar criar um agendamento.
              Veja como funciona:
            </p>
            <ul
              class="mt-1.5 text-sm text-gray-500 dark:text-gray-400 list-disc list-inside space-y-1"
            >
              <li>
                Selecione <strong>Produto</strong> ou <strong>Serviço</strong> e
                busque pelo nome ou código de barras.
              </li>
              <li>
                Clique no item (ou pressione <strong>Enter</strong> se houver
                apenas um resultado) para adicioná-lo ao carrinho.
              </li>
              <li>
                Ajuste as quantidades com os botões <strong>+</strong> /
                <strong>−</strong> e aplique desconto se necessário.
              </li>
              <li>
                Escolha a forma de pagamento (Dinheiro, Cartão, PIX, Fiado ou
                Outro). Para dinheiro, informe o valor recebido e o sistema
                calcula o troco automaticamente.
              </li>
              <li>
                Clique em <strong>Confirmar Venda</strong>. A venda é registrada
                e aparece no histórico à direita.
              </li>
              <li>
                Para cancelar uma venda já registrada, clique no botão
                <strong>×</strong> ao lado dela no histórico.
              </li>
            </ul>
          </div>
        </div>
      </UCard>

      <!-- 7 -->
      <UCard class="ring-0 shadow-sm">
        <div class="flex gap-4">
          <div
            class="shrink-0 w-9 h-9 rounded-full bg-[#1d9fb6] flex items-center justify-center text-white font-bold text-sm"
          >
            7
          </div>
          <div class="flex flex-col gap-1 flex-1">
            <div class="flex items-center justify-between gap-2 flex-wrap">
              <p class="font-semibold text-gray-800 dark:text-gray-100">
                Acompanhe o financeiro
              </p>
              <UButton
                size="xs"
                color="secondary"
                variant="soft"
                to="/financeiro"
                trailing-icon="i-lucide-arrow-right"
              >
                Ir para Financeiro
              </UButton>
            </div>
            <p class="text-sm text-gray-500 dark:text-gray-400">
              Registre receitas e despesas para controlar o fluxo de caixa da
              sua petshop. Veja o resumo do mês no Dashboard.
            </p>
          </div>
        </div>
      </UCard>

      <!-- 8 -->
      <UCard class="ring-0 shadow-sm">
        <div class="flex gap-4">
          <div
            class="shrink-0 w-9 h-9 rounded-full bg-[#1d9fb6] flex items-center justify-center text-white font-bold text-sm"
          >
            8
          </div>
          <div class="flex flex-col gap-1 flex-1">
            <div class="flex items-center justify-between gap-2 flex-wrap">
              <p class="font-semibold text-gray-800 dark:text-gray-100">
                Conecte o WhatsApp
              </p>
              <UButton
                size="xs"
                color="secondary"
                variant="soft"
                to="/configuracoes/whatsapp"
                trailing-icon="i-lucide-arrow-right"
              >
                Ir para WhatsApp
              </UButton>
            </div>
            <p class="text-sm text-gray-500 dark:text-gray-400">
              Vincule o número da sua petshop para enviar lembretes automáticos
              e mensagens de recuperação para clientes que não voltam há algum
              tempo.
            </p>
          </div>
        </div>
      </UCard>
    </div>

    <!-- Dica final -->
    <UCard
      class="bg-blue-50 dark:bg-blue-950/30 ring-0 border border-blue-100 dark:border-blue-900"
    >
      <div class="flex gap-3">
        <UIcon
          name="i-lucide-lightbulb"
          class="size-5 text-blue-500 shrink-0 mt-0.5"
        />
        <div>
          <p class="text-sm font-semibold text-blue-700 dark:text-blue-300">
            Dica
          </p>
          <p class="text-sm text-blue-600 dark:text-blue-400 mt-0.5">
            Você pode acompanhar um resumo geral de tudo no
            <NuxtLink to="/dashboard" class="underline font-medium"
              >Dashboard</NuxtLink
            >. Ele exibe agendamentos do dia, receita do mês e alertas de
            estoque baixo.
          </p>
        </div>
      </div>
    </UCard>
  </div>
</template>
