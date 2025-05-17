<script setup lang="ts">
// Store logic
import type { User, BudgetList } from "@/types";
const store = useEntryStore();

/*const testIncomes = [
  {
    title: "My job",
    amount: 2400,
  },
  {
    title: "Side hustle",
    amount: 500,
  },
];
const testExpenses = [
  {
    title: "Car",
    amount: 270,
    importance: "High",
  },
  {
    title: "Electric",
    amount: 190,
    importance: "High",
  },
  {
    title: "Spotify",
    amount: 5,
    importance: "Low",
  },
  {
    title: "Car wash subscription",
    amount: 20,
    importance: "Medium",
  },
  {
    title: "Alcohol",
    amount: 40,
    importance: "Low",
  },
  {
    title: "Smart Watch",
    amount: 8,
    importance: "Medium",
  },
];*/

const total = computed(() => {
  let net: number = 0;

  store.incomeList.forEach((income) => {
    net += income.amount;
  });

  store.expenseList.forEach((expense) => {
    net -= expense.amount;
  });

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(net);
});

const incomeShown = ref(false);

const isLoggedIn = ref(false);

// Checking if user is logged in and fetching budget list data
async function checkLogin() {
  try {
    const res = await $fetch<{
      authenticated: boolean;
      user?: User["user"];
      budgetList: BudgetList;
    }>("http://localhost:4000/api/auth-check", {
      credentials: "include",
    });
    if (res.authenticated && res.user) {
      store.incomeList = res.budgetList.incomeList;
      store.expenseList = res.budgetList.expenseList;
      isLoggedIn.value = true;
      console.log(res);
    }
  } catch (e: unknown) {
    const error = e as {
      data?: { error: string };
      statusCode?: number;
      message: string;
    };
    if (error.statusCode !== 401) {
      console.error("Login check failed:", error.data?.error || error.message);
    }
  }
}

// Saving budgetlist to the database
async function saveBudgetList() {
  try {
    const res = await $fetch("http://localhost:4000/api/save-budget", {
      method: "PUT",
      body: {
        budgetList: {
          incomeList: store.incomeList,
          expenseList: store.expenseList,
        },
      },
      credentials: "include",
    });
    console.log(res);
  } catch (e: unknown) {
    const error = e as {
      data?: { error: string };
      statusCode?: number;
      message: string;
    };
    if (error.statusCode !== 401) {
      console.error("Login check failed:", error.data?.error || error.message);
    }
  }
}

async function logUserOut() {
  try {
    const res = await $fetch("http://localhost:4000/api/logout", {
      method: "POST",
      credentials: "include",
    });
    console.log(res);
    store.incomeList = [];
    store.expenseList = [];
    isLoggedIn.value = false;
  } catch (e: unknown) {
    const error = e as {
      data?: { error: string };
      statusCode?: number;
      message: string;
    };
    if (error.statusCode !== 401) {
      console.error("Login check failed:", error.data?.error || error.message);
    }
  }
}

checkLogin();
</script>

<template>
  <UApp>
    <div class="">
      <header class="flex bg-gray-200 justify-between p-2">
        <h1 class="p-4 text-3xl bg-gray-200">Budget calculator</h1>
        <JLoginButton v-if="!isLoggedIn" @logged-in="isLoggedIn = true" />
        <UButton v-if="isLoggedIn" label="Log out" @click="logUserOut" />
      </header>

      <!-- Doughnut chart -->
      <div class="flex flex-col p-2 justify-center">
        <UButton
          class="h-auto w-min btn-primary text-2xl"
          :label="'Toggle chart'"
          @click="incomeShown = !incomeShown" />
        <div class="flex justify-center">
          <JChart
            :chart-data="incomeShown ? store.incomeList : store.expenseList"
            :income-shown="incomeShown" />
        </div>
      </div>

      <!-- Net amount display -->
      <div class="lg:flex lg:justify-center lg:gap-4 lg:my-5">
        <h2 class="text-2xl md:text-3xl p-4 lg:p-0">
          Net gain/loss {{ total }}
        </h2>
        <UButton
          v-if="isLoggedIn"
          class="text-xl"
          label="Save Budget"
          @click="saveBudgetList" />
        <UButton
          v-if="!isLoggedIn"
          label="Log in to save your budget"
          disabled />
      </div>

      <!-- Parent div container for tables -->
      <div class="md:flex md:justify-between md:gap-4 mx-2 lg:px-10 lg:mt-10">
        <JMoneyContainer type="Incomes (monthly)" class="md:w-1/2" />
        <JMoneyContainer
          is-expense
          type="Expenses (monthly)"
          class="md:w-1/2" />
      </div>
    </div>
  </UApp>
</template>
