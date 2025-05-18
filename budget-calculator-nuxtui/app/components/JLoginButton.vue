<script setup lang="ts">
import type { BudgetList } from "@/types";

const apiUrl = useRuntimeConfig().public.apiUrl;

const emit = defineEmits<{
  (e: "logged-in"): void;
}>();

const loginOpen = ref(false);
const loginFailed = ref(false);
const username = ref("");
const password = ref("");
const confirmPassword = ref("");
const confirmationFailed = ref(false);
const signingUp = ref(false);

const store = useEntryStore();

// Signs up the user
async function userSignUp() {
  if (password.value !== confirmPassword.value) {
    confirmationFailed.value = true;
    console.log("Passwords do not match");
    return;
  } else {
    confirmationFailed.value = false;
    try {
      const res = await $fetch(`${apiUrl}/api/users`, {
        method: "POST",
        body: {
          username: username.value,
          password: password.value,
        },
        credentials: "include",
      });
      if (res) {
        console.log("User created successfully");
        username.value = "";
        password.value = "";
        confirmPassword.value = "";
        userLogin();
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
      `${apiUrl}/api/login`,
      {
        method: "POST",
        body: {
          username: username.value,
          password: password.value,
        },
        credentials: "include",
      }
    );

    if (res.budgetList.incomeList.length != 0) {
      store.incomeList = res.budgetList.incomeList;
    }

    if (res.budgetList.expenseList.length != 0) {
      store.expenseList = res.budgetList.expenseList;
    }

    loginOpen.value = false;
    username.value = "";
    password.value = "";
    confirmPassword.value = "";
    emit("logged-in");
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
</script>

<template>
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
        <UInput id="Username" v-model="username" placeholder="Enter username" />
        <label for="Password">Password:</label>
        <UInput
          id="Password"
          v-model="password"
          type="password"
          placeholder="Enter password" />

        <label v-if="signingUp" for="Confirm password">Confirm password:</label>
        <UInput
          v-if="signingUp"
          id="Confirm password"
          v-model="confirmPassword"
          type="password"
          placeholder="Confirm password" />
        <UButton
          :label="signingUp ? 'Sign up' : 'Log in'"
          @click="signingUp ? userSignUp() : userLogin()" />
      </div>
    </template>
  </UModal>
</template>
