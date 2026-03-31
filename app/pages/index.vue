<script setup lang="ts">
definePageMeta({ layout: "landing" });

const features = [
  {
    icone: "i-lucide-calendar-check",
    titulo: "Agenda Completa",
    descricao: "Gerencie horários de banho e tosa.",
  },
  {
    icone: "i-lucide-trending-up",
    titulo: "Controle Financeiro",
    descricao: "Acompanhe vendas e lucros.",
  },
  {
    icone: "i-lucide-paw-print",
    titulo: "Ficha dos Pets",
    descricao: "Tudo sobre seus clientes e animais.",
  },
  {
    icone: "i-lucide-message-circle",
    titulo: "WhatsApp Automático",
    descricao: "Lembretes e promoções no celular do cliente.",
  },
  {
    icone: "i-lucide-package",
    titulo: "Controle de Estoque",
    descricao: "Produtos e acessórios sem perder vendas.",
  },
  {
    icone: "i-lucide-bar-chart-2",
    titulo: "Relatórios",
    descricao: "Saiba o que mais vende e quem não voltou.",
  },
];

const planos = [
  {
    id: "basico",
    nome: "Básico",
    preco: 79,
    destaque: false,
    badge: null,
    descricao: "Para petshops que querem se organizar e crescer.",
    recursos: [
      "Agenda de agendamentos",
      "Cadastro de clientes e pets",
      "Controle de serviços",
      "Financeiro",
      "Relatórios essenciais",
      "Suporte por email",
    ],
  },
  {
    id: "profissional",
    nome: "Plus",
    preco: 129,
    destaque: true,
    badge: "Mais popular",
    descricao: "Para petshops que querem vender mais com automação.",
    recursos: [
      "Tudo do Básico",
      "WhatsApp automático",
      "Lembretes de agendamento",
      "Controle de estoque",
      "Campanhas para clientes inativos",
      "Suporte prioritário",
    ],
  },
];
</script>

<template>
  <div class="font-sans">
    <!-- NAV -->
    <header class="sticky top-0 z-50 bg-white shadow-sm">
      <div
        class="max-w-6xl mx-auto px-6 py-2 flex items-center justify-between"
      >
        <div class="shrink-0 w-40 sm:w-52 md:w-60">
          <AppLogo :size="240" />
        </div>
        <nav
          class="hidden md:flex items-center gap-8 text-sm text-gray-600 font-medium"
        >
          <a
            href="#funcionalidades"
            class="hover:text-sky-500 transition-colors"
            >Funcionalidades</a
          >
          <a href="#planos" class="hover:text-sky-500 transition-colors"
            >Planos</a
          >
          <a href="#depoimentos" class="hover:text-sky-500 transition-colors"
            >Depoimentos</a
          >
        </nav>
        <div class="flex items-center gap-3">
          <NuxtLink
            to="/login"
            class="hidden sm:block text-sm text-gray-600 hover:text-gray-900 font-medium"
            >Entrar</NuxtLink
          >
          <NuxtLink
            to="/criar-conta"
            class="px-5 py-2 rounded-lg bg-orange-500 hover:bg-orange-600 text-white text-sm font-bold transition-colors shadow-sm"
          >
            Teste Grátis
          </NuxtLink>
        </div>
      </div>
    </header>

    <!-- HERO -->
    <section
      class="relative overflow-hidden bg-gradient-to-br from-sky-500 via-sky-400 to-sky-300 pt-16 pb-0"
    >
      <UIcon
        name="i-lucide-paw-print"
        class="absolute top-8 right-12 size-10 text-white/10 rotate-12"
      />
      <UIcon
        name="i-lucide-paw-print"
        class="absolute bottom-16 left-8 size-8 text-white/10 -rotate-12"
      />
      <div
        class="max-w-6xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-10 items-end"
      >
        <div class="text-white pb-16 pt-4 flex flex-col gap-6">
          <h1 class="text-4xl sm:text-5xl font-extrabold leading-tight">
            Gerencie Seu Pet Shop<br />de Forma Fácil!
          </h1>
          <ul class="flex flex-col gap-3">
            <li class="flex items-center gap-3 text-lg">
              <div
                class="w-6 h-6 rounded-full bg-orange-500 flex items-center justify-center shrink-0"
              >
                <UIcon name="i-lucide-check" class="size-3.5 text-white" />
              </div>
              Agendas e Clientes Organizados
            </li>
            <li class="flex items-center gap-3 text-lg">
              <div
                class="w-6 h-6 rounded-full bg-orange-500 flex items-center justify-center shrink-0"
              >
                <UIcon name="i-lucide-check" class="size-3.5 text-white" />
              </div>
              Controle de Vendas e Estoque
            </li>
            <li class="flex items-center gap-3 text-lg">
              <div
                class="w-6 h-6 rounded-full bg-orange-500 flex items-center justify-center shrink-0"
              >
                <UIcon name="i-lucide-check" class="size-3.5 text-white" />
              </div>
              Tudo na Nuvem, Simples e Rápido
            </li>
          </ul>
          <div class="flex flex-col sm:flex-row gap-3 mt-2">
            <NuxtLink
              to="/criar-conta"
              class="inline-flex items-center justify-center px-8 py-3.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-lg transition-colors shadow-lg"
            >
              Experimente Grátis
            </NuxtLink>
          </div>
          <p class="text-white/70 text-sm">Sem Cartão de Crédito</p>
        </div>
        <div class="relative flex justify-center lg:justify-end items-end">
          <div class="relative">
            <div class="w-80 sm:w-96 bg-gray-800 rounded-t-xl p-2 shadow-2xl">
              <div class="flex items-center gap-1.5 mb-2 px-1">
                <div class="w-2.5 h-2.5 rounded-full bg-red-400"></div>
                <div class="w-2.5 h-2.5 rounded-full bg-yellow-400"></div>
                <div class="w-2.5 h-2.5 rounded-full bg-green-400"></div>
              </div>
              <div class="bg-[#f5f5f0] rounded-lg overflow-hidden h-44">
                <div class="bg-sky-500 h-8 flex items-center px-3 gap-2">
                  <UIcon name="i-lucide-paw-print" class="size-4 text-white" />
                  <span class="text-white text-xs font-bold">Anim Pet</span>
                </div>
                <div class="p-3 flex gap-2">
                  <div class="w-20 bg-white rounded-lg p-1.5 shadow-sm">
                    <div class="text-[8px] text-gray-400 mb-1">Agenda hoje</div>
                    <div class="space-y-1">
                      <div class="h-1.5 bg-teal-200 rounded w-full"></div>
                      <div class="h-1.5 bg-orange-200 rounded w-3/4"></div>
                      <div class="h-1.5 bg-teal-200 rounded w-full"></div>
                      <div class="h-1.5 bg-gray-100 rounded w-1/2"></div>
                    </div>
                  </div>
                  <div class="flex-1 space-y-2">
                    <div class="bg-white rounded-lg p-1.5 shadow-sm">
                      <div class="text-[8px] text-gray-400">Receita do mês</div>
                      <div class="text-xs font-bold text-sky-500">R$ 4.820</div>
                    </div>
                    <div class="bg-white rounded-lg p-1.5 shadow-sm">
                      <div class="text-[8px] text-gray-400">
                        Clientes ativos
                      </div>
                      <div class="text-xs font-bold text-gray-700">127</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div class="bg-gray-700 h-3 w-full rounded-b-xl"></div>
            <div class="bg-gray-600 h-2 w-40 mx-auto rounded-b-lg"></div>
            <div
              class="absolute -right-8 bottom-4 w-24 bg-gray-800 rounded-2xl p-1.5 shadow-2xl border-2 border-gray-700"
            >
              <div class="bg-[#f5f5f0] rounded-xl overflow-hidden h-40">
                <div class="bg-sky-500 h-6 flex items-center justify-center">
                  <span class="text-white text-[8px] font-bold">Anim Pet</span>
                </div>
                <div class="p-1.5 space-y-1.5">
                  <div class="bg-white rounded p-1 shadow-sm">
                    <div class="flex items-center gap-1 mb-0.5">
                      <div
                        class="w-4 h-4 rounded-full bg-sky-100 flex items-center justify-center"
                      >
                        <UIcon
                          name="i-lucide-dog"
                          class="size-2.5 text-sky-500"
                        />
                      </div>
                      <span class="text-[7px] font-medium text-gray-700"
                        >Thor</span
                      >
                    </div>
                    <div class="text-[6px] text-gray-400">Labrador • 12kg</div>
                  </div>
                  <div class="bg-orange-500 rounded p-1 text-center">
                    <span class="text-[7px] text-white font-bold">Agendar</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="relative h-12 mt-4">
        <svg
          viewBox="0 0 1440 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          class="absolute bottom-0 w-full"
          preserveAspectRatio="none"
        >
          <path
            d="M0 48L60 42C120 36 240 24 360 18C480 12 600 12 720 18C840 24 960 36 1080 38C1200 40 1320 32 1380 28L1440 24V48H0Z"
            fill="white"
          />
        </svg>
      </div>
    </section>

    <!-- FEATURES -->
    <section id="funcionalidades" class="py-16 px-6 bg-white">
      <div class="max-w-6xl mx-auto">
        <div class="text-center mb-12">
          <h2 class="text-3xl font-bold text-gray-900">
            Tudo que seu petshop precisa
          </h2>
          <p class="text-gray-500 mt-2">
            Sem planilha. Sem papel. Sem dor de cabeça.
          </p>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          <div
            v-for="f in features"
            :key="f.titulo"
            class="flex items-start gap-4 p-5 rounded-2xl border border-gray-100 hover:border-teal-200 hover:shadow-sm transition-all"
          >
            <div
              class="w-11 h-11 rounded-xl bg-teal-50 flex items-center justify-center shrink-0"
            >
              <UIcon :name="f.icone" class="size-5 text-sky-500" />
            </div>
            <div>
              <h3 class="font-semibold text-gray-800 mb-1">{{ f.titulo }}</h3>
              <p class="text-sm text-gray-500 leading-relaxed">
                {{ f.descricao }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- BANNER DEPOIMENTO -->
    <section id="depoimentos" class="relative overflow-hidden bg-orange-500">
      <UIcon
        name="i-lucide-paw-print"
        class="absolute top-6 right-16 size-16 text-white/10 rotate-12"
      />
      <UIcon
        name="i-lucide-paw-print"
        class="absolute bottom-4 left-24 size-12 text-white/10 -rotate-12"
      />
      <div
        class="max-w-6xl mx-auto px-6 py-16 grid grid-cols-1 lg:grid-cols-2 gap-10 items-center"
      >
        <div class="text-white">
          <h2 class="text-3xl sm:text-4xl font-extrabold leading-snug mb-6">
            Mais Tempo para Cuidar dos Pets,<br /><span class="opacity-90"
              >Menos com Papelada!</span
            >
          </h2>
          <div class="bg-white rounded-2xl p-6 shadow-lg max-w-md">
            <div class="text-3xl text-sky-500 font-serif mb-3 leading-none">
              &ldquo;
            </div>
            <p class="text-gray-700 text-sm leading-relaxed italic mb-4">
              O Anin Pet facilitou muito minha vida aqui no pet shop! Super
              fácil de usar e meus clientes adoram!
            </p>
            <div class="flex items-center gap-3">
              <div
                class="w-9 h-9 rounded-full bg-sky-100 flex items-center justify-center text-sky-500 font-bold text-sm shrink-0"
              >
                MS
              </div>
              <div>
                <p class="text-sm font-semibold text-gray-800">Mariana Souza</p>
                <p class="text-xs text-gray-400">Pet Shop Patinhas Felizes</p>
              </div>
            </div>
          </div>
        </div>
        <div class="flex justify-center lg:justify-end">
          <img
            src="/mascot.png"
            alt="Mascote Anin Pet"
            class="h-64 sm:h-80 object-contain drop-shadow-2xl"
          />
        </div>
      </div>
    </section>

    <!-- PLANOS -->
    <section id="planos" class="py-20 px-6 bg-gray-50">
      <div class="max-w-4xl mx-auto">
        <div class="text-center mb-12">
          <h2 class="text-3xl font-bold text-gray-900">
            Planos simples e transparentes
          </h2>
          <p class="text-gray-500 mt-2">
            Comece grátis por 14 dias. Sem surpresas na fatura.
          </p>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-6 items-start">
          <div
            v-for="plano in planos"
            :key="plano.id"
            class="relative flex flex-col rounded-2xl border-2 p-8 bg-white"
            :class="
              plano.destaque
                ? 'border-orange-500 shadow-xl shadow-orange-100'
                : 'border-gray-200'
            "
          >
            <div
              v-if="plano.badge"
              class="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-xs font-bold bg-orange-500 text-white whitespace-nowrap"
            >
              ⭐ {{ plano.badge }}
            </div>
            <div class="flex flex-col gap-1 mb-6">
              <span
                class="text-sm font-semibold text-sky-500 uppercase tracking-wide"
                >{{ plano.nome }}</span
              >
              <div class="flex items-end gap-1">
                <span class="text-4xl font-extrabold text-gray-900"
                  >R$ {{ plano.preco }}</span
                >
                <span class="text-gray-400 mb-1">/mês</span>
              </div>
              <p class="text-sm text-gray-500 mt-1">{{ plano.descricao }}</p>
            </div>
            <ul class="flex flex-col gap-3 mb-8 flex-1">
              <li
                v-for="rec in plano.recursos"
                :key="rec"
                class="flex items-start gap-2 text-sm text-gray-700"
              >
                <UIcon
                  name="i-lucide-check"
                  class="size-4 text-sky-500 mt-0.5 shrink-0"
                />
                {{ rec }}
              </li>
            </ul>
            <NuxtLink
              :to="'/criar-conta?plano=' + plano.id"
              class="block text-center py-3 rounded-xl font-bold text-sm transition-colors"
              :class="
                plano.destaque
                  ? 'bg-orange-500 hover:bg-orange-600 text-white'
                  : 'border-2 border-gray-300 text-gray-700 hover:border-sky-500 hover:text-sky-500'
              "
            >
              Começar grátis
            </NuxtLink>
          </div>
        </div>
        <p class="text-center text-sm text-gray-400 mt-6">
          14 dias de trial gratuito. Sem cartão de crédito.
        </p>
      </div>
    </section>

    <!-- CTA FINAL -->
    <section
      class="relative overflow-hidden py-20 px-6 bg-gradient-to-br from-sky-500 to-sky-400 text-white text-center"
    >
      <UIcon
        name="i-lucide-paw-print"
        class="absolute top-6 left-12 size-14 text-white/10 -rotate-12"
      />
      <UIcon
        name="i-lucide-paw-print"
        class="absolute bottom-6 right-16 size-10 text-white/10 rotate-12"
      />
      <div class="relative max-w-2xl mx-auto flex flex-col items-center gap-5">
        <h2 class="text-3xl sm:text-4xl font-extrabold">Comece Hoje Mesmo!</h2>
        <p class="text-teal-100 text-lg">Teste grátis e veja como é simples!</p>
        <NuxtLink
          to="/criar-conta"
          class="px-10 py-4 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-lg transition-colors shadow-lg"
        >
          Teste Grátis
        </NuxtLink>
        <p class="text-teal-200 text-sm">
          Sem cartão de crédito. Cancele quando quiser.
        </p>
      </div>
    </section>

    <!-- FOOTER -->
    <footer class="py-8 px-6 bg-gray-900 text-gray-400 text-sm">
      <div
        class="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3"
      >
        <AppLogo :size="100" />
        <p>
          © {{ new Date().getFullYear() }} Anim Pet. Todos os direitos
          reservados.
        </p>
        <div class="flex gap-4">
          <NuxtLink to="/login" class="hover:text-white">Entrar</NuxtLink>
          <NuxtLink to="/criar-conta" class="hover:text-white"
            >Criar conta</NuxtLink
          >
        </div>
      </div>
    </footer>
  </div>
</template>
