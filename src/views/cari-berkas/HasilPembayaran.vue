<script setup lang="ts">
import { useApiPrivate } from '@/composables/useApi';
import { onMounted, ref, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { PaymentStatus, type ApplicationPayment } from "@/types";
import { formatRupiah, formatDate } from "@/utils/formatter";
import AppLoading from '@/components/shared/AppLoading.vue';

const api = useApiPrivate()
const route = useRoute()
const router = useRouter()
const orderId = route.params.orderId

const paymentDetail = ref<ApplicationPayment | null>(null)
const isLoading = ref(true)

const resultConfig = computed(() => {
    switch (paymentDetail.value?.status) {
        case PaymentStatus.SUCCESS:
            return {
                icon: 'tabler:check',
                iconBg: 'bg-success',
                title: 'Pembayaran Berhasil!',
                description: 'Terima kasih, permohonan peralihan hak Anda sedang diproses.',
                badgeLabel: 'Selesai',
                badgeColor: 'success' as const,
            }
        case PaymentStatus.EXPIRED:
            return {
                icon: 'tabler:clock-x',
                iconBg: 'bg-primary',
                title: 'Pembayaran Kadaluwarsa',
                description: 'Batas waktu pembayaran telah habis. Silakan buat permohonan baru.',
                badgeLabel: 'Kadaluwarsa',
                badgeColor: 'error' as const,
            }
        case PaymentStatus.CANCELED:
            return {
                icon: 'tabler:x',
                iconBg: 'bg-primary',
                title: 'Pembayaran Dibatalkan',
                description: 'Transaksi Anda telah dibatalkan. Silakan coba lagi.',
                badgeLabel: 'Dibatalkan',
                badgeColor: 'error' as const,
            }
        default:
            return {
                icon: 'tabler:hourglass',
                iconBg: 'bg-yellow-500',
                title: 'Menunggu Pembayaran',
                description: 'Kami belum menerima konfirmasi pembayaran Anda.',
                badgeLabel: 'Pending',
                badgeColor: 'warning' as const,
            }
    }
})

const getPaymentDetail = async () => {
    try {
        isLoading.value = true
        const res = await api.get(`/ownership-transfer/payment-detail/${orderId}`)
        if (res.status === 200) {
            paymentDetail.value = res.data.data
        }
    } catch (error) {
        paymentDetail.value = null
    } finally {
        isLoading.value = false
    }
}

const goToHome = () => {
    router.push('/')
}

onMounted(async () => {
    if (route.params.orderId) {
        await getPaymentDetail()
    } else {
        isLoading.value = false
    }
})
</script>

<template>
    <div v-if="isLoading">
        <AppLoading />
    </div>
    <div v-else-if="paymentDetail" class="max-w-md mx-auto">
        <section class="text-center px-4 mt-6">
            <div class="mx-auto flex items-center justify-center size-16 rounded-full" :class="resultConfig.iconBg">
                <UIcon :name="resultConfig.icon" class="size-8 text-white" />
            </div>
            <h2 class="font-semibold text-lg mt-4">{{ resultConfig.title }}</h2>
            <p class="text-sm text-gray-500 mt-1 leading-relaxed">
                {{ resultConfig.description }}
            </p>
        </section>

        <UCard class="mt-8 mx-4">
            <template #header>
                <h3 class="font-semibold text-sm">Rincian Transaksi</h3>
            </template>

            <div class="flex flex-col gap-y-4">
                <div class="flex items-center justify-between">
                    <span class="text-sm text-gray-500">Total Pembayaran</span>
                    <span class="text-sm font-semibold text-primary">
                        {{ formatRupiah(paymentDetail.amount) }}
                    </span>
                </div>

                <div class="flex items-center justify-between">
                    <span class="text-sm text-gray-500">ID Transaksi</span>
                    <span class="text-sm font-medium">{{ paymentDetail.order_id }}</span>
                </div>

                <div class="flex items-center justify-between">
                    <span class="text-sm text-gray-500">Metode Pembayaran</span>
                    <span class="text-sm font-medium uppercase">QRIS</span>
                </div>

                <div class="flex items-center justify-between">
                    <span class="text-sm text-gray-500">Tanggal</span>
                    <span class="text-sm font-medium">{{ formatDate(paymentDetail.createdAt) }}</span>
                </div>

                <div class="flex items-center justify-between">
                    <span class="text-sm text-gray-500">Status</span>
                    <UBadge :label="resultConfig.badgeLabel" :color="resultConfig.badgeColor" variant="subtle" />
                </div>
            </div>
        </UCard>
    </div>
    <div v-else>
        <UEmpty icon="tabler:error-404" title="Data pembayaran tidak ditemukan"
            description="Data transaksi tidak tersedia." />
    </div>
      <section class="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-white p-4">
            <UButton label="Kembali ke Beranda" icon="tabler:home" block size="xl" variant="outline" @click="goToHome" />
        </section>
</template>