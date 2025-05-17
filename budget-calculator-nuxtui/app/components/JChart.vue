<script setup lang="ts">
import type { Entry } from "@/types";

const { chartData, incomeShown } = defineProps<{
  chartData: Entry[];
  incomeShown: boolean;
}>();

const option = computed(() => {
  return {
    title: {
      text: incomeShown ? "Income" : "Expenses",
      left: "center",
      top: "top",
      textStyle: {
        fontSize: 25,
        fontWeight: "bold",
        color: "#333",
      },
    },
    tooltip: { trigger: "item" },
    series: [
      {
        type: "pie",
        radius: ["40%", "70%"],
        avoidLabelOverlap: false,
        label: {
          show: true,
          color: "#000",
          fontSize: "30",
          position: "center",
          formatter: () => {
            let sum = 0;
            chartData.forEach((value) => {
              sum += value.amount;
            });
            return new Intl.NumberFormat("en-US", {
              style: "currency",
              currency: "USD",
            }).format(sum);
          },
        },
        lLine: { show: false },
        data: chartData.map((item) => ({
          name: item.title,
          value: item.amount,
        })),
      },
    ],
  };
});
</script>

<template>
  <div class="w-100 h-100 flex justify-center align-middle">
    <VChart :option="option" />
  </div>
</template>
