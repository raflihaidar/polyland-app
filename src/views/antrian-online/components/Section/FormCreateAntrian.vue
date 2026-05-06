<script setup lang="ts">
import { useAuthStore } from "@/stores/auth.store";
import type { OfficeLand, User } from "@/types";
import { storeToRefs } from "pinia";
import { computed, onMounted, ref } from "vue";
import { useOfficeLandStore } from "@/stores/office-land.store";

const authStore = useAuthStore();
const officeLandStore = useOfficeLandStore();
const { user } = storeToRefs(authStore);
const { offices } = storeToRefs(officeLandStore);

const props = defineProps<{
  data: {
    pemohon: User | null;
    office: OfficeLand | null;
  };
}>();

const emits = defineEmits<{
  (e: 'update:data', value: { pemohon: User | null; office: OfficeLand | null }): void;
  (e: 'handleMenu', menu: 'form' | 'loket'): void;
}>();

const params = ref({
  page: 1,
  limit: 10,
  search: "",
});

const data = computed({
  get: () => props.data,
  set: (val) => emits('update:data', val),
});

const handleNext = () => {
    emits('handleMenu', 'loket')
}

const isValid = computed(() => {
  return data.value.pemohon && data.value.office;
});

const getOfficeLands = async () => {
  await officeLandStore.getAll(params.value);
};

onMounted(async () => {
  if (user.value) {
    emits('update:data', {
      ...props.data,
      pemohon: user.value,
    });
  }
});
</script>

<template>
  <UForm class="grid grid-cols-1 gap-y-3">
    <section class="flex items-center justify-between">
      <h3>Pemohon :</h3>
    </section>

    <template v-if="data.pemohon">
      <div
        class="bg-white p-5 rounded-xl flex items-center gap-x-3"
      >
        <UIcon name="ri:user-3-line" class="size-5" />
        <p class="font-medium">{{ data.pemohon?.name }}</p>
        <section>
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

    <UButton :disabled="!isValid" label="Lanjut" block class="mt-5" @click="handleNext"/>
  </UForm>
</template>