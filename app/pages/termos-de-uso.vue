<script setup lang="ts">
definePageMeta({ layout: "landing" });

useSeoMeta({
  title: "Termos de Uso — AninPet",
  description: "Leia os termos e condições de uso do sistema AninPet.",
  robots: "noindex",
});
</script>

<template>
  <div class="max-w-3xl mx-auto px-6 py-20 font-sans">
    <h1 class="text-3xl font-extrabold text-gray-900 mb-2">Termos de Uso</h1>
    <p class="text-sm text-gray-400 mb-10">Última atualização: 15/04/2026</p>

    <div
      class="prose prose-gray max-w-none text-sm leading-relaxed text-gray-700 flex flex-col gap-8"
    >
      <section>
        <h2 class="text-lg font-bold text-gray-800 mb-2">
          1. Aceitação dos Termos
        </h2>
        <p>
          Ao criar uma conta no AninPet, você concorda com estes Termos de Uso.
          Caso não concorde, não utilize o serviço.
        </p>
      </section>

      <section>
        <h2 class="text-lg font-bold text-gray-800 mb-2">2. O Serviço</h2>
        <p>
          O AninPet é um sistema de gestão para petshops disponibilizado como
          Software como Serviço (SaaS). Oferecemos acesso mediante assinatura
          mensal com período de teste gratuito de 14 dias.
        </p>
      </section>

      <section>
        <h2 class="text-lg font-bold text-gray-800 mb-2">
          3. Cadastro e Responsabilidade
        </h2>
        <p>
          Você é responsável por manter as credenciais de acesso em sigilo e por
          todas as ações realizadas em sua conta. Dados de clientes e pets
          cadastrados no sistema são de sua responsabilidade.
        </p>
      </section>

      <section>
        <h2 class="text-lg font-bold text-gray-800 mb-2">
          4. Pagamento e Cancelamento
        </h2>
        <ul class="list-disc pl-5 flex flex-col gap-1">
          <li>
            O trial de 14 dias é gratuito, sem necessidade de cartão de crédito;
          </li>
          <li>
            Após o trial, a assinatura é cobrada mensalmente via Mercado Pago;
          </li>
          <li>Você pode cancelar a qualquer momento, sem multa ou carência;</li>
          <li>O cancelamento encerra o acesso ao fim do período já pago.</li>
        </ul>
      </section>

      <section>
        <h2 class="text-lg font-bold text-gray-800 mb-2">
          5. Limitação de Responsabilidade
        </h2>
        <p>
          O AninPet é fornecido "como está". Não nos responsabilizamos por
          perdas de dados causadas por uso inadequado ou por falhas fora de
          nosso controle. Fazemos backup automático dos dados para minimizar
          riscos.
        </p>
      </section>

      <section>
        <h2 class="text-lg font-bold text-gray-800 mb-2">
          6. Alterações nos Termos
        </h2>
        <p>
          Podemos atualizar estes termos a qualquer momento. Notificaremos
          usuários ativos sobre mudanças relevantes por e-mail.
        </p>
      </section>

      <section>
        <h2 class="text-lg font-bold text-gray-800 mb-2">7. Contato</h2>
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
