<script setup lang="ts">
import { computed, provide, ref } from "vue";
import { useApplicationStore } from "../../stores/application.store";
import { useToast } from "@nuxt/ui/runtime/composables/useToast.js";
import type { SelectMenuItem, FormSubmitEvent } from "@nuxt/ui";
import { useRouter } from "vue-router";

provide("head-title", "Cari Berkas");

const toast = useToast();
const store = useApplicationStore();
const router = useRouter();

const isValid = computed(() => {
  return form.value.office && form.value.nomorBerkas && form.value.year;
});

const currentYear = new Date().getFullYear();
const form = ref({
  office: null,
  nomorBerkas: "",
  year: currentYear,
});

const officeList = ref<SelectMenuItem[]>([
  {
    id: 1,
    label: "Kabupaten Jember",
  },
  {
    id: 2,
    label: "Kota Surabaya",
  },
]);

const years = Array.from(
  { length: currentYear - 1950 + 1 },
  (_, i) => currentYear - i,
);

const handleSearch = async () => {
  if (form.value.nomorBerkas) {
    const { status, message } = await store.searchApplication(
      form.value.nomorBerkas,
    );

    if (status === "not found") {
      toast.add({
        title: "Pencarian gagal",
        description: message,
        color: "error",
      });
    } else {
      router.push(`/cari-berkas/hasil?fileNumber=${form.value.nomorBerkas}`);
    }
  }
};
</script>

<template>
  <section
    class="absolute -translate-x-1/2 -translate-y-1/2 left-1/2 top-1/2 px-5 w-[90%]"
  >
    <UForm class="w-full grid grid-col-1 gap-y-3">
      <UFormField label="Kantor Pertanahan">
        <USelectMenu
          v-model="form.office"
          value-key="id"
          :items="officeList"
          class="w-full"
          placeholder="Pilih Kantor Pertanahan"
          size="xl"
        />
      </UFormField>

      <UFormField label="Nomor Berkas">
        <UInput
          v-model="form.nomorBerkas"
          placeholder="Masukkan nomor berkas"
          class="w-full"
          size="xl"
        />
      </UFormField>

      <UFormField label="Tahun">
        <UInputMenu
          v-model="form.year"
          :items="years"
          class="w-full"
          size="xl"
        />
      </UFormField>

      <UButton
        :disabled="!isValid"
        label="Cari Berkas"
        @click="handleSearch"
        block
        class="mt-5"
        :loading="store.isLoading('SEARCH')"
      />
    </UForm>
  </section>
</template>
