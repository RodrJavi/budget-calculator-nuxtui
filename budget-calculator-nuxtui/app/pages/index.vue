<script setup lang="ts">
// Store logic
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

// async function testUserFetch() {
//   const res = await $fetch("http://localhost:4000/api/users", {
//     method: "GET",
//   });

//   console.log(res[0]);
// }

const testUser = ref("testUsername1");
const testPassword = ref("testPassword1");

async function testLogin() {
  try {
    const res = await $fetch("http://localhost:4000/api/login", {
      method: "POST",
      body: {
        username: testUser.value,
        password: testPassword.value,
      },
      credentials: "include",
    });
    console.log("Login successful:", res);
  } catch (e: unknown) {
    const error = e as { data?: { error: string }; message: string };
    console.error("Login failed:", error.data?.error || error.message);
  }
}

async function checkLogin() {
  try {
    const res = await $fetch("http://localhost:4000/api/auth-check", {
      credentials: "include",
    });
    console.log("Login check successful:", res);
  } catch (e: unknown) {
    const error = e as { data?: { error: string }; message: string };
    console.error("Login check failed:", error.data?.error || error.message);
  }
}
</script>

<template>
  <UApp>
    <div class="">
      <header>
        <h1 class="p-4 text-3xl bg-gray-200">Budget calculator</h1>
        <UButton label="Login" @click="testLogin" />
        <UButton label="Auth check" @click="checkLogin" />
      </header>

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

      <div class="lg:flex lg:justify-center lg:gap-4 lg:my-5">
        <h2 class="text-2xl md:text-3xl p-4 lg:p-0">Net gain/loss</h2>
        <div class="flex justify-center p-4 lg:p-0">
          <span class="text-3xl">{{ total }}</span>
        </div>
      </div>

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
