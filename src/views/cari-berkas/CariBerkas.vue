<script setup lang="ts">
import { computed, provide, ref } from "vue";
import { useApplicationStore } from "../../stores/application.store";
import { useRouter } from "vue-router";

provide("head-title", "Cari Berkas");

const store = useApplicationStore();
const router = useRouter();

const isValid = computed(() => {
  return form.value.nomorBerkas;
});

const currentYear = new Date().getFullYear();
const form = ref({
  office: null,
  nomorBerkas: "",
  year: currentYear,
});

const handleSearch = async () => {
  if (form.value.nomorBerkas) {
    router.push(`/cari-berkas/hasil?fileNumber=${form.value.nomorBerkas}`);
  }
};
</script>

<template>
  <section
    class="absolute -translate-x-1/2 -translate-y-1/2 left-1/2 top-1/2 px-5 w-[90%]"
  >
    <UForm class="w-full grid grid-col-1 gap-y-3">
      <UFormField label="Nomor Berkas">
        <UInput
          v-model="form.nomorBerkas"
          placeholder="Masukkan nomor berkas"
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
