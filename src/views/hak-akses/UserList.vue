<script setup lang="ts">
import UserTable from "./components/UserTable.vue";
import AccountTable from "../verifikasi-akun/components/Table/AccountTable.vue";

const items = [
  {
    label: "User",
    icon: "lucide:user-round",
    slot: "user",
  },
  {
    label: "Verifikasi Akun",
    icon: "lucide:user-round-check",
    slot: "account",
  },
];
</script>

<template>
  <UTabs variant="link" :items="items">
    <template #user>
      <UserTable />
    </template>

    <template #account>
      <AccountTable />
    </template>
  </UTabs>
</template>
