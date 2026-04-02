// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: process.env.NODE_ENV !== "production" },
  modules: ["@nuxt/ui", "@pinia/nuxt"],
  app: {
    head: {
      titleTemplate: "%s — AninPet",
      htmlAttrs: { lang: "pt-BR" },
      link: [{ rel: "icon", type: "image/png", href: "/anninLogo.png" }],
      meta: [{ name: "theme-color", content: "#1d9fb6" }],
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
