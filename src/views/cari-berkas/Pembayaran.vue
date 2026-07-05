<script setup lang="ts">
import { useApiPrivate } from '@/composables/useApi';
import { onMounted, onUnmounted, ref, computed, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { PaymentStatus, type ApplicationPayment } from "@/types";
import { formatRupiah } from "@/utils/formatter";
import AppLoading from '@/components/shared/AppLoading.vue';

const api = useApiPrivate()
const route = useRoute()
const router = useRouter()
const orderId = route.params.orderId
const paymentDetail = ref<ApplicationPayment | null>(null)
const isDownloading = ref(false)
const isLoading = ref(false)
const isCheckStatusLoading = ref(false)

// countdown state
const remainingSeconds = ref(0)
const isExpired = ref(false)
let intervalId: ReturnType<typeof setInterval> | null = null

const formattedTime = computed(() => {
    const minutes = Math.floor(remainingSeconds.value / 60)
    const seconds = remainingSeconds.value % 60
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
})

// mapping status -> label & warna badge
const statusConfig = computed(() => {
    switch (paymentDetail.value?.status) {
        case PaymentStatus.PENDING:
            return { label: 'Menunggu Pembayaran', color: 'warning' }
        case PaymentStatus.SUCCESS:
            return { label: 'Pembayaran Berhasil', color: 'success' }
        case PaymentStatus.EXPIRED:
            return { label: 'Kadaluwarsa', color: 'neutral' }
        default:
            return { label: 'Tidak Diketahui', color: 'neutral' }
    }
})

const startCountdown = (expireAt: string | number | Date) => {
    const expireTime = new Date(expireAt).getTime()

    const tick = () => {
        const now = Date.now()
        const diffMs = expireTime - now
        const diffSec = Math.floor(diffMs / 1000)

        if (diffSec <= 0) {
            remainingSeconds.value = 0
            isExpired.value = true
            if (intervalId) clearInterval(intervalId)
            return
        }

        remainingSeconds.value = diffSec
    }

    tick()
    intervalId = setInterval(tick, 1000)
}

watch(isExpired, (val) => {
    if (val) {
        if (intervalId) clearInterval(intervalId)
    }
})

const getPaymentDetail = async () => {
    try {
        isLoading.value = true
        const res = await api.get(`/ownership-transfer/payment-detail/${orderId}`)
        if (res.status === 200) {
            paymentDetail.value = res.data.data
            if (paymentDetail.value && paymentDetail.value.status !== PaymentStatus.PENDING) {
                router.push(`/cari-berkas/pembayaran/${paymentDetail.value.order_id}/result`)
                return
            }
            if (paymentDetail.value?.expireAt) {
                startCountdown(paymentDetail.value.expireAt)
            }
        }
    } catch (error) {
        paymentDetail.value = null
    } finally {
        isLoading.value = false
    }
}

const getPaymentStatus = async () => {
    try {
        isCheckStatusLoading.value = true
        const res = await api.get(`/ownership-transfer/payment-status/${orderId}`)
        if (res.status === 200) {
            if (res.data.data && res.data.data.status !== PaymentStatus.PENDING) {
                router.push(`/cari-berkas/pembayaran/${orderId}/result`)
            }
        }
    } catch (error) {
        console.log(error)
    } finally {
        isCheckStatusLoading.value = false
    }
}

const downloadQr = async () => {
    if (!paymentDetail.value?.qr_url) return
    isDownloading.value = true
    try {
        const response = await fetch(paymentDetail.value.qr_url)
        const blob = await response.blob()
        const blobUrl = window.URL.createObjectURL(blob)

        const link = document.createElement('a')
        link.href = blobUrl
        link.download = `qr-payment-${orderId}.png`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)

        window.URL.revokeObjectURL(blobUrl)
    } catch (error) {
        console.log(error)
    } finally {
        isDownloading.value = false
    }
}

onMounted(async () => {
    if (route.params.orderId) {
        await getPaymentDetail()
    }
})

onUnmounted(() => {
    if (intervalId) clearInterval(intervalId)
})
</script>

<template>
    <div v-if="isLoading">
        <AppLoading />
    </div>
    <div v-else-if="paymentDetail">
        <section class="text-center">
            <UBadge :label="statusConfig.label" :color="statusConfig.color" variant="subtle" class="mb-3" />

            <h3 class="text-sm font-medium">Total Pembayaran</h3>
            <UBadge :label="formatRupiah(paymentDetail.amount)" color="primary" class="mt-3" size="xl" />

            <div class="text-sm mt-3 flex items-center justify-center gap-x-1"
                :class="isExpired ? 'text-red-500' : 'text-primary'">
                <UIcon name="tabler:time-duration-15" class="size-6" />
                <p v-if="!isExpired">Berakhir dalam {{ formattedTime }}</p>
                <p v-else>Waktu pembayaran telah habis</p>
            </div>
        </section>
        <UCard class="mt-5">
            <template #header>
                <div class="flex items-center justify-center">
                    <img src="@/assets/jejak-tanahku-logo.png" class="w-10 h-10" />
                    <h3 class="font-medium text-center">Jejak Tanahku</h3>
                </div>
            </template>
            <img :src="paymentDetail.qr_url" class="mx-auto w-60" />
        </UCard>
        <section class="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-white p-4 flex flex-col gap-y-3">
            <UButton label="Download QR" icon="line-md:download" block size="xl" :loading="isDownloading"
                :disabled="isExpired" @click="downloadQr" />
            <UButton label="Cek Status Pembayaran" variant="outline" block size="xl"
                @click="getPaymentStatus" :loading="isCheckStatusLoading" />
        </section>
    </div>
    <div v-else>
        <UEmpty icon="tabler:error-404" title="Tagihan pembayaran tidak ditemukan"
            description="Tagihan pembayaran tidak tersedia atau telah kadaluwarsa." />
    </div>
</template>