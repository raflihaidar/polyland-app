<script setup lang="ts">
import { provide, ref } from "vue";
import MobileLayout from "../../layouts/Mobile.vue";
import { useApplicationStore } from "../../stores/application.store";
import { useToast } from "@nuxt/ui/runtime/composables/useToast.js";
import { useRouter } from "vue-router";

provide("head-title", "Cari Berkas");

const toast = useToast();
const store = useApplicationStore();
const router = useRouter();

const nomorBerkas = ref<string>("");

const handleSearch = async () => {
  if (nomorBerkas.value) {
    const { status, message } = await store.searchApplication(
      nomorBerkas.value,
    );

    if (status === "not found") {
      toast.add({
        title: "Pencarian gagal",
        description: message,
        color: "error",
      });
    } else {
      console.log("masuk");
      router.push(`/cari-berkas/hasil?fileNumber=${nomorBerkas.value}`);
    }
  }
};
</script>

<template>
  <MobileLayout>
    <section
      class="absolute -translate-x-1/2 -translate-y-1/2 left-1/2 top-1/2 w-full px-5"
    >
      <UInput
        v-model="nomorBerkas"
        placeholder="Masukkan nomor berkas"
        class="w-full"
      />
      <UButton
        label="Cari Berkas"
        @click="handleSearch"
        block
        class="mt-5"
        :loading="store.isLoading('SEARCH')"
      />
    </section>
  </MobileLayout>
</template>
