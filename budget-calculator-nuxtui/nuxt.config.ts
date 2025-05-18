// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },

  runtimeConfig: {
    public: {
      apiUrl: process.env.NUXT_PUBLIC_API_URL || "http://localhost:3000",
    },
  },

  modules: ["@nuxt/ui", "@nuxt/eslint", "@pinia/nuxt", "nuxt-echarts"],

  css: ["~/assets/css/main.css"],

  echarts: {
    renderer: "svg",
    charts: ["PieChart"],
    components: ["TooltipComponent", "LegendComponent", "TitleComponent"],
  },

  future: {
    compatibilityVersion: 4,
  },

  compatibilityDate: "2024-11-27",
});
