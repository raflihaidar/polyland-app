<script setup lang="ts">
import { ref, provide } from "vue";
import { useRouter } from "vue-router";
import { useToast } from "@nuxt/ui/runtime/composables/useToast.js";
import { useConfirmDialog } from "@/composables/useConfirmModal";
import { useAuthStore } from "@/stores/auth.store";

provide("head-title", "Profil");
const toast = useToast();
const isLoading = ref<boolean>(false);
const authStore = useAuthStore();
const router = useRouter();
const confirm = useConfirmDialog();

const logout = async () => {
  try {
    const isConfirmed = await confirm({
      title: "Logout",
      description: "Apakah Anda yakin ingin logout dari akun ini?",
    });
    if (!isConfirmed) return;
    isLoading.value = true;
    await authStore.logout();
    router.push("/login");
  } catch (error) {
    console.log(error);
    toast.add({
      title: "Logout Gagal, silahkan coba lagi",
      color: "error",
    });
  } finally {
    isLoading.value = false;
  }
};
</script>

<template>
  <section>
    <div class="">
      <img src="" alt="" />
    </div>
    <div class="bg-white p-5 rounded-2xl mt-5">
      <h3 class="font-semibold">Akun</h3>
      <ul>
        <li class="py-3 border-b border-slate-300 cursor-pointer font-medium">
          Akun dan Keamanan
        </li>
        <li
          class="py-3 border-b border-slate-300 cursor-pointer font-medium"
          @click="logout"
        >
          <span class="text-red-500"> Keluar </span>
        </li>
      </ul>
    </div>
  </section>
</template>
