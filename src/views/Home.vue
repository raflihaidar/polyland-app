<script setup lang="ts">
import { storeToRefs } from "pinia";
import { useAuthStore } from "@/stores/auth.store";
import { useRouter } from "vue-router";
import type { ButtonProps } from "@nuxt/ui";
import { onMounted, ref } from "vue";
import { useAccountStore } from "@/stores/account.store";
import BaseNews from "@/components/BaseNews.vue";

const store = useAuthStore();
const { user } = storeToRefs(store);

const accountStore = useAccountStore();
const { isAccountVerified } = storeToRefs(accountStore);

const verificationModal = ref(false);
const router = useRouter();

const goToVerifikasiAkun = () => {
  router.push(`/verifikasi-akun/${user.value?.id}`);
};

const actions = ref<ButtonProps[]>([
  {
    label:
      isAccountVerified.value !== "REJECTED" ? "Verifikasi" : "Ajukan Ulang",
    color: "secondary",
    class: "text-black",
    onClick: goToVerifikasiAkun,
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
  <UBanner
    class="mb-5 py-3 flex whitespace-normal [&_.u-button]:w-full sm:[&_.u-button]:w-auto"
    v-if="user && !user.isVerified"
    :color="isAccountVerified == 'REJECTED' ? 'primary' : 'warning'"
    :actions="
      isAccountVerified == 'not found' || isAccountVerified == 'REJECTED'
        ? actions
        : null
    "
  >
    <template #title>
      <span class="whitespace-normal wrap-break-words mr-3">
        {{
          isAccountVerified == "not found"
            ? "Silakan lengkapi data untuk melanjutkan."
            : isAccountVerified == "REJECTED"
              ? "Verifikasi akun anda ditolak."
              : "Verifikasi Akun anda sedang diproses"
        }}
      </span>
    </template>
  </UBanner>

  <!-- News -->
  <BaseNews />

  <!-- BANNER -->
  <div
    class="bg-white shadow-sm p-5 mt-5 rounded-xl text-text flex items-center justify-between cursor-pointer"
  >
    <section class="flex items-center gap-x-3">
      <UAvatar icon="tabler:user" size="3xl" loading="lazy" />
      <div class="w-full min-w-0">
        <p
          :class="user && user?.name && user.name.length <= 20 ? 'text-lg' : ''"
          class="my-1 font-medium truncate w-full"
        >
          {{ user?.name }}
        </p>
        <section class="flex items-center gap-x-1">
          <UIcon
            :name="
              user && user.isVerified
                ? 'tabler:circle-check-filled'
                : 'ri:close-circle-fill'
            "
            class="size-6"
            :class="user && user.isVerified ? 'text-success' : 'text-danger'"
          />
          <p class="text-sm text-medium">Perorangan</p>
        </section>
      </div>
    </section>
    <!-- <UIcon name="tabler:chevron-right-filled" class="size-6" /> -->
  </div>

  <UModal title="Verifikasi Akun Diperlukan" v-model:open="verificationModal">
    <!-- Menu Layanan -->
    <div class="mt-10">
      <h3 class="font-medium">Layanan</h3>
      <div class="mt-5 flex justify-start gap-x-5">
        <div
          class="text-center flex flex-col items-center cursor-pointer"
          @click.stop="handleClickMenu('antrian-online')"
        >
          <div
            class="text-center bg-white rounded-xl w-16 h-16 shadow-sm flex items-center justify-center mb-2"
          >
            <UIcon name="tabler:users" class="size-8 text-primary" />
          </div>
          <p class="text-sm font-medium">Antrian Online</p>
        </div>
        <div
          class="text-center flex flex-col items-center cursor-pointer"
          @click.stop="handleClickMenu('/cari-berkas')"
        >
          <div
            class="text-center bg-white rounded-xl w-16 h-16 shadow-sm flex items-center justify-center mb-2"
          >
            <UIcon name="ri:folder-unknow-line" class="size-8 text-primary" />
          </div>
          <p class="text-sm font-medium">Cari Berkas</p>
        </div>
      </div>
    </div>

    <!-- Menu Laci -->
    <div class="mt-10">
      <h3 class="font-medium">Laci</h3>
      <div class="mt-5 flex gap-x-5">
        <div
          class="w-full text-center flex items-center justify-between bg-white rounded-xl shadow-sm px-5 py-4 cursor-pointer"
          @click.stop="handleClickMenu('/sertifikatku')"
        >
          <section class="flex justify-between items-center gap-x-5">
            <div class="text-center bg-primary/10 rounded-lg p-2">
              <UIcon
                name="tabler:file-certificate"
                class="size-8 text-primary"
              />
            </div>
            <p class="text-sm font-medium">Sertifikatku</p>
          </section>
          <section>
            <UIcon name="tabler:chevron-right-filled" class="size-6" />
          </section>
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
          @click="goToVerifikasiAkun"
        />
      </div>
    </template>
  </UModal>
</template>
