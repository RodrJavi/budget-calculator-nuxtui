<script setup lang="ts">
import type { Entry } from "@/types";

const { type, isExpense } = defineProps<{
  type: string;
  isExpense?: boolean;
}>();

// Store logic
const store = useEntryStore();
const entryList = computed(() =>
  isExpense ? store.expenseList : store.incomeList
);

const calculateTotal = (entries: Entry[]): string => {
  let total: number = 0;

  entries.forEach((entry) => {
    total += entry.amount;
  });

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(total);
};

// Form logic
const addingEntry = ref(false);
</script>

<template>
  <UCard class="text-2xl">
    <template #header>
      <div class="flex justify-between">
        {{ type + " " + calculateTotal(entryList) }}
        <UButton
          :trailing-icon="
            addingEntry
              ? 'streamline:subtract-1-solid'
              : 'streamline:add-1-solid'
          "
          class="btn-primary md:p-3"
          @click="addingEntry = !addingEntry" />
      </div>
    </template>

    <JForm :adding-entry :is-expense />

    <JTable :is-expense
  /></UCard>
</template>
