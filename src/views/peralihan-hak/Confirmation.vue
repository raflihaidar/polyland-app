<script setup lang="ts">
import MobileLayout from "../../layouts/mobile.vue"
import { useRoute, useRouter } from "vue-router"

const route = useRoute()
const router = useRouter()


const fileNumber = route.query?.fileNumber

const goToHome = () => {
  router.push("/")
}

const goToTracking = () => {
  router.push(`/cari-berkas?id=${fileNumber}`)
}
</script>

<template>
  <MobileLayout>
    <div class="w-full flex flex-col items-center justify-center py-10 px-4 text-center space-y-6">

      <!-- Icon Success -->
      <div class="w-20 h-20 flex items-center justify-center rounded-full bg-green-100">
        <UIcon name="i-lucide-check-circle" class="text-green-600 w-12 h-12" />
      </div>

      <!-- Title -->
      <div>
        <h1 class="text-xl font-semibold">
          Permohonan Berhasil Dikirim
        </h1>
        <p class="text-gray-600 mt-2 text-sm">
          Permohonan Anda telah berhasil dikirim dan sedang diproses."
        </p>
      </div>

      <!-- Nomor Permohonan -->
      <div class="w-full bg-gray-50 border rounded-lg p-4 text-left">
        <p class="text-sm text-gray-500">Nomor Permohonan</p>
        <p class="font-medium text-base break-all">
          SHM-2026-001
        </p>
      </div>

      <!-- Informasi Tambahan -->
      <div class="text-sm text-gray-600">
        Silakan simpan nomor permohonan Anda untuk melakukan pelacakan status.
      </div>

      <!-- Action Buttons -->
      <div class="w-full space-y-3 pt-4">
        <UButton block color="primary" @click="goToTracking">
          Lihat Status Permohonan
        </UButton>

        <UButton block variant="outline" @click="goToHome">
          Kembali ke Beranda
        </UButton>
      </div>

    </div>
  </MobileLayout>
</template>