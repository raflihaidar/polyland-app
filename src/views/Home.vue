<script setup lang="ts">
import { storeToRefs } from "pinia";
import MobileLayout from "@/layouts/Mobile.vue";
import { useAuthStore } from "@/stores/auth.store";
import { useRouter } from "vue-router";
import type { ButtonProps } from "@nuxt/ui";
import { onMounted, ref } from "vue";
import Navigation from "../components/shared/NavMobile.vue";
import { useAccountStore } from "@/stores/account.store";

const store = useAuthStore();
const { user } = storeToRefs(store);

const accountStore = useAccountStore();
const { isAccountVerified } = storeToRefs(accountStore);

const verificationModal = ref(false);
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

const handleClickMenu = (route: string) => {
  if (user.value && !user.value.isVerified) {
    verificationModal.value = true;
    return;
  }
  router.push(route);
};

onMounted(async () => {
  await accountStore.checkAccount();
});
</script>

<template>
  <MobileLayout>
    <UDrawer v-model:open="isDrawerOpen" :overlay="false">
      <UBanner
        class="mb-5 py-3 whitespace-normal [&_.u-button]:w-full sm:[&_.u-button]:w-auto"
        v-if="user && !user.isVerified"
        color="warning"
        :actions="isAccountVerified == 'not found' ? actions : null"
      >
        <template #title>
          <span class="whitespace-normal wrap-break-words">
            {{
              isAccountVerified == "not found"
                ? "Silakan lengkapi data untuk melanjutkan."
                : "Verifikasi Akun anda sedang diproses"
            }}
          </span>
        </template>
      </UBanner>

      <!-- BANNER -->
      <div class="bg-white shadow-sm p-5 rounded-xl text-text">
        <p
          :class="
            user &&
            ((user?.name && user.name.length <= 20) ||
              (user?.username && user.username.length <= 20))
              ? 'text-xl'
              : 'text-lg'
          "
          class="my-2 font-medium text-nowrap truncate"
        >
          {{ user?.name || user?.username }}
        </p>
        <section class="flex items-center gap-x-1">
          <UIcon
            :name="
              user && user.isVerified
                ? 'ri:verified-badge-fill'
                : 'ri:close-circle-fill'
            "
            class="size-4"
            :class="user && user.isVerified ? 'text-success' : 'text-danger'"
          />
          <p class="text-xs text-medium">Perorangan</p>
        </section>
      </div>

      <UModal
        title="Verifikasi Akun Diperlukan"
        v-model:open="verificationModal"
      >
        <!-- Menu Layanan -->
        <div class="mt-10">
          <h3 class="font-medium">Layanan</h3>
          <div class="mt-5 grid grid-cols-4 gap-x-5">
            <div
              class="w-full text-center"
              @click.stop="handleClickMenu('antrian-online')"
            >
              <div
                class="text-center bg-white rounded-xl w-16 h-16 shadow-sm flex items-center justify-center mb-2"
              >
                <UIcon
                  name="fluent:people-queue-32-regular"
                  class="size-7 text-primary"
                />
              </div>
              <p class="text-xs font-medium">Antrian Online</p>
            </div>
            <div
              class="w-full text-center"
              @click.stop="handleClickMenu('/cari-berkas')"
            >
              <div
                class="text-center bg-white rounded-xl w-16 h-16 shadow-sm flex items-center justify-center mb-2"
              >
                <UIcon
                  name="ri:folder-unknow-line"
                  class="size-7 text-primary"
                />
              </div>
              <p class="text-xs font-medium">Cari Berkas</p>
            </div>
          </div>
        </div>

        <!-- Menu Laci -->
        <div class="mt-10">
          <h3 class="font-medium">Laci</h3>
          <div class="mt-5 grid grid-cols-4 gap-x-5">
            <div
              class="w-full text-center"
              @click.stop="handleClickMenu('/sertifikatku')"
            >
              <div
                class="text-center bg-white rounded-xl w-16 h-16 shadow-sm flex items-center justify-center mb-2"
              >
                <UIcon name="ri:file-list-2-line" class="size-7 text-primary" />
              </div>
              <p class="text-xs font-medium">Sertifikatku</p>
            </div>

            <div class="w-full text-center">
              <div
                class="text-center bg-white rounded-xl w-16 h-16 shadow-sm flex items-center justify-center mb-2"
              >
                <UIcon
                  name="ri:folder-shield-line"
                  class="size-7 text-primary"
                  color="primary"
                />
              </div>
              <p class="text-xs font-medium">Aktaku</p>
            </div>

            <div class="w-full text-center">
              <div
                class="text-center bg-white rounded-xl w-16 h-16 shadow-sm flex items-center justify-center mb-2"
              >
                <UIcon
                  name="ri:folder-6-line"
                  class="size-7 text-primary"
                  color="primary"
                />
              </div>
              <p class="text-xs font-medium">Berkasku</p>
            </div>
          </div>
        </div>

        <!-- Body Modal -->
        <template #body>
          <div>
            <h3>
              {{
                isAccountVerified === "not found"
                  ? "Untuk menggunakan layanan ini, silakan lakukan verifikasi akun terlebih dahulu agar dapat melanjutkan proses."
                  : "Akun Anda sedang dalam proses verifikasi. Silakan menunggu hingga proses verifikasi selesai."
              }}
            </h3>
          </div>
          <div v-if="isAccountVerified === 'not found'" class="flex gap-3 mt-4">
            <UButton
              label="Nanti Dulu"
              color="secondary"
              class="text-primary"
              block
              @click="verificationModal = false"
            />
            <UButton
              label="Verifikasi Sekarang"
              color="primary"
              block
              @click="
                verificationModal = false;
                isDrawerOpen = true;
              "
            />
          </div>
        </template>
      </UModal>

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

      <Navigation />
    </UDrawer>
  </MobileLayout>
</template>
