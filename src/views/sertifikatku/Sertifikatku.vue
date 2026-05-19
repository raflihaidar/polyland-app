<script setup lang="ts">
import { onMounted, provide } from "vue";
import { useCertificateStore } from "@/stores/certificate.store";
import { storeToRefs } from "pinia";
import AppLoading from "@/components/shared/AppLoading.vue";

provide("head-title", "Sertifikatku");

const store = useCertificateStore();
const { certificates } = storeToRefs(store);

onMounted(async () => {
  await store.getAll();
});
</script>

<template>
  <div v-if="store.isLoading('FETCH')">
    <AppLoading />
  </div>
  <div v-else>
    <div v-for="(item, index) in certificates" :key="index" class="mt-5">
      <RouterLink
        :to="`sertifikatku/${item.id}`"
        class="flex w-full justify-between items-center gap-x-3 only:border-none last:border-b last:border-slate-300 py-2"
      >
        <div class="w-10 h-10 bg-white rounded-full">
          <img src="../../assets/lambang-pancasila.png" alt="" />
        </div>
        <div class="w-full">
          <section class="w-full max-w-full flex justify-between items-center">
            <p class="font-semibold">{{ item.label || item.nib }}</p>
            <UBadge
              class="rounded-full"
              variant="subtle"
              :label="item.status"
              :color="item.status === 'AKTIF' ? 'success' : 'warning'"
            />
          </section>
          <p class="text-xs text-wrap italic">
            RT {{ item.address?.rt }}, RW {{ item.address?.rw }},
            {{ item.address?.village }}, Kec. {{ item.address?.district }},
            {{ item.address?.regency }}, {{ item.address?.province }}
          </p>
        </div>
      </RouterLink>
    </div>
  </div>
</template>
