<script setup lang="ts">
definePageMeta({ layout: "landing" });

useSeoMeta({
  title: "Política de Privacidade — AninPet",
  description:
    "Entenda como o AninPet coleta, usa e protege seus dados pessoais.",
  robots: "noindex",
});
</script>

<template>
  <div class="max-w-3xl mx-auto px-6 py-20 font-sans">
    <h1 class="text-3xl font-extrabold text-gray-900 mb-2">
      Política de Privacidade
    </h1>
    <p class="text-sm text-gray-400 mb-10">Última atualização: 15/04/2026</p>

    <div
      class="prose prose-gray max-w-none text-sm leading-relaxed text-gray-700 flex flex-col gap-8"
    >
      <section>
        <h2 class="text-lg font-bold text-gray-800 mb-2">1. Quem somos</h2>
        <p>
          O AninPet é um sistema de gestão para petshops desenvolvido e operado
          pela equipe AninPet. Nosso site é
          <a
            href="https://www.aninpet.com.br"
            class="text-sky-500 hover:underline"
            >www.aninpet.com.br</a
          >.
        </p>
      </section>

      <section>
        <h2 class="text-lg font-bold text-gray-800 mb-2">
          2. Quais dados coletamos
        </h2>
        <ul class="list-disc pl-5 flex flex-col gap-1">
          <li>Nome, e-mail e telefone do responsável pelo petshop;</li>
          <li>Dados dos clientes e pets cadastrados no sistema;</li>
          <li>
            Informações de pagamento (processadas com segurança pelo Mercado
            Pago);
          </li>
          <li>Dados de uso e navegação para melhoria do sistema.</li>
        </ul>
      </section>

      <section>
        <h2 class="text-lg font-bold text-gray-800 mb-2">
          3. Como usamos os dados
        </h2>
        <ul class="list-disc pl-5 flex flex-col gap-1">
          <li>Para operar e melhorar o sistema;</li>
          <li>Para enviar lembretes automáticos e comunicações do serviço;</li>
          <li>Para suporte ao cliente;</li>
          <li>Para cumprimento de obrigações legais.</li>
        </ul>
      </section>

      <section>
        <h2 class="text-lg font-bold text-gray-800 mb-2">
          4. Compartilhamento de dados
        </h2>
        <p>
          Não vendemos nem compartilhamos seus dados com terceiros para fins
          publicitários. Dados podem ser compartilhados apenas com parceiros de
          infraestrutura (hospedagem, pagamentos) estritamente necessários para
          o funcionamento do serviço.
        </p>
      </section>

      <section>
        <h2 class="text-lg font-bold text-gray-800 mb-2">
          5. Seus direitos (LGPD)
        </h2>
        <p>
          De acordo com a Lei Geral de Proteção de Dados (Lei 13.709/2018), você
          pode a qualquer momento solicitar: acesso aos seus dados, correção,
          exclusão, portabilidade e revogação de consentimento. Entre em contato
          pelo WhatsApp ou e-mail para exercer seus direitos.
        </p>
      </section>

      <section>
        <h2 class="text-lg font-bold text-gray-800 mb-2">6. Contato</h2>
        <p>
          Dúvidas? Entre em contato via
          <a
            href="https://wa.me/5511966389057"
            target="_blank"
            rel="noopener noreferrer"
            class="text-sky-500 hover:underline"
            >WhatsApp</a
          >.
        </p>
      </section>
    </div>

    <div class="mt-12">
      <NuxtLink
        to="/"
        class="inline-flex items-center gap-2 text-sm text-sky-500 hover:underline font-medium"
      >
        ← Voltar para o início
      </NuxtLink>
    </div>
  </div>
</template>
