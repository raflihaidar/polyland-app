<script setup lang="ts">
import AppLoading from "@/components/shared/AppLoading.vue";
import { useApiPrivate } from "@/composables/useApi";
import { capitalizeFirstLetter, formatDateIndonesia } from "@/utils/format";
import { onMounted, ref } from "vue";

const queueList = ref<any[]>([]);

const isLoading = ref<boolean>(false);

const statusColorMap: Record<string, string> = {
  MENUNGGU: "warning",
  DIPANGGIL: "info",
  SELESAI: "success",
  TIDAK_HADIR: "error",
};

const getQueue = async () => {
  try {
    isLoading.value = true;
    const { data } = await useApiPrivate().get(
      `/queue?date=${new Date()}&status=DIPANGGIL&status=SELESAI`,
    );
    queueList.value = data.data;
  } catch (error) {
    console.log(error);
  } finally {
    isLoading.value = false;
  }
};

onMounted(() => {
  getQueue();
});
</script>

<template>
  <div v-if="queueList.length > 0">
    <UCard v-for="(item, index) in queueList" :key="index" class="mb-4">
      <UBadge
        :color="statusColorMap[item.status]"
        variant="soft"
        class="rounded-full mb-3"
      >
        {{ capitalizeFirstLetter(item.status) }}
      </UBadge>
      <div class="flex justify-between items-center">
        <h4 class="w-[80%] truncate font-semibold">{{ item.loket?.name }}</h4>
        <UBadge class="font-bold rounded-full">
          A-{{ item.queue_number }}
        </UBadge>
      </div>

      <div class="text-sm my-3 w-full truncate">
        <p>Lokasi Kantor : {{ item?.loket?.office?.name || "-" }}</p>
        <p>
          Tanggal kunjungan :
          {{ formatDateIndonesia(item.queue_date || "-") }}
        </p>
      </div>

      <UButton block :to="`/antrian-online/detail-tiket/${item.id}`">
        Lihat Tiket
        <UIcon name="ri:arrow-right-long-line" class="size-5" />
      </UButton>
    </UCard>
  </div>
  <AppLoading v-else-if="isLoading" />
  <div
    v-else
    class="absolute top-1/2 left-1/2 -translate-x-1/2 -tarnslate-y-1/2 w-full text-center"
  >
    <p>
      Kamu belum ada panggilan nih, Yuk! ambil antrian daring sekarang buat
      mengurus berkas ke kantor pertanahan.
    </p>
  </div>
</template>
