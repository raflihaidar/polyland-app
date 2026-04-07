<script setup lang="ts">
import { ref } from "vue";
import { useRoute, useRouter } from "vue-router";

const route = useRoute();
const router = useRouter();

const navigationItem = ref<{ name: string; icon: string; slug: string }[]>([
  { name: "Beranda", icon: "ri:home-3-fill", slug: "home" },
  { name: "Scan Dokumen", icon: "ri:qr-scan-2-line", slug: "scan-qr" },
  { name: "Profil", icon: "ri:user-3-line", slug: "profil" },
]);

const scanDokumenClass =
  "absolute -translate-y-[100%] -translate-x-1/2 left-1/2 top-[60%] size-10 bg-primary text-white rounded-xl p-1";

const navigate = (slug: string) => {
  router.push({ name: slug });
};
</script>

<template>
  <div
    class="fixed bottom-0 left-0 w-full flex items-center gap-x-2 px-5 py-3 bg-white shadow-xs"
  >
    <ul
      v-for="(item, index) in navigationItem"
      :key="index"
      class="w-full relative"
    >
      <li
        class="w-full text-center cursor-pointer flex flex-col items-center"
        :class="[route.name === item.slug ? 'text-primary font-medium' : '']"
        @click="navigate(item.slug)"
      >
        <!-- wrapper icon -->
        <div class="relative h-10 flex items-center justify-center">
          <UIcon
            :name="item.icon"
            :class="item.name === 'Scan Dokumen' ? scanDokumenClass : 'size-7'"
          />
        </div>

        <!-- label -->
        <p class="text-xs mt-2 font-semibold">
          {{ item.name }}
        </p>
      </li>
    </ul>
  </div>
</template>
