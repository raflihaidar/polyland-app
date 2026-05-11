<script setup lang="ts">
import { onMounted, provide } from "vue";
import { useCertificateStore } from "@/stores/certificate.store";
import { storeToRefs } from "pinia";

provide("head-title", "Sertifikatku");

const store = useCertificateStore();
const { certificates } = storeToRefs(store);

onMounted(async () => {
  await store.getAll();
});
</script>

<template>
  <div v-if="store.isLoading('FETCH')">
    <p>Loading...</p>
  </div>
  <div v-else>
    <div v-for="(item, index) in certificates" :key="index" class="mt-5">
      <RouterLink
        :to="`sertifikatku/${item.id}`"
        class="flex w-full justify-between items-center gap-x-3 only:border-none last:border-b last:border-slate-300 py-2"
      >
        <UAvatar class="" src="https://github.com/benjamincanac.png" />
        <div class="w-full">
          <section class="w-full max-w-full flex justify-between items-center">
            <div class="flex justify-between">
              <h3>{{ item.type }}</h3>
            </div>
            <div>{{ item.status }}</div>
          </section>
          <p>{{ item.nib }}</p>
          <p class="text-xs text-wrap">
            RT {{ item.address?.rt }}, RW {{ item.address?.rw }},
            {{ item.address?.village }}, Kec. {{ item.address?.district }},
            {{ item.address?.regency }}, {{ item.address?.province }}
          </p>
        </div>
      </RouterLink>
    </div>
  </div>
</template>
