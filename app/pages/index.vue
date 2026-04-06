<script setup lang="ts">
definePageMeta({ layout: "landing" });

useHead({
  script: [
    {
      type: "application/ld+json",
      innerHTML: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "Organization",
        name: "AninPet",
        url: "https://www.aninpet.com.br",
        logo: "https://www.aninpet.com.br/logo_aninpet.png",
        sameAs: [],
      }),
    },
  ],
});

useSeoMeta({
  title:
    "AninPet — Sistema para Pet Shop que quer organizar a agenda e aumentar o faturamento",
  description:
    "Sistema para pet shop que quer organizar a agenda e aumentar o faturamento. Lembretes automáticos por e-mail, controle financeiro e muito mais. Experimente grátis por 14 dias.",
  ogTitle:
    "AninPet — Sistema para Pet Shop que quer organizar a agenda e aumentar o faturamento",
  ogDescription:
    "Sistema para pet shop que quer organizar a agenda e aumentar o faturamento. Lembretes automáticos por e-mail, controle financeiro e muito mais. Experimente grátis por 14 dias.",
  ogImage: "https://www.aninpet.com.br/logo_aninpet.png",
  ogUrl: "https://www.aninpet.com.br",
  ogType: "website",
  ogSiteName: "AninPet",
  twitterCard: "summary_large_image",
  twitterTitle:
    "AninPet — Sistema para Pet Shop que quer organizar a agenda e aumentar o faturamento",
  twitterDescription:
    "Sistema para pet shop que quer organizar a agenda e aumentar o faturamento. Lembretes automáticos por e-mail, controle financeiro e muito mais. Experimente grátis por 14 dias.",
  twitterImage: "https://www.aninpet.com.br/logo_aninpet.png",
});

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
    icone: "i-lucide-mail",
    titulo: "Lembretes Automáticos",
    descricao:
      "E-mails automáticos para clientes que não voltam há 30 dias — sem precisar fazer nada.",
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
    id: "plus",
    nome: "Plus",
    preco: 109,
    destaque: true,
    badge: "Mais popular",
    descricao:
      "Para petshops que querem fidelizar clientes no piloto automático.",
    recursos: [
      "Tudo do Básico",
      "Lembrete automático por e-mail para clientes inativos",
      "Relatório mensal enviado por e-mail",
      "Meta mensal com acompanhamento",
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
        class="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between overflow-visible"
      >
        <div class="shrink-0 h-24">
          <AppLogo :size="260" />
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
            class="text-sm text-gray-600 hover:text-gray-900 font-medium"
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
            Sistema para pet shop<br />
            que quer <span class="text-orange-300">organizar a agenda</span
            ><br />
            e <span class="text-orange-300">aumentar o faturamento</span>
          </h1>
          <ul class="flex flex-col gap-3">
            <li class="flex items-center gap-3 text-lg">
              <div
                class="w-6 h-6 rounded-full bg-orange-500 flex items-center justify-center shrink-0"
              >
                <UIcon name="i-lucide-calendar" class="size-3.5 text-white" />
              </div>
              Agendas e Clientes Organizados
            </li>
            <li class="flex items-center gap-3 text-lg">
              <div
                class="w-6 h-6 rounded-full bg-orange-500 flex items-center justify-center shrink-0"
              >
                <UIcon name="i-lucide-package" class="size-3.5 text-white" />
              </div>
              Controle de Vendas e Estoque
            </li>
            <li class="flex items-center gap-3 text-lg">
              <div
                class="w-6 h-6 rounded-full bg-orange-500 flex items-center justify-center shrink-0"
              >
                <UIcon name="i-lucide-mail" class="size-3.5 text-white" />
              </div>
              Lembretes automáticos por e-mail para clientes inativos
            </li>
            <li class="flex items-center gap-3 text-lg">
              <div
                class="w-6 h-6 rounded-full bg-orange-500 flex items-center justify-center shrink-0"
              >
                <UIcon
                  name="i-lucide-trending-up"
                  class="size-3.5 text-white"
                />
              </div>
              Fidelize Clientes e Aumente a Receita
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
          <p class="text-white/70 text-sm">Cancele quando quiser</p>
        </div>
        <div class="relative flex justify-center lg:justify-end items-end">
          <div class="relative">
            <!-- Desktop mockup -->
            <div class="w-80 sm:w-96 bg-gray-800 rounded-t-xl p-2 shadow-2xl">
              <div class="flex items-center gap-1.5 mb-2 px-1">
                <div class="w-2.5 h-2.5 rounded-full bg-red-400"></div>
                <div class="w-2.5 h-2.5 rounded-full bg-yellow-400"></div>
                <div class="w-2.5 h-2.5 rounded-full bg-green-400"></div>
              </div>
              <!-- App shell -->
              <div class="bg-[#f8f8f5] rounded-lg overflow-hidden h-52">
                <!-- Header -->
                <div
                  class="bg-white h-7 border-b border-gray-100 flex items-center justify-between px-2 shrink-0"
                >
                  <div
                    class="h-3 w-16 rounded-sm"
                    style="background-color: #1d9fb6"
                  ></div>
                  <div
                    class="w-4 h-4 rounded-full flex items-center justify-center text-white text-[5px] font-bold shrink-0"
                    style="background-color: #1d9fb6"
                  >
                    AL
                  </div>
                </div>
                <!-- Body -->
                <div class="flex" style="height: calc(100% - 28px)">
                  <!-- Sidebar -->
                  <div
                    class="w-16 bg-white m-1 mr-0 rounded-xl shadow-sm flex flex-col py-1.5 gap-0.5 shrink-0"
                  >
                    <div
                      class="mx-1 px-1.5 py-1 rounded-lg flex items-center gap-1"
                      style="background-color: #1d9fb6"
                    >
                      <div
                        class="w-2.5 h-2.5 rounded-sm shrink-0"
                        style="background-color: rgba(255, 255, 255, 0.4)"
                      ></div>
                      <div
                        class="h-1.5 rounded flex-1"
                        style="background-color: rgba(255, 255, 255, 0.6)"
                      ></div>
                    </div>
                    <div
                      v-for="i in 5"
                      :key="i"
                      class="mx-1 px-1.5 py-1 rounded-lg flex items-center gap-1"
                    >
                      <div
                        class="w-2.5 h-2.5 rounded-sm bg-gray-200 shrink-0"
                      ></div>
                      <div class="h-1.5 bg-gray-200 rounded flex-1"></div>
                    </div>
                  </div>
                  <!-- Dashboard content -->
                  <div
                    class="flex-1 p-1.5 grid grid-cols-2 gap-1.5 content-start"
                  >
                    <!-- Card Clientes -->
                    <div
                      class="bg-white rounded-xl p-1.5 shadow-sm flex items-center gap-1.5"
                    >
                      <div
                        class="w-6 h-6 rounded-lg shrink-0 flex items-center justify-center"
                        style="background-color: #d5f3f8"
                      >
                        <UIcon
                          name="i-lucide-users"
                          class="size-3"
                          style="color: #1d9fb6"
                        />
                      </div>
                      <div>
                        <div class="text-[6px] text-gray-400">Clientes</div>
                        <div class="text-[9px] font-bold text-gray-700">
                          127
                        </div>
                      </div>
                    </div>
                    <!-- Card Receita -->
                    <div
                      class="bg-white rounded-xl p-1.5 shadow-sm flex items-center gap-1.5"
                    >
                      <div
                        class="w-6 h-6 rounded-lg shrink-0 flex items-center justify-center"
                        style="background-color: #e0fbf4"
                      >
                        <UIcon
                          name="i-lucide-wallet"
                          class="size-3"
                          style="color: #1d9fb6"
                        />
                      </div>
                      <div>
                        <div class="text-[6px] text-gray-400">Receita</div>
                        <div
                          class="text-[9px] font-bold"
                          style="color: #1d9fb6"
                        >
                          R$4.820
                        </div>
                      </div>
                    </div>
                    <!-- Card Pets -->
                    <div
                      class="bg-white rounded-xl p-1.5 shadow-sm flex items-center gap-1.5"
                    >
                      <div
                        class="w-6 h-6 rounded-lg shrink-0 flex items-center justify-center"
                        style="background-color: #ffe0ec"
                      >
                        <UIcon
                          name="i-lucide-paw-print"
                          class="size-3"
                          style="color: #e85a8a"
                        />
                      </div>
                      <div>
                        <div class="text-[6px] text-gray-400">Pets</div>
                        <div class="text-[9px] font-bold text-gray-700">89</div>
                      </div>
                    </div>
                    <!-- Card Agenda -->
                    <div class="bg-white rounded-xl p-1.5 shadow-sm">
                      <div class="text-[6px] text-gray-400 mb-1">
                        Agenda hoje
                      </div>
                      <div class="space-y-0.5">
                        <div
                          class="h-1.5 rounded w-full"
                          style="background-color: #d5f3f8"
                        ></div>
                        <div class="h-1.5 bg-orange-200 rounded w-3/4"></div>
                        <div
                          class="h-1.5 rounded w-full"
                          style="background-color: #d5f3f8"
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div class="bg-gray-700 h-3 w-full rounded-b-xl"></div>
            <div class="bg-gray-600 h-2 w-40 mx-auto rounded-b-lg"></div>
            <!-- Mobile mockup -->
            <div
              class="absolute -right-8 bottom-4 w-24 bg-gray-800 rounded-2xl p-1.5 shadow-2xl border-2 border-gray-700"
            >
              <div class="bg-[#f8f8f5] rounded-xl overflow-hidden h-40">
                <!-- Header mobile -->
                <div
                  class="bg-white h-6 border-b border-gray-100 flex items-center justify-between px-1.5"
                >
                  <div
                    class="h-2.5 w-10 rounded-sm"
                    style="background-color: #1d9fb6"
                  ></div>
                  <div
                    class="w-3.5 h-3.5 rounded-full flex items-center justify-center text-white text-[4px] font-bold shrink-0"
                    style="background-color: #1d9fb6"
                  >
                    AL
                  </div>
                </div>
                <!-- Mobile content -->
                <div class="p-1.5 space-y-1.5">
                  <div class="grid grid-cols-2 gap-1">
                    <div class="bg-white rounded-lg p-1 shadow-sm">
                      <div
                        class="w-4 h-4 rounded-md mb-0.5 flex items-center justify-center"
                        style="background-color: #d5f3f8"
                      >
                        <UIcon
                          name="i-lucide-users"
                          class="size-2.5"
                          style="color: #1d9fb6"
                        />
                      </div>
                      <div class="text-[5px] text-gray-400">Clientes</div>
                      <div class="text-[8px] font-bold text-gray-700">127</div>
                    </div>
                    <div class="bg-white rounded-lg p-1 shadow-sm">
                      <div
                        class="w-4 h-4 rounded-md mb-0.5 flex items-center justify-center"
                        style="background-color: #ffe0ec"
                      >
                        <UIcon
                          name="i-lucide-paw-print"
                          class="size-2.5"
                          style="color: #e85a8a"
                        />
                      </div>
                      <div class="text-[5px] text-gray-400">Pets</div>
                      <div class="text-[8px] font-bold text-gray-700">89</div>
                    </div>
                  </div>
                  <div class="bg-white rounded-lg p-1 shadow-sm">
                    <div class="text-[5px] text-gray-400 mb-0.5">
                      Agenda hoje
                    </div>
                    <div class="space-y-0.5">
                      <div
                        class="h-1.5 rounded w-full"
                        style="background-color: #d5f3f8"
                      ></div>
                      <div class="h-1.5 bg-orange-200 rounded w-3/4"></div>
                    </div>
                  </div>
                  <div class="bg-orange-500 rounded-lg p-1 text-center">
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

    <!-- DEMO VIDEO -->
    <section class="py-16 px-6 bg-gray-50">
      <div class="max-w-4xl mx-auto">
        <div class="text-center mb-10">
          <h2 class="text-3xl font-bold text-gray-900">
            Veja o sistema em ação
          </h2>
          <p class="text-gray-500 mt-2">
            Do cadastro ao agendamento em poucos segundos.
          </p>
        </div>
        <div
          class="rounded-2xl overflow-hidden shadow-2xl border border-gray-200 bg-gray-800"
        >
          <!-- Browser bar -->
          <div class="flex items-center gap-1.5 px-4 py-2.5 bg-gray-800">
            <div class="w-3 h-3 rounded-full bg-red-400"></div>
            <div class="w-3 h-3 rounded-full bg-yellow-400"></div>
            <div class="w-3 h-3 rounded-full bg-green-400"></div>
            <div
              class="ml-3 flex-1 bg-gray-700 rounded-md h-5 flex items-center px-3"
            >
              <span class="text-gray-400 text-xs">aninpet.com.br</span>
            </div>
          </div>
          <video autoplay loop muted playsinline class="w-full block">
            <source src="/demo.mp4" type="video/mp4" />
          </video>
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
          <div
            class="bg-white rounded-3xl shadow-xl p-8 flex flex-col gap-5 border border-gray-100 max-w-xs w-full"
          >
            <AppLogo :size="160" />
            <div class="w-full h-px bg-gray-100"></div>
            <ul class="flex flex-col gap-4">
              <li class="flex items-start gap-3">
                <div
                  class="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
                  style="background-color: #d5f3f8"
                >
                  <UIcon
                    name="i-lucide-calendar-check"
                    class="size-4"
                    style="color: #1d9fb6"
                  />
                </div>
                <div>
                  <p class="text-sm font-semibold text-gray-800">
                    14 dias grátis
                  </p>
                  <p class="text-xs text-gray-400">Teste sem compromisso</p>
                </div>
              </li>
              <li class="flex items-start gap-3">
                <div
                  class="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
                  style="background-color: #e0fbf4"
                >
                  <UIcon
                    name="i-lucide-credit-card"
                    class="size-4"
                    style="color: #1d9fb6"
                  />
                </div>
                <div>
                  <p class="text-sm font-semibold text-gray-800">
                    Pagamento seguro
                  </p>
                  <p class="text-xs text-gray-400">
                    Via Mercado Pago, só paga se quiser continuar
                  </p>
                </div>
              </li>
              <li class="flex items-start gap-3">
                <div
                  class="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
                  style="background-color: #ffe0ec"
                >
                  <UIcon
                    name="i-lucide-headset"
                    class="size-4"
                    style="color: #e85a8a"
                  />
                </div>
                <div>
                  <p class="text-sm font-semibold text-gray-800">
                    Suporte incluso
                  </p>
                  <p class="text-xs text-gray-400">Atendimento via WhatsApp</p>
                </div>
              </li>
              <li class="flex items-start gap-3">
                <div
                  class="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
                  style="background-color: #fef3c7"
                >
                  <UIcon
                    name="i-lucide-x-circle"
                    class="size-4 text-amber-500"
                  />
                </div>
                <div>
                  <p class="text-sm font-semibold text-gray-800">
                    Cancele quando quiser
                  </p>
                  <p class="text-xs text-gray-400">Sem multa, sem burocracia</p>
                </div>
              </li>
            </ul>
          </div>
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
          14 dias de trial gratuito. Cancele quando quiser.
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
          Sem fidelidade. Cancele quando quiser.
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
          © {{ new Date().getFullYear() }} Anin Pet. Todos os direitos
          reservados.
        </p>
        <div class="flex gap-4">
          <NuxtLink to="/login" class="hover:text-white">Entrar</NuxtLink>
          <NuxtLink to="/criar-conta" class="hover:text-white"
            >Criar conta</NuxtLink
          >
        </div>
      </div>
      <div
        class="max-w-6xl mx-auto mt-6 pt-6 border-t border-gray-800 text-center"
      >
        <p class="text-gray-400 text-sm sm:text-base italic">
          "Tudo o que fizerem, façam de todo o coração, como para o Senhor."
          <span class="not-italic font-semibold text-gray-300"
            >— Colossenses 3:23</span
          >
        </p>
      </div>
    </footer>
  </div>
</template>
