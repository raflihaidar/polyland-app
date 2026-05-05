<script setup lang="ts">
import MobileLayout from "@/layouts/Mobile.vue";
import { useAuthStore } from "@/stores/auth.store";
import type { OfficeLand, User } from "@/types";
import { storeToRefs } from "pinia";
import { computed, onMounted, provide, ref } from "vue";
import ModalAddUser from "./components/Modal/ModalAddUser.vue";
import { useOfficeLandStore } from "@/stores/office-land.store";
import { useInfiniteScroll } from "@vueuse/core";

provide("head-title", "Antrian Daring");
const authStore = useAuthStore();
const officeLandStore = useOfficeLandStore();

const { user } = storeToRefs(authStore);
const { offices } = storeToRefs(officeLandStore);

const params = ref({
  page: 1,
  limit: 10,
  search: "",
});

const data = ref<{ pemohon: User[]; office: OfficeLand | null }>({
  pemohon: [],
  office: null,
});

const isValid = computed(() => {
  return data.value.pemohon.length > 0 && data.value.pemohon;
});

const handleAddPemohon = (payload: User) => {
  if (payload) {
    data.value.pemohon.push(payload);
  }
};

const getOfficeLands = async () => {
  await officeLandStore.getAll(params.value);
};

onMounted(async () => {
  if (user.value) {
    data.value.pemohon.push(user.value);
  }
});
</script>

<template>
  <MobileLayout>
    <UForm class="grid grid-cols-1 gap-y-3">
      <section class="flex items-center justify-between">
        <h3>Pemohon :</h3>
        <ModalAddUser />
      </section>
      <template v-if="data.pemohon.length > 0">
        <div
          v-for="(item, index) in data.pemohon"
          :key="index"
          class="bg-white p-5 rounded-xl flex items-center gap-x-3"
        >
          <UIcon name="ri:user-3-line" class="size-5" />
          <section>
            <p class="font-medium">{{ item?.name }}</p>
          </section>
        </div>
      </template>
      <template v-else>
        <div class="bg-white p-5 rounded-xl flex items-center gap-x-3">
          <h4 class="font-medium text-danger">Tidak ada pemohon</h4>
        </div>
      </template>
      <div class="border-t-2 my-3 text-slate-200"></div>
      <UFormField label="Kantor Pertanahan">
        <USelectMenu
          v-model="data.office"
          by="id"
          label-key="name"
          :items="offices"
          class="w-full"
          placeholder="Pilih Kantor Pertanahan"
          size="xl"
          @update:open="getOfficeLands"
          :loading="officeLandStore.isLoading('FETCH')"
        />
      </UFormField>
      <UFormField label="Lokasi Kerja">
        <UInput
          :readonly="true"
          :value="data.office?.address"
          class="w-full"
          size="xl"
        />
      </UFormField>
      <UFormField label="Layanan">
        <UInput
          :readonly="true"
          value="Peralihan Hak"
          class="w-full"
          size="xl"
        />
      </UFormField>
      <UButton :disabled="!isValid" label="Lanjut" block class="mt-5" />
    </UForm>
  </MobileLayout>
</template>
