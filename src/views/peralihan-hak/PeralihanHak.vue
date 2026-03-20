<script setup lang="ts">
import MobileLayout from "@/layouts/mobile.vue";
import { provide, ref } from "vue";
import { useOfficeLandStore } from "@/stores/office-land.store";
import { storeToRefs } from "pinia";
import { useDebounceFn } from "@vueuse/core";

provide("head-title", "Info Layanan");

const officeStore = useOfficeLandStore()
const {offices} =  storeToRefs(officeStore)
const search = ref<string>("")
const isDrawerOpen = ref(false)

const handleSearch = useDebounceFn(async () => {
  await officeStore.getAll({page : 1, limit : 1, search : search.value})
}, 500)

const openDrawer = useDebounceFn(async () => {
  await officeStore.getAll({page : 1, limit : 10, search : ""})
  isDrawerOpen.value = true
}, 500)
</script>

<template>
  <MobileLayout>
    <section class="px-2 py-6 space-y-6">

      <!-- Judul -->
      <div>
        <h1 class="text-2xl font-semibold text-gray-900">
          Peralihan Hak Jual Beli
        </h1>
      </div>

      <!-- Persyaratan -->
      <div>
        <h2 class="text-lg font-semibold mb-3">Persyaratan</h2>

        <ol class="list-decimal pl-5 space-y-2 text-sm leading-relaxed text-gray-700 text-justify">
          <li>
            Fotokopi akta pendirian dan pengesahan badan hukum yang telah
            dicocokkan dengan aslinya oleh petugas loket, bagi badan hukum
          </li>
          <li>Sertifikat Asli</li>
          <li>Akta jual beli dari PPAT</li>
          <li>Fotokopi KTP dari para pihak penjual–pembeli dan/atau kuasanya</li>
          <li>
            Izin pemindahan hak apabila di dalam sertifikat dicantumkan tanda
            bahwa hak tersebut hanya boleh dipindahtangankan jika telah
            diperoleh izin dari instansi berwenang
          </li>
          <li>
            Fotokopi SPPT dan PBB tahun berjalan serta bukti SSB (BPHTB)
          </li>
        </ol>
      </div>

      <!-- Penyelesaian -->
      <div>
        <h2 class="text-lg font-semibold mb-2">Penyelesaian</h2>
        <p class="text-sm text-gray-700">5 hari kerja</p>
      </div>

      <!-- Tombol buka drawer -->
      <UButton label="Buat Permohonan" block @click="openDrawer" />

    </section>

    <!-- Drawer -->
    <UDrawer v-model:open="isDrawerOpen" :overlay="false">

      <template #title>
        <h3 class="text-xl">Pilih Kantor Pertanahan</h3>
      </template>

      <template #body>
        <div class="space-y-4">
          <UInput icon="ri:search-line" v-model="search" @input="handleSearch" placeholder="Cari Kantah" class="w-full"></UInput>

          <template v-if="officeStore.isLoading('FETCH')">
            <p>Memuat...</p>
          </template>
          <template v-else>
            <RouterLink v-if="offices && offices.length > 0" v-for="(item, index) in offices" :key="index" :to="`/peralihan-hak/form?officeId=${item.id}`" class="block p-3 hover:bg-slate-100 transition-colors">
              <p class="text-sm text-gray-500 mt-1">
                {{ item.name }}
              </p>
            </RouterLink>
            <h3 v-else>Tidak ada kantor pertanahan yang terdaftar</h3>
          </template>
        </div>
      </template>

    </UDrawer>
  </MobileLayout>
</template>