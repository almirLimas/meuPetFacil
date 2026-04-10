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
    icone: "i-lucide-shopping-cart",
    titulo: "Ponto de Venda (PDV)",
    descricao:
      "Registre vendas no balcão com suporte a leitor de código de barras, múltiplas formas de pagamento e troco automático.",
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
      "Avaliação automática após cada atendimento",
      "Painel de satisfação dos clientes (nota média e % satisfeitos)",
      "Relatório mensal enviado por e-mail",
      "Meta mensal com acompanhamento",
    ],
  },
];

// ─── Typewriter ────────────────────────────────────────────────────────────────
const phrases = [
  "simples assim.",
  "do jeito certo.",
  "sem papel, sem bagunça.",
  "com mais faturamento.",
];
const typedText = ref("");

onMounted(() => {
  let phraseIdx = 0;
  let charIdx = 0;
  let deleting = false;

  const tick = () => {
    const current = phrases[phraseIdx]!;
    if (!deleting) {
      charIdx++;
      typedText.value = current.slice(0, charIdx);
      if (charIdx === current.length) {
        deleting = true;
        setTimeout(tick, 1800);
        return;
      }
    } else {
      charIdx--;
      typedText.value = current.slice(0, charIdx);
      if (charIdx === 0) {
        deleting = false;
        phraseIdx = (phraseIdx + 1) % phrases.length;
        setTimeout(tick, 400);
        return;
      }
    }
    setTimeout(tick, deleting ? 45 : 80);
  };

  tick();
});
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
          <a href="#preview" class="hover:text-sky-500 transition-colors"
            >Preview</a
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
            Simples, intuitivo e pronto<br />
            <span class="text-orange-300">para o seu dia a dia.</span>
          </h1>
          <ul class="flex flex-col gap-3">
            <li class="flex items-center gap-3 text-lg">
              <div
                class="w-6 h-6 rounded-full bg-orange-500 flex items-center justify-center shrink-0"
              >
                <UIcon
                  name="i-lucide-shopping-cart"
                  class="size-3.5 text-white"
                />
              </div>
              Ponto de Venda com leitor de código de barras
            </li>
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
            <li class="flex items-center gap-3 text-lg">
              <div
                class="w-6 h-6 rounded-full bg-orange-500 flex items-center justify-center shrink-0"
              >
                <UIcon name="i-lucide-star" class="size-3.5 text-white" />
              </div>
              Avaliação automática dos clientes após cada atendimento
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
            Tudo que o sistema oferece
          </h2>
          <p class="text-gray-500 mt-2">
            Cada funcionalidade pensada para o seu petshop.
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

    <!-- DESTAQUE PLUS: SATISFAÇÃO -->
    <section class="py-20 px-6 bg-white">
      <div class="max-w-5xl mx-auto">
        <div
          class="relative overflow-hidden rounded-3xl bg-gradient-to-br from-orange-500 to-orange-400 px-8 py-12 md:py-16 md:px-14 flex flex-col md:flex-row items-center gap-10 shadow-xl"
        >
          <!-- Pata decorativa -->
          <UIcon
            name="i-lucide-paw-print"
            class="absolute top-5 right-10 size-24 text-white/10 rotate-12 hidden md:block"
          />
          <UIcon
            name="i-lucide-paw-print"
            class="absolute bottom-4 left-6 size-14 text-white/10 -rotate-12"
          />

          <!-- Texto -->
          <div class="relative flex flex-col gap-5 text-white flex-1">
            <div
              class="inline-flex items-center gap-2 self-start px-3 py-1 rounded-full bg-white/20 text-xs font-bold uppercase tracking-wide"
            >
              <UIcon name="i-lucide-star" class="size-3.5" />
              Exclusivo no Plano Plus
            </div>
            <h2 class="text-3xl sm:text-4xl font-extrabold leading-tight">
              Saiba o que seus clientes<br />
              pensam — <span class="text-yellow-200">sem perguntar</span>
            </h2>
            <p class="text-white/85 text-base leading-relaxed max-w-lg">
              Após cada atendimento concluído, o cliente recebe um e-mail com
              emojis para avaliar a experiência. Você acompanha a nota média, o
              índice de satisfação e cada avaliação individualmente — tudo no
              painel.
            </p>
            <ul class="flex flex-col gap-2">
              <li class="flex items-center gap-2 text-sm">
                <div
                  class="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center shrink-0"
                >
                  <UIcon name="i-lucide-send" class="size-3" />
                </div>
                E-mail automático com emojis enviado ao cliente
              </li>
              <li class="flex items-center gap-2 text-sm">
                <div
                  class="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center shrink-0"
                >
                  <UIcon name="i-lucide-bar-chart-2" class="size-3" />
                </div>
                Nota média e % de clientes satisfeitos no painel
              </li>
              <li class="flex items-center gap-2 text-sm">
                <div
                  class="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center shrink-0"
                >
                  <UIcon name="i-lucide-clock" class="size-3" />
                </div>
                Zero trabalho manual — funciona no piloto automático
              </li>
            </ul>
            <NuxtLink
              to="/criar-conta?plano=plus"
              class="self-start inline-flex items-center gap-2 px-7 py-3 rounded-xl bg-white text-orange-500 font-bold text-sm shadow-md hover:bg-orange-50 transition-colors mt-2"
            >
              Quero o Plus
              <UIcon name="i-lucide-arrow-right" class="size-4" />
            </NuxtLink>
          </div>

          <!-- Card mockup de avaliação -->
          <div class="relative shrink-0 w-full max-w-xs">
            <div
              class="bg-white rounded-2xl shadow-2xl p-5 flex flex-col gap-4"
            >
              <!-- Header do card -->
              <div class="flex items-center justify-between">
                <p
                  class="text-xs font-semibold text-gray-500 uppercase tracking-wide"
                >
                  Satisfação dos Clientes
                </p>
                <span class="text-xs text-sky-500 font-semibold cursor-pointer"
                  >Ver detalhes &rsaquo;</span
                >
              </div>
              <!-- Percentual + barra -->
              <div class="flex items-center gap-3">
                <span class="text-4xl font-black text-emerald-500">80%</span>
                <div class="flex-1">
                  <div class="h-3 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      class="h-3 rounded-full bg-emerald-400"
                      style="width: 80%"
                    ></div>
                  </div>
                  <p class="text-[10px] text-gray-400 mt-1">
                    Média 4.4 &nbsp;·&nbsp; 5 avaliações
                  </p>
                </div>
              </div>
              <!-- Mini lista de avaliações -->
              <div class="flex flex-col gap-1.5">
                <div
                  v-for="(av, i) in [
                    {
                      nome: 'Almir lima',
                      nota: 5,
                      servico: 'Banho e tosa — Viny',
                    },
                    {
                      nome: 'Maria Izidorio',
                      nota: 4,
                      servico: 'Banho — Bidu',
                    },
                    { nome: 'Almir lima', nota: 5, servico: 'Banho — Viny' },
                  ]"
                  :key="i"
                  class="flex items-center gap-2 py-1.5 border-b border-gray-50 last:border-0"
                >
                  <div class="flex gap-0.5">
                    <span
                      v-for="s in 5"
                      :key="s"
                      class="text-xs"
                      :class="
                        s <= av.nota ? 'text-yellow-400' : 'text-gray-200'
                      "
                      >★</span
                    >
                  </div>
                  <div class="flex-1 min-w-0">
                    <p class="text-[11px] font-semibold text-gray-700 truncate">
                      {{ av.nome }}
                    </p>
                    <p class="text-[10px] text-gray-400 truncate">
                      {{ av.servico }}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- PDV SHOWCASE -->
    <section class="pdv-section py-20 px-6 overflow-hidden">
      <!-- decorative blobs -->
      <div class="pdv-blob pdv-blob--1"></div>
      <div class="pdv-blob pdv-blob--2"></div>

      <div
        class="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10"
      >
        <!-- Left: copy -->
        <div class="flex flex-col gap-6">
          <div
            class="inline-flex items-center gap-2 bg-orange-100 text-orange-600 text-xs font-bold px-3 py-1.5 rounded-full w-fit"
          >
            <UIcon name="i-lucide-shopping-cart" class="size-3.5" />
            Ponto de Venda
          </div>
          <h2
            class="text-3xl sm:text-4xl font-extrabold text-gray-900 leading-tight"
          >
            Feche vendas em segundos,<br />
            <span style="color: #1d9fb6">sem complicação.</span>
          </h2>
          <p class="text-gray-500 text-lg leading-relaxed">
            Busque produtos pelo nome ou código de barras, adicione serviços ao
            carrinho e finalize com qualquer forma de pagamento — tudo em uma
            tela só.
          </p>
          <ul class="flex flex-col gap-3">
            <li class="flex items-center gap-3 text-gray-700">
              <div
                class="w-8 h-8 rounded-xl bg-sky-50 flex items-center justify-center shrink-0"
              >
                <UIcon name="i-lucide-barcode" class="size-4 text-sky-500" />
              </div>
              <span class="text-sm font-medium"
                >Leitor de código de barras integrado</span
              >
            </li>
            <li class="flex items-center gap-3 text-gray-700">
              <div
                class="w-8 h-8 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0"
              >
                <UIcon
                  name="i-lucide-credit-card"
                  class="size-4 text-emerald-500"
                />
              </div>
              <span class="text-sm font-medium"
                >Dinheiro, Cartão, PIX e mais</span
              >
            </li>
            <li class="flex items-center gap-3 text-gray-700">
              <div
                class="w-8 h-8 rounded-xl bg-orange-50 flex items-center justify-center shrink-0"
              >
                <UIcon name="i-lucide-package" class="size-4 text-orange-500" />
              </div>
              <span class="text-sm font-medium"
                >Estoque atualizado automaticamente</span
              >
            </li>
            <li class="flex items-center gap-3 text-gray-700">
              <div
                class="w-8 h-8 rounded-xl bg-purple-50 flex items-center justify-center shrink-0"
              >
                <UIcon
                  name="i-lucide-scissors"
                  class="size-4 text-purple-500"
                />
              </div>
              <span class="text-sm font-medium"
                >Produtos e serviços no mesmo carrinho</span
              >
            </li>
          </ul>
        </div>

        <!-- Right: illustrated PDV mockup -->
        <div class="pdv-mockup-wrap">
          <!-- floating badges -->
          <div class="pdv-float-badge pdv-float-badge--sale">
            <span class="text-lg">✅</span>
            <div>
              <p class="text-[10px] text-gray-500 leading-none">
                Venda concluída
              </p>
              <p class="text-xs font-bold text-gray-800">R$ 87,00</p>
            </div>
          </div>
          <div class="pdv-float-badge pdv-float-badge--change">
            <span class="text-lg">💸</span>
            <div>
              <p class="text-[10px] text-gray-500 leading-none">Troco</p>
              <p class="text-xs font-bold text-emerald-600">R$ 13,00</p>
            </div>
          </div>

          <!-- PDV card -->
          <div class="pdv-card">
            <!-- header -->
            <div class="pdv-card__header">
              <UIcon name="i-lucide-shopping-cart" class="size-4 text-white" />
              <span>Carrinho</span>
              <span class="pdv-card__pill">3 itens</span>
            </div>

            <!-- items -->
            <div class="pdv-card__body">
              <!-- item 1 -->
              <div class="pdv-item">
                <div class="pdv-item__icon" style="background: #fef3c7">
                  <span class="text-base">🐾</span>
                </div>
                <div class="pdv-item__info">
                  <p class="pdv-item__name">Banho & Tosa</p>
                  <p class="pdv-item__sub">Serviço · R$ 45,00</p>
                </div>
                <div class="pdv-item__qty">
                  <button class="pdv-qty-btn">−</button>
                  <span>1</span>
                  <button class="pdv-qty-btn">+</button>
                </div>
                <p class="pdv-item__total">R$ 45,00</p>
              </div>
              <!-- item 2 -->
              <div class="pdv-item">
                <div class="pdv-item__icon" style="background: #dbeafe">
                  <span class="text-base">🧴</span>
                </div>
                <div class="pdv-item__info">
                  <p class="pdv-item__name">Shampoo Pet 500ml</p>
                  <p class="pdv-item__sub">Produto · R$ 28,00</p>
                </div>
                <div class="pdv-item__qty">
                  <button class="pdv-qty-btn">−</button>
                  <span>1</span>
                  <button class="pdv-qty-btn">+</button>
                </div>
                <p class="pdv-item__total">R$ 28,00</p>
              </div>
              <!-- item 3 -->
              <div class="pdv-item">
                <div class="pdv-item__icon" style="background: #dcfce7">
                  <span class="text-base">🦴</span>
                </div>
                <div class="pdv-item__info">
                  <p class="pdv-item__name">Petisco Natural</p>
                  <p class="pdv-item__sub">Produto · R$ 14,00</p>
                </div>
                <div class="pdv-item__qty">
                  <button class="pdv-qty-btn">−</button>
                  <span>1</span>
                  <button class="pdv-qty-btn">+</button>
                </div>
                <p class="pdv-item__total">R$ 14,00</p>
              </div>
            </div>

            <!-- totals -->
            <div class="pdv-card__totals">
              <div class="pdv-total-row">
                <span class="text-gray-500">Subtotal</span>
                <span class="text-gray-700 font-medium">R$ 87,00</span>
              </div>
              <div class="pdv-total-row pdv-total-row--big">
                <span>Total</span>
                <span style="color: #1d9fb6">R$ 87,00</span>
              </div>
            </div>

            <!-- payment -->
            <div class="pdv-card__payment">
              <button class="pdv-pay-btn pdv-pay-btn--active">
                💵 Dinheiro
              </button>
              <button class="pdv-pay-btn">💳 Cartão</button>
              <button class="pdv-pay-btn">⚡ PIX</button>
            </div>

            <!-- confirm -->
            <button class="pdv-confirm-btn">
              <UIcon name="i-lucide-check" class="size-4" />
              Confirmar Venda
            </button>
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
                  <p class="text-xs text-gray-400">
                    Primeira cobrança após 14 dias
                  </p>
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
            14 dias grátis. Primeira cobrança só após o período de teste.
          </p>
          <p class="text-sm text-gray-400 mt-1">
            Todos os planos incluem suporte via WhatsApp.
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

<style scoped>
.typewriter-cursor {
  display: inline-block;
  font-weight: 300;
  animation: blink 0.7s step-end infinite;
}

@keyframes blink {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0;
  }
}

/* ── PDV Showcase section ── */
.pdv-section {
  background: linear-gradient(135deg, #f0fdff 0%, #fff7ed 60%, #f0fdf4 100%);
  position: relative;
}

.pdv-blob {
  position: absolute;
  border-radius: 9999px;
  filter: blur(70px);
  pointer-events: none;
  opacity: 0.45;
}
.pdv-blob--1 {
  width: 380px;
  height: 380px;
  background: #bae6fd;
  top: -80px;
  left: -80px;
}
.pdv-blob--2 {
  width: 300px;
  height: 300px;
  background: #fed7aa;
  bottom: -60px;
  right: -40px;
}

/* wrap */
.pdv-mockup-wrap {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* floating badges */
.pdv-float-badge {
  position: absolute;
  z-index: 2;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: #fff;
  border-radius: 1rem;
  padding: 0.5rem 0.85rem;
  box-shadow: 0 8px 28px rgba(0, 0, 0, 0.12);
  white-space: nowrap;
}
.pdv-float-badge--sale {
  top: -1rem;
  right: -0.5rem;
  animation: pdvFloat1 4s ease-in-out infinite;
}
.pdv-float-badge--change {
  bottom: -1rem;
  left: -0.5rem;
  animation: pdvFloat2 5s ease-in-out infinite;
}
@keyframes pdvFloat1 {
  0%,
  100% {
    transform: translateY(0) rotate(2deg);
  }
  50% {
    transform: translateY(-8px) rotate(2deg);
  }
}
@keyframes pdvFloat2 {
  0%,
  100% {
    transform: translateY(0) rotate(-1.5deg);
  }
  50% {
    transform: translateY(-6px) rotate(-1.5deg);
  }
}

/* main card */
.pdv-card {
  width: 100%;
  max-width: 22rem;
  background: #fff;
  border-radius: 1.5rem;
  box-shadow:
    0 30px 80px rgba(0, 0, 0, 0.12),
    0 0 0 1.5px rgba(29, 159, 182, 0.15);
  overflow: hidden;
  transform: perspective(900px) rotateY(-4deg) rotateX(2deg);
  transition: transform 0.4s ease;
}
.pdv-card:hover {
  transform: perspective(900px) rotateY(0deg) rotateX(0deg);
}

.pdv-card__header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.9rem 1.1rem;
  background: linear-gradient(90deg, #1d9fb6, #0ea5c9);
  color: #fff;
  font-weight: 700;
  font-size: 0.875rem;
}
.pdv-card__pill {
  margin-left: auto;
  background: rgba(255, 255, 255, 0.22);
  border-radius: 9999px;
  padding: 0.15rem 0.6rem;
  font-size: 0.7rem;
  font-weight: 600;
}

.pdv-card__body {
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
  padding: 0.6rem 0.75rem;
}

.pdv-item {
  display: flex;
  align-items: center;
  gap: 0.7rem;
  background: #f9fafb;
  border-radius: 0.85rem;
  padding: 0.55rem 0.7rem;
}
.pdv-item__icon {
  width: 2.2rem;
  height: 2.2rem;
  border-radius: 0.65rem;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  font-size: 1rem;
}
.pdv-item__info {
  flex: 1;
  min-width: 0;
}
.pdv-item__name {
  font-size: 0.72rem;
  font-weight: 600;
  color: #1f2937;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.pdv-item__sub {
  font-size: 0.6rem;
  color: #9ca3af;
}
.pdv-item__qty {
  display: flex;
  align-items: center;
  gap: 0.3rem;
  font-size: 0.72rem;
  font-weight: 700;
  color: #374151;
}
.pdv-qty-btn {
  width: 1.3rem;
  height: 1.3rem;
  border-radius: 0.4rem;
  background: #e5e7eb;
  font-size: 0.85rem;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: default;
}
.pdv-item__total {
  font-size: 0.72rem;
  font-weight: 700;
  color: #1d9fb6;
  white-space: nowrap;
}

.pdv-card__totals {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  padding: 0.7rem 1.1rem;
  border-top: 1.5px dashed #e5e7eb;
}
.pdv-total-row {
  display: flex;
  justify-content: space-between;
  font-size: 0.75rem;
}
.pdv-total-row--big {
  font-size: 1rem;
  font-weight: 800;
}

.pdv-card__payment {
  display: flex;
  gap: 0.4rem;
  padding: 0 1.1rem 0.6rem;
}
.pdv-pay-btn {
  flex: 1;
  padding: 0.35rem 0;
  border-radius: 0.6rem;
  font-size: 0.65rem;
  font-weight: 700;
  background: #f3f4f6;
  color: #6b7280;
  border: 1.5px solid transparent;
  cursor: default;
}
.pdv-pay-btn--active {
  background: #e0f9ff;
  color: #0e7490;
  border-color: #1d9fb6;
}

.pdv-confirm-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  width: calc(100% - 2.2rem);
  margin: 0 1.1rem 1rem;
  padding: 0.7rem;
  border-radius: 0.85rem;
  background: linear-gradient(90deg, #f97316, #fb923c);
  color: #fff;
  font-weight: 800;
  font-size: 0.85rem;
  box-shadow: 0 4px 14px rgba(249, 115, 22, 0.4);
  cursor: default;
}

.hero-screenshot-wrap {
  position: relative;
  display: flex;
  flex-direction: column;
  animation: heroFloat 4s ease-in-out infinite;
}

@keyframes heroFloat {
  0%,
  100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-10px);
  }
}

/* Glow behind the browser */
.hero-glow {
  position: absolute;
  inset: -20px;
  border-radius: 2rem;
  background: radial-gradient(
    ellipse at center,
    rgba(29, 159, 182, 0.45) 0%,
    rgba(245, 130, 32, 0.18) 55%,
    transparent 80%
  );
  filter: blur(28px);
  z-index: 0;
  pointer-events: none;
}

/* Browser chrome */
.hero-browser {
  position: relative;
  z-index: 1;
  width: 22rem;
  background: #1e1e2e;
  border-radius: 0.75rem 0.75rem 0 0;
  overflow: hidden;
  box-shadow:
    0 25px 60px rgba(0, 0, 0, 0.45),
    0 0 0 1px rgba(255, 255, 255, 0.07);
}

@media (min-width: 640px) {
  .hero-browser {
    width: 28rem;
  }
}

.hero-browser__bar {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.45rem 0.75rem;
  background: #2a2a3e;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}

.hero-dot {
  display: inline-block;
  width: 0.6rem;
  height: 0.6rem;
  border-radius: 9999px;
}

.hero-browser__url {
  flex: 1;
  margin-left: 0.5rem;
  background: rgba(255, 255, 255, 0.07);
  border-radius: 0.35rem;
  padding: 0.15rem 0.6rem;
  font-size: 0.55rem;
  color: rgba(255, 255, 255, 0.5);
  display: flex;
  align-items: center;
  gap: 0.3rem;
  max-width: 14rem;
}

.hero-browser__screen {
  width: 100%;
  height: 14rem;
  overflow: hidden;
}

@media (min-width: 640px) {
  .hero-browser__screen {
    height: 17rem;
  }
}

/* Floating stat badges */
.hero-badge {
  position: absolute;
  z-index: 2;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(8px);
  border-radius: 0.9rem;
  padding: 0.5rem 0.75rem;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  white-space: nowrap;
}

.hero-badge--clients {
  top: 3.5rem;
  left: -3.5rem;
  animation: badgeFloat1 5s ease-in-out infinite;
}

.hero-badge--revenue {
  bottom: 4rem;
  left: -3rem;
  animation: badgeFloat2 5.5s ease-in-out infinite;
}

.hero-badge--rating {
  top: 1rem;
  right: -3rem;
  animation: badgeFloat3 4.5s ease-in-out infinite;
}

@keyframes badgeFloat1 {
  0%,
  100% {
    transform: translateY(0px) rotate(-1deg);
  }
  50% {
    transform: translateY(-6px) rotate(-1deg);
  }
}
@keyframes badgeFloat2 {
  0%,
  100% {
    transform: translateY(0px) rotate(1.5deg);
  }
  50% {
    transform: translateY(-8px) rotate(1.5deg);
  }
}
@keyframes badgeFloat3 {
  0%,
  100% {
    transform: translateY(0px) rotate(-0.5deg);
  }
  50% {
    transform: translateY(-5px) rotate(-0.5deg);
  }
}

.hero-badge__icon {
  width: 1.8rem;
  height: 1.8rem;
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.hero-badge__label {
  font-size: 0.6rem;
  color: #6b7280;
  line-height: 1;
  margin-bottom: 0.1rem;
}

.hero-badge__value {
  font-size: 0.85rem;
  font-weight: 700;
  color: #111827;
  line-height: 1;
}
</style>
