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

// Login form logic
const loginOpen = ref(false);
const loginFailed = ref(false);
const username = ref("");
const password = ref("");
const confirmPassword = ref("");
const confirmationFailed = ref(false);

// Signs up the user
async function userSignUp() {
  if (password.value !== confirmPassword.value) {
    confirmationFailed.value = true;
    console.log("Passwords do not match");
    return;
  } else {
    confirmationFailed.value = false;
    try {
      const res = await $fetch("http://localhost:4000/api/users", {
        method: "POST",
        body: {
          username: username.value,
          password: password.value,
        },
        credentials: "include",
      });
      if (res) {
        console.log(res);
      }
    } catch (e: unknown) {
      const error = e as {
        data?: { error: string };
        statusCode?: number;
        message: string;
      };
      if (error.statusCode === 401) {
        loginFailed.value = true;
      } else {
        console.error(
          "Unexpected error during login:",
          error.data?.error || error.message
        );
      }
    }
  }
}

// Logs in the user and fetches budget list to enter into store
async function userLogin() {
  try {
    const res = await $fetch<{ budgetList: BudgetList }>(
      "http://localhost:4000/api/login",
      {
        method: "POST",
        body: {
          username: username.value,
          password: password.value,
        },
        credentials: "include",
      }
    );
    store.incomeList = res.budgetList.incomeList;
    store.expenseList = res.budgetList.expenseList;
    loginOpen.value = false;
  } catch (e: unknown) {
    const error = e as {
      data?: { error: string };
      statusCode?: number;
      message: string;
    };
    if (error.statusCode === 401) {
      loginFailed.value = true;
    } else {
      console.error(
        "Unexpected error during login:",
        error.data?.error || error.message
      );
    }
  }
}

const signingUp = ref(false);

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

checkLogin();
</script>

<template>
  <UApp>
    <div class="">
      <header class="flex bg-gray-200 justify-between p-2">
        <h1 class="p-4 text-3xl bg-gray-200">Budget calculator</h1>

        <!-- Login modal -->
        <UModal
          v-model:open="loginOpen"
          title="Login form"
          description="Enter your credentials">
          <UButton label="Log in" />
          <template #title>
            <div class="flex flex-col gap-2">
              <h2 class="text-2xl">{{ signingUp ? "Sign Up" : "Log in" }}</h2>
              <p v-if="!signingUp">
                New?
                <span
                  class="underline underline-offset-2"
                  @click="signingUp = !signingUp"
                  >Sign up</span
                >
                instead
              </p>
              <p v-else>
                Already have an account?
                <span
                  class="underline underline-offset-2"
                  @click="signingUp = !signingUp"
                  >Log in</span
                >
                instead
              </p>
              <span v-if="loginFailed" class="text-red-600"
                >Incorrect username/password</span
              >
              <span v-if="confirmationFailed" class="text-red-600"
                >Passwords must match</span
              >
              <label for="Username">Username:</label>
              <UInput
                id="Username"
                v-model="username"
                name="Username"
                placeholder="Enter username" />
              <label for="Password">Password:</label>
              <UInput
                v-model="password"
                name="Password"
                type="password"
                placeholder="Enter password" />

              <label v-if="signingUp" for="Confirm password"
                >Confirm password:</label
              >
              <UInput
                v-if="signingUp"
                v-model="confirmPassword"
                name="Confirm password"
                type="password"
                placeholder="Confirm password" />
              <UButton
                :label="signingUp ? 'Sign up' : 'Log in'"
                @click="signingUp ? userSignUp() : userLogin()" />
            </div>
          </template>
        </UModal>
        <UButton label="Auth check" @click="checkLogin" />
      </header>

      <!-- Doughnut chart -->
      <div class="flex flex-col p-2 justify-center">
        <UButton
          class="h-auto w-min btn-primary text-2xl"
          :label="incomeShown ? 'Income' : 'Expenses'"
          @click="incomeShown = !incomeShown" />

        <div class="flex justify-center">
          <JChart v-if="incomeShown" :chart-data="store.incomeList" />
          <JChart v-if="!incomeShown" :chart-data="store.expenseList" />
        </div>
      </div>

      <!-- Net amount display -->
      <div class="lg:flex lg:justify-center lg:gap-4 lg:my-5">
        <h2 class="text-2xl md:text-3xl p-4 lg:p-0">
          Net gain/loss {{ total }}
        </h2>
        <UButton class="text-xl" label="Save Budget" @click="saveBudgetList" />
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
