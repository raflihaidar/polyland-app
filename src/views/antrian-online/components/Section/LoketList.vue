<script setup lang="ts">
import type { OfficeLand, User } from "@/types";
import { computed, onMounted, ref, shallowRef, useTemplateRef } from "vue";
import { CalendarDate } from "@internationalized/date";
import { today, getLocalTimeZone } from "@internationalized/date";
import { useOnlineQueueStore } from "@/stores/onlineQueue.store";
import { storeToRefs } from "pinia";
import { useOfficeLandStore } from "@/stores/office-land.store";
import { useToast } from "@nuxt/ui/runtime/composables/useToast.js";
import { useRouter } from "vue-router";

const store = useOnlineQueueStore();
const officeStore = useOfficeLandStore();
const router = useRouter();

const { loket } = storeToRefs(store);

const props = defineProps<{
  data: {
    pemohon: User | null;
    office: OfficeLand | null;
  };
}>();

const officeStatus = ref<any>(null);
const toast = useToast();
const openModal = ref(false);

const emits = defineEmits<{
  (
    e: "update:data",
    value: {
      pemohon: User | null;
      office: OfficeLand | null;
    },
  ): void;
  (e: "handleMenu", menu: "form" | "loket" | "detail"): void;
}>();

const minDate = computed(() => {
  const t = today(getLocalTimeZone());
  return new CalendarDate(t.year, t.month, 1);
});

const data = computed({
  get: () => props.data,
  set: (val) => emits("update:data", val),
});

const modelValue = shallowRef(today(getLocalTimeZone()));

const inputDate = useTemplateRef("inputDate");

const handleSubmit = async (id: string) => {
  if (modelValue.value) {
    const date = new Date(
      modelValue.value?.year,
      modelValue.value?.month - 1,
      modelValue.value.day,
      12,
      0,
      0,
    );
    const { data: result, status, message } = await store.createQueue(id, date);

    if (status === "success") {
      router.push(`/antrian-online/detail-tiket/${result?.id}`);
    } else {
      toast.add({
        title: "Error",
        description: message,
        color: "error",
      });
    }

    openModal.value = false;
  }
};

onMounted(async () => {
  await store.getLoketByOfficeId(data.value.office?.id!);

  const { data: item } = await officeStore.getStatus(data.value.office?.id!);
  officeStatus.value = item;
});
</script>

<template>
  <div>
    <div class="text-center">
      <h3 class="font-medium">{{ data.office?.name }}</h3>
      <div class="mt-3 text-md font-medium">
        <p
          v-if="!officeStatus?.is_open"
          :class="{ 'text-danger': officeStatus?.reason === 'Hari libur' }"
        >
          {{ officeStatus?.reason }}
        </p>
        <p v-else>{{ officeStatus?.open_at }} - {{ officeStatus?.close_at }}</p>
      </div>
    </div>

    <div class="text-center mt-3">
      <UInputDate ref="inputDate" v-model="modelValue">
        <template #trailing>
          <UPopover :reference="inputDate?.inputsRef[3]?.$el">
            <UButton
              color="neutral"
              variant="link"
              size="sm"
              icon="i-lucide-calendar"
              aria-label="Select a date"
              class="px-0"
            />

            <template #content>
              <UCalendar
                :min-value="minDate"
                v-model="modelValue"
                class="p-2"
              />
            </template>
          </UPopover>
        </template>
      </UInputDate>
    </div>
    <div v-if="loket.length > 0">
      <template v-for="(item, index) in loket" :key="index">
        <UCard class="w-full mt-5">
          <template #header>
            <h3 class="font-bold">{{ item.name }}</h3>
            <p class="text-sm text-gray-500">
              {{ item.description }}
            </p>
          </template>

          <div class="grid grid-cols-[auto_1fr] gap-x-4 text-sm">
            <p class="font-normal">Total Antrian</p>
            <p>: {{ item.total_antrian || 0 }}</p>

            <p class="font-normal">Sisa Antrian</p>
            <p>: {{ item.sisa_antrian || 0 }}</p>

            <p class="font-normal">Antrian Saat ini</p>
            <p>
              :
              {{
                item.antrian_saat_ini
                  ? "A-" + item.antrian_saat_ini.queue_number
                  : "-"
              }}
            </p>
          </div>

          <template #footer>
            <div class="flex justify-end">
              <UModal :title="item.name" v-model:open="openModal">
                <UButton @click="openModal = true">Ambil antrian</UButton>
                <template #body>
                  <UAlert
                    v-if="officeStatus?.is_open"
                    color="neutral"
                    variant="outline"
                    description="Saya menyetujui apabila panggilan saya terlewatkan karena saya belum hadir di lokasi pelayanan, maka petugas berhak untuk menyesuaikan urutan antrian saya"
                    icon="ri:information-line"
                  />

                  <UAlert
                    v-else
                    color="error"
                    variant="outline"
                    description="Layanan saat ini sedang tutup. Silakan datang kembali pada jam operasional berikutnya."
                    icon="ri:close-circle-line"
                  />
                </template>

                <template #footer v-if="officeStatus?.is_open">
                  <div class="w-full flex justify-end gap-x-3">
                    <UButton color="dark">Batal</UButton>
                    <UButton
                      :loading="store.isLoading('CREATE_QUEUE')"
                      @click="handleSubmit(item.id)"
                      >Ambil Antrian</UButton
                    >
                  </div>
                </template>
              </UModal>
            </div>
          </template>
        </UCard>
      </template>
    </div>
  </div>
</template>
