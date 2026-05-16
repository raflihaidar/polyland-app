<script setup lang="ts">
import { inject, ref, computed } from "vue";
import { useRouter } from "vue-router";
import { useToast } from "@nuxt/ui/runtime/composables/useToast.js";
import { useAccountStore } from "../../../stores/account.store";
import type { VerifikasiSchema } from "../VerifikasiAkun.vue";
import type { Ref } from "vue";
import { PrivateKey } from "eciesjs";
import { keccak256 } from "viem";
import { getAccount, walletClient } from "@/lib/walletClient";

const router = useRouter();
const toast = useToast();
const store = useAccountStore();

const form = inject<Ref<Partial<VerifikasiSchema>>>("verifikasi-form")!;

const publicKey = ref<string | null>(null);
const walletAddress = ref<`0x${string}` | null>(null);
const isConnecting = ref(false);

const isMetaMaskInstalled = computed(
  () => typeof window.ethereum !== "undefined" && window.ethereum.isMetaMask,
);
const isConnected = computed(() => publicKey.value !== null);

const getEncryptionPublicKey = async () => {
  const message = "Otorisasi Kunci Sertifikat Digital Jejak Tanahku";

  const account = await getAccount();

  // 3. Minta Signature menggunakan viem
  const signature = await walletClient().signMessage({
    account: account as `0x${string}`,
    message: message,
  });

  // 4. Hash signature menggunakan keccak256 dari viem untuk entropy 32-byte
  const entropy = keccak256(signature);

  // 5. Generate KeyPair menggunakan eciesjs
  // Hapus '0x' dan ubah ke Buffer
  const privKey = new PrivateKey(Buffer.from(entropy.substring(2), "hex"));

  // Return Public Key dalam format Hex (tanpa 0x biasanya lebih baik untuk eciesjs)
  return {
    key: privKey.publicKey.toHex(),
    account: account,
  };
};

const connectWallet = async (): Promise<void> => {
  if (!isMetaMaskInstalled.value) {
    toast.add({
      title: "MetaMask tidak ditemukan",
      description: "Silahkan install ekstensi MetaMask terlebih dahulu",
      color: "error",
    });
    return;
  }

  isConnecting.value = true;
  try {
    const { key, account } = await getEncryptionPublicKey();
    publicKey.value = key;
    walletAddress.value = account!;

    toast.add({
      title: "Wallet terhubung",
      description: `Berhasil terhubung ke}`,
      color: "success",
    });
  } catch (err: unknown) {
    const error = err as { code?: number; message?: string };
    const message =
      error.code === 4001
        ? "Koneksi ditolak oleh pengguna"
        : (error.message ?? "Gagal menghubungkan wallet");

    toast.add({
      title: "Koneksi gagal",
      description: message,
      color: "error",
    });
  } finally {
    isConnecting.value = false;
  }
};

const submitAll = async (): Promise<void> => {
  if (!publicKey.value) return;

  const payload = {
    ...form.value,
    publicKey: publicKey.value,
    wallet_address: walletAddress.value,
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
</script>

<template>
  <div class="w-full space-y-4">
    <UAlert
      title="Wallet Sign"
      description="Hubungkan wallet MetaMask Anda untuk menandatangani data verifikasi"
      variant="solid"
      class="mb-4"
    />

    <!-- Step 1: Connect Wallet -->
    <div class="space-y-2">
      <div v-if="!isMetaMaskInstalled">
        <p class="text-sm text-red-500">MetaMask belum terpasang.</p>
        <a
          href="https://metamask.io/download/"
          target="_blank"
          class="text-sm text-primary underline"
        >
          Install MetaMask
        </a>
      </div>

      <div v-else-if="isConnected" class="text-sm text-green-600">
        ✓ Berhasil menghubungkan wallet
      </div>

      <UButton
        block
        v-else
        variant="solid"
        icon="token-branded:metamask"
        label="Hubungkan MetaMask"
        :loading="isConnecting"
        @click="connectWallet"
      />
    </div>

    <!-- Submit -->
    <UButton
      label="Kirim Verifikasi"
      :disabled="!isConnected"
      :loading="store.isLoading('SUBMIT_VERIFICATION')"
      block
      class="mt-5"
      @click="submitAll"
    />
  </div>
</template>
