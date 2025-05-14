<script setup lang="ts">
import type { Entry } from "@/types";
import type { FormError, FormSubmitEvent } from "@nuxt/ui";

const { addingEntry, isExpense } = defineProps<{
  addingEntry: boolean;
  isExpense: boolean;
}>();

const state = reactive<Entry>({
  title: "",
  amount: 0,
  importance: undefined,
});

const validate = (state: Entry): FormError[] => {
  const errors = [];
  if (!state.title) errors.push({ name: "name", message: "Required" });
  if (!state.amount) errors.push({ name: "amount", message: "Required" });
  if (!state.importance && isExpense)
    errors.push({ name: "importance", message: "Required" });
  return errors;
};

const store = useEntryStore();
const toast = useToast();

function onSubmit(event: FormSubmitEvent<Entry>) {
  const isDuplicate = [...store.incomeList, ...store.expenseList].some(
    (entry) => entry.title.toLowerCase() === event.data.title.toLowerCase()
  );

  if (!isDuplicate) {
    store.addNewEntry(event.data, isExpense);
  } else {
    toast.add({ title: "Cannot submit identical names" });
  }
  state.title = "";
  state.amount = 0;
  state.importance = undefined;
}

const importanceOptions = ref<string[]>(["High", "Medium", "Low"]);

// TODO
// Move v-if outside of this component
</script>

<template>
  <UForm
    v-if="addingEntry"
    :validate="validate"
    :state="state"
    @submit="onSubmit">
    <UFormField label="Name" name="name">
      <UInput v-model="state.title" class="w-75" />
    </UFormField>

    <UFormField label="Amount" name="amount">
      <UInput v-model="state.amount" type="number" class="w-75" />
    </UFormField>

    <UFormField v-if="isExpense" label="Importance" name="importance">
      <USelect
        v-model="state.importance"
        :items="importanceOptions"
        type="importance"
        placeholder="High" />
    </UFormField>

    <UButton class="mt-3 btn-primary" type="submit">Submit</UButton>
  </UForm>
</template>
