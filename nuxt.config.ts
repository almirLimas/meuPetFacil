// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: process.env.NODE_ENV !== "production" },
  modules: ["@nuxt/ui", "@pinia/nuxt"],
  app: {
    head: {
      htmlAttrs: { lang: "pt-BR" },
      link: [
        { rel: "icon", type: "image/png", href: "/logo_aninpet.png" },
        { rel: "canonical", href: "https://www.aninpet.com.br" },
      ],
      meta: [{ name: "theme-color", content: "#1d9fb6" }],
      script: [
        {
          src: "https://www.googletagmanager.com/gtag/js?id=AW-18059774716",
          async: true,
        },
        {
          innerHTML: `window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', 'AW-18059774716');`,
        },
      ],
    },
  },
  colorMode: {
    preference: "light",
  },
  css: ["~/assets/css/main.css"],
  pinia: {
    storesDirs: ["./app/stores/**"],
  },
  runtimeConfig: {
    public: {
      apiUrl: process.env.NUXT_PUBLIC_API_URL ?? "http://localhost:3001",
    },
  },
});
