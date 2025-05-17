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

  function removeEntry(entryTitle: string, isExpense: boolean) {
    if (isExpense) {
      expenseList.value = expenseList.value.filter(
        (entry) => entry.title !== entryTitle
      );
    } else {
      incomeList.value = incomeList.value.filter(
        (entry) => entry.title !== entryTitle
      );
    }
  }

  return { incomeList, expenseList, addNewEntry, removeEntry };
});
