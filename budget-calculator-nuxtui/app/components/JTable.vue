<script setup lang="ts">
import type { Entry } from "@/types";
import type { TableColumn } from "@nuxt/ui";
import type { Column, Row } from "@tanstack/vue-table";
const UBadge = resolveComponent("UBadge");
const UButton = resolveComponent("UButton");
const UDropdownMenu = resolveComponent("UDropdownMenu");

const { isExpense } = defineProps<{
  isExpense: boolean;
}>();

// Store logic
const store = useEntryStore();
const entryList = computed(() => {
  return isExpense ? store.expenseList : store.incomeList;
});

// Table logic

function createHeaderSorting(column: Column<Entry>, label: string) {
  const isSorted = column.getIsSorted();

  return h(UButton, {
    color: "neutral",
    variant: "ghost",
    label: label,
    icon: isSorted
      ? isSorted === "asc"
        ? "i-lucide-arrow-up-narrow-wide"
        : "i-lucide-arrow-down-wide-narrow"
      : "i-lucide-arrow-up-down",
    class: "-mx-3.5 text-xl",
    onClick: () => column.toggleSorting(column.getIsSorted() === "asc"),
  });
}

function getRowItems(row: Row<Entry>) {
  return [
    {
      type: "label",
      label: "Actions",
    },
    {
      label: "Delete",
      onSelect() {
        store.removeEntry(row.getValue("title"), isExpense);
      },
    },
  ];
}

const columns = computed<TableColumn<Entry>[]>(() => {
  const _columns: TableColumn<Entry>[] = [
    {
      accessorKey: "title",
      header: ({ column }) => createHeaderSorting(column, "Name"),
      meta: { class: { td: "max-w-[25px] truncate md:text-lg" } },
    },
    {
      accessorKey: "amount",
      header: ({ column }) => createHeaderSorting(column, "Amount"),
      cell: ({ row }) => {
        const amount = Number.parseFloat(row.getValue("amount"));

        const formatted = new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD",
        }).format(amount);

        return h("div", { class: "font-medium md:text-lg" }, formatted);
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        return h(
          "div",
          { class: "text-right" },
          h(
            UDropdownMenu,
            {
              content: {
                align: "end",
              },
              items: getRowItems(row),
              "aria-label": "Actions dropdown",
            },
            () =>
              h(UButton, {
                icon: "i-lucide-ellipsis-vertical",
                color: "neutral",
                variant: "ghost",
                class: "ml-auto",
                "aria-label": "Actions dropdown",
              })
          )
        );
      },
    },
  ];
  if (isExpense) {
    _columns.splice(_columns.length - 1, 0, {
      accessorKey: "importance",
      header: ({ column }) => createHeaderSorting(column, "Imptc."),
      cell: ({ row }) => {
        const color = {
          High: "error" as const,
          Medium: "warning" as const,
          Low: "neutral" as const,
        }[row.getValue("importance") as string];

        return h(
          UBadge,
          {
            class: "capitalize",
            variant: "subtle",
            size: "xl",
            color,
          },
          () => row.getValue("importance")
        );
      },
    });
  }
  return _columns;
});
</script>

<template>
  <UTable
    sticky
    :data="entryList"
    :columns="columns"
    class="flex-1 max-h-[300px]" />
</template>
