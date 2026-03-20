<script setup lang="ts">
import { storeToRefs } from "pinia";
import MobileLayout from "@/layouts/mobile.vue";
import { useAuthStore } from "@/stores/auth.store";
import { useRouter } from "vue-router";
import type { ButtonProps } from "@nuxt/ui";
import { onMounted, ref } from "vue";
import { useAccountStore } from "@/stores/account.store";

const store = useAuthStore();
const { user } = storeToRefs(store);

const accountStore = useAccountStore()
const { isAccountVerified } = storeToRefs(accountStore);

const isDrawerOpen = ref(false);
const router = useRouter();

const openDrawer = () => {
    isDrawerOpen.value = true;
};

const actions = ref<ButtonProps[]>([
    {
        label: "Verifikasi",
        color: "secondary",
        class: "text-black",
        onClick: openDrawer,
    },
]);

onMounted(async () => {
    await accountStore.checkAccount()
})
</script>

<template>
    <MobileLayout>
        <UDrawer v-model:open="isDrawerOpen" :overlay="false">
            <UBanner class="mb-5 py-3 whitespace-normal [&_.u-button]:w-full sm:[&_.u-button]:w-auto"
                v-if="user && !user.isVerified" color="warning"
                :actions="isAccountVerified == 'not found' ? actions : null">
                <template #title>
                    <span class="whitespace-normal wrap-break-words">
                        {{
                            isAccountVerified == 'not found' ?
                                'Silakan lengkapi data untuk melanjutkan.'
                                : 'Verifikasi Akun anda sedang diproses'
                        }}
                    </span>
                </template>
            </UBanner>

            <!-- BANNER -->
            <div class="bg-white shadow-sm p-5 rounded-xl text-text">
                <p class="text-sm">Selamat pagi,</p>
                <p :class="user && ((user?.name && user.name.length <= 20) || user?.username && user.username.length <= 20) ? 'text-xl' : 'text-lg'"
                    class="my-2 font-medium text-nowrap truncate">
                    {{ user?.name || user?.username }}
                </p>
            </div>

            <!-- Menu Layanan -->
            <div class="mt-10">
                <h3 class="font-medium">Layanan</h3>
                <div class="mt-5 grid grid-cols-4 gap-x-5">
                    <!-- <div class="w-full text-center">
                        <div
                            class="text-center bg-white rounded-xl w-16 h-16 shadow-sm flex items-center justify-center mb-2"
                        >
                            <UIcon
                                name="ri:map-pin-2-line"
                                class="size-7 text-primary"
                            />
                        </div>
                        <p class="text-xs font-medium">Swaplotting</p>
                    </div> -->
                    <div class="w-full text-center" @click="router.push('/peralihan-hak')">
                        <div
                            class="text-center bg-white rounded-xl w-16 h-16 shadow-sm flex items-center justify-center mb-2">
                            <UIcon name="fluent:people-queue-32-regular" class="size-7 text-primary" />
                        </div>
                        <p class="text-xs font-medium">Peralihan Hak</p>
                    </div>
                    <div class="w-full text-center" @click="router.push('/cari-berkas')">
                        <div
                            class="text-center bg-white rounded-xl w-16 h-16 shadow-sm flex items-center justify-center mb-2">
                            <UIcon name="ri:folder-unknow-line" class="size-7 text-primary" />
                        </div>
                        <p class="text-xs font-medium">Cari Berkas</p>
                    </div>
                    <!-- <div class="w-full text-center">
                        <div
                            class="text-center bg-white rounded-xl w-16 h-16 shadow-sm flex items-center justify-center mb-2"
                        >
                            <UIcon
                                name="ri:shake-hands-line"
                                class="size-7 text-primary"
                            />
                        </div>
                        <p class="text-xs font-medium">Mitra Kerja</p>
                    </div> -->
                </div>
            </div>

            <!-- Menu Laci -->
            <div class="mt-10">
                <h3 class="font-medium">Laci</h3>
                <div class="mt-5 grid grid-cols-4 gap-x-5">
                    <div class="w-full text-center">
                        <div
                            class="text-center bg-white rounded-xl w-16 h-16 shadow-sm flex items-center justify-center mb-2">
                            <UIcon name="ri:file-list-2-line" class="size-7 text-primary" />
                        </div>
                        <p class="text-xs font-medium">Sertifikatku</p>
                    </div>

                    <div class="w-full text-center">
                        <div
                            class="text-center bg-white rounded-xl w-16 h-16 shadow-sm flex items-center justify-center mb-2">
                            <UIcon name="ri:folder-shield-line" class="size-7 text-primary" color="primary" />
                        </div>
                        <p class="text-xs font-medium">Aktaku</p>
                    </div>

                    <div class="w-full text-center">
                        <div
                            class="text-center bg-white rounded-xl w-16 h-16 shadow-sm flex items-center justify-center mb-2">
                            <UIcon name="ri:folder-6-line" class="size-7 text-primary" color="primary" />
                        </div>
                        <p class="text-xs font-medium">Berkasku</p>
                    </div>
                </div>
            </div>

            <!-- Drawer boddy -->
            <template #title>
                <h3 class="px-5 text-xl text-dark-500">Pilih Jenis ID</h3>
            </template>
            <template #body>
                <RouterLink to="/verifikasi-akun?id=e-ktp" class="p-5">
                    <h4 class="font-semibold text-dark-500">
                        e-KTP (Kartu Tanda Penduduk)
                    </h4>
                    <p class="text-sm mt-2">Untuk Warga Indonesia</p>
                </RouterLink>
                <RouterLink to="/verifikasi-akun?id=paspor" class="p-5">
                    <h4 class="font-semibold text-dark-500">
                        Paspor / Kitas (Kartu Izin Terbatas)
                    </h4>
                    <p class="text-sm mt-2">Untuk Warga Indonesia</p>
                </RouterLink>
            </template>
        </UDrawer>
    </MobileLayout>
</template>
