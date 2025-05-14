import type { Entry } from "@/types";

export const useEntryStore = defineStore("entries", () => {
  const incomeList = ref<Entry[]>([]);
  const expenseList = ref<Entry[]>([]);

  function addNewEntry(newEntry: Entry, isExpense: boolean) {
    const entryCopy = { ...newEntry };

    if (isExpense) {
      expenseList.value.push(entryCopy);
    } else {
      incomeList.value.push(entryCopy);
    }
  }

  return { incomeList, expenseList, addNewEntry };
});
