<script setup lang="ts">
import { inject, ref, computed, onMounted, onUnmounted } from "vue";
import { useRouter } from "vue-router";
import { useToast } from "@nuxt/ui/runtime/composables/useToast.js";
import { useAccountStore } from "../../../stores/account.store";
import type { VerifikasiSchema } from "../VerifikasiAkun.vue";
import type { Ref } from "vue";
import { MetaMaskSDK } from "@metamask/sdk";
import { PrivateKey } from "eciesjs";
import { hexToBytes, keccak256 } from "viem";
import { hkdf } from "@noble/hashes/hkdf.js";
import { sha256 } from "@noble/hashes/sha2.js";
import { useAuthStore } from "@/stores/auth.store";

const router = useRouter();
const toast = useToast();
const store = useAccountStore();
const authStore = useAuthStore();

const form = inject<Ref<Partial<VerifikasiSchema>>>("verifikasi-form")!;

const walletAddress = ref<`0x${string}` | null>(null);
const isConnecting = ref(false);
const isConnected = computed(() => form.value.publicKey !== "");

let mmsdk: MetaMaskSDK | null = null;

const getProvider = async () => {
  if (typeof window !== "undefined" && window.ethereum) {
    return window.ethereum;
  }

  // Lazy-load SDK jika di lingkungan client browser
  if (!mmsdk && typeof window !== "undefined") {
    mmsdk = new MetaMaskSDK({
      dappMetadata: {
        name: "Jejak Tanahku",
        url: window.location.href,
      },
    });
  }

  if (mmsdk) {
    await mmsdk.connect();
    return mmsdk.getProvider();
  }

  throw new Error("MetaMask Provider tidak ditemukan");
};

const handleAccountsChanged = async (accounts: string[]) => {
  try {
    if (!accounts.length) {
      form.value.publicKey = "";
      walletAddress.value = null;

      toast.add({
        title: "Wallet terputus",
        description: "Tidak ada akun yang terhubung",
        color: "warning",
      });

      return;
    }

    const provider = await getProvider();

    const { key } = await getEncryptionPublicKey(provider);

    form.value.publicKey = key;
  } catch (error) {}
};

const getEncryptionPublicKey = async (provider: any) => {
  const message =
    "Otorisasi Kunci Sertifikat Tanah Elektronik oleh Jejak Tanahku";

  const signature = (await provider.request({
    method: "personal_sign",
    params: [message, authStore.address],
  })) as `0x${string}`;

  // Menghasilkan 32-byte entropy yang jauh lebih tahan manipulasi
  const salt = new TextEncoder().encode("JejakTanahku-Salt-v1");
  const derivedKeyBytes = hkdf(
    sha256,
    hexToBytes(signature),
    salt,
    undefined,
    32,
  );

  // 2. Bangkitkan Private Key instans sementara dari Derived Bytes
  const privKey = new PrivateKey(Buffer.from(derivedKeyBytes));

  // 3. Ambil PUBLIC KEY-nya saja
  const encryptionPublicKey = privKey.publicKey.toHex();

  return {
    key: encryptionPublicKey,
  };
};

const connectWallet = async () => {
  isConnecting.value = true;

  try {
    const provider = await getProvider();

    const { status, message } = await authStore.connectMetaMask(provider);

    if (status !== "success") {
      console.log(message);
    }

    const { key } = await getEncryptionPublicKey(provider);

    form.value.publicKey = key;
  } catch (err: any) {
    toast.add({
      title: "Koneksi gagal",
      description: err.message,
      color: "error",
    });
  } finally {
    isConnecting.value = false;
  }
};

const submitAll = async (): Promise<void> => {
  if (form.value.publicKey === "") return;

  const payload = {
    ...form.value,
    wallet_address: authStore.address,
  };

  const { status, message } = await store.submitVerification(
    payload as VerifikasiSchema,
  );

  if (status === "error") {
    toast.add({
      title: "Verifikasi gagal",
      description: message,
      color: "error",
    });
  } else {
    router.push("/verifikasi-akun/konfirmasi");
  }
};

onMounted(async () => {
  try {
    const provider = await getProvider();

    provider.on("accountsChanged", handleAccountsChanged);
  } catch (error) {}
});

onUnmounted(async () => {
  try {
    const provider = await getProvider();

    provider.removeListener("accountsChanged", handleAccountsChanged);
  } catch (error) {}
});
</script>

<template>
  <div class="w-full space-y-4">
    <UAlert
      icon="i-heroicons-shield-check"
      title="Pembuatan Kunci Sertifikat Digital"
      description="Tanda tangani permintaan di MetaMask untuk membuat kunci digital pribadi Anda. Kunci ini memastikan dokumen sertifikat hanya dapat dibuka dan dibaca oleh Anda."
      variant="solid"
      color="primary"
      class="mb-4"
    />

    <!-- Connect Wallet -->
    <div class="space-y-2">
      <UAlert
        v-if="isConnected"
        title="Kunci sertifikat berhasil dibuat!"
        icon="tabler:circle-check"
        color="success"
        class="mb-4"
      />

      <UButton
        v-else
        block
        variant="solid"
        icon="token-branded:metamask"
        :label="'Buat Kunci Sertifikat'"
        :loading="isConnecting"
        @click="connectWallet"
      />
    </div>

    <div class="mt-5 flex items-center gap-x-3">
      <UButton block variant="outline" label="Kembali" @click="router.back()" />
      <!-- Submit -->
      <UButton
        block
        label="Kirim"
        :disabled="!isConnected"
        :loading="store.isLoading('SUBMIT_VERIFICATION')"
        @click="submitAll"
      />
    </div>
  </div>
</template>
