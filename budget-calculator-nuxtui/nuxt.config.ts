// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },

  modules: ["@nuxt/ui", "@nuxt/eslint", "@pinia/nuxt", "nuxt-echarts"],

  css: ["~/assets/css/main.css"],

  echarts: {
    renderer: "svg",
    charts: ["PieChart"],
    components: ["TooltipComponent", "LegendComponent"],
  },

  future: {
    compatibilityVersion: 4,
  },

  compatibilityDate: "2024-11-27",
});
