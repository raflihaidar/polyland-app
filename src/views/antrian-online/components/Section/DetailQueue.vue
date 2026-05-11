<script setup lang="ts">
import { useApiPrivate } from "@/composables/useApi";
import { capitalizeFirstLetter, formatDateIndonesia } from "@/utils/format";
import { onMounted, ref } from "vue";
import { useRoute } from "vue-router";

const route = useRoute();

const isLoading = ref<boolean>(false);
const detailQueue = ref<any>(null);

const statusColorMap: Record<string, string> = {
  MENUNGGU: "warning",
  DIPANGGIL: "info",
  SELESAI: "success",
  TIDAK_HADIR: "error",
};

const getDetailQueue = async () => {
  try {
    isLoading.value = true;

    const { data } = await useApiPrivate().get(
      `/queue/detail/${route.params.id}`,
    );

    console.log("id antrian : ", route.params.id);
    console.log("antrian : ", data.data);

    detailQueue.value = data.data;
  } catch (error) {
  } finally {
    isLoading.value = false;
  }
};

onMounted(() => {
  if (route.params.id) {
    getDetailQueue();
  }
});
</script>

<template>
  <UCard>
    <div class="flex flex-col items-center border-b-2 border-slate-200 pb-3">
      <p>Nomor Antrian Kamu</p>
      <h3 class="font-bold text-4xl">A-{{ detailQueue?.queue_number }}</h3>
    </div>

    <div class="mt-3 flex flex-col gap-y-5">
      <p class="font-medium text-lg">Informasi Lengkap</p>

      <section>
        <p class="font-medium">Status Antrian</p>
        <UBadge
          :color="statusColorMap[detailQueue?.status]"
          variant="soft"
          class="rounded-full"
        >
          {{ capitalizeFirstLetter(detailQueue?.status) }}
        </UBadge>
      </section>

      <section>
        <p class="font-medium">Kantor Pertanahan</p>
        <p class="tex-sm">{{ detailQueue?.loket?.office?.name }}</p>
      </section>

      <section>
        <p class="font-medium">Lokasi Kerja</p>
        <p class="tex-sm">{{ detailQueue?.loket?.office?.address }}</p>
      </section>

      <section>
        <p class="font-medium">Loket Group</p>
        <p class="tex-sm">{{ detailQueue?.loket?.name }}</p>
      </section>

      <section>
        <p class="font-medium">Tanggal Kunjungan</p>
        <p class="text-sm">
          {{ formatDateIndonesia(detailQueue?.queue_date) }}
        </p>
      </section>
    </div>

    <template #footer>
      <p class="text-sm">
        Terimakasih telah menggunakan Layanan Antrian Online Kementrian ATR/BPN
      </p>
    </template>
  </UCard>
</template>
