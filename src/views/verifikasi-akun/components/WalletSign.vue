<script setup lang="ts">
import { inject, ref, computed } from "vue";
import { useRouter } from "vue-router";
import { useToast } from "@nuxt/ui/runtime/composables/useToast.js";
import { useAccountStore } from "../../../stores/account.store";
import type { VerifikasiSchema } from "../VerifikasiAkun.vue";
import type { Ref } from "vue";
import { MetaMaskSDK } from "@metamask/sdk";
import { PrivateKey } from "eciesjs";
import { keccak256 } from "viem";

const router = useRouter();
const toast = useToast();
const store = useAccountStore();

const form = inject<Ref<Partial<VerifikasiSchema>>>("verifikasi-form")!;

const publicKey = ref<string | null>(null);
const walletAddress = ref<`0x${string}` | null>(null);
const isConnecting = ref(false);
const isConnected = computed(() => publicKey.value !== null);

let mmsdk: MetaMaskSDK | null = null;

const getProvider = async () => {
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

const getEncryptionPublicKey = async () => {
  const provider = await getProvider();

  const accounts = (await provider!.request({
    method: "eth_requestAccounts",
  })) as string[];

  const account = accounts[0] as `0x${string}`;
  const message = "Otorisasi Kunci Sertifikat Digital Jejak Tanahku";

  const signature = (await provider!.request({
    method: "personal_sign",
    params: [message, account],
  })) as `0x${string}`;

  const entropy = keccak256(signature);
  const privKey = new PrivateKey(Buffer.from(entropy.substring(2), "hex"));

  return { key: privKey.publicKey.toHex(), account };
};

const connectWallet = async (): Promise<void> => {
  isConnecting.value = true;
  try {
    const { key, account } = await getEncryptionPublicKey();
    publicKey.value = key;
    walletAddress.value = account;

    toast.add({
      title: "Wallet terhubung",
      description: `Berhasil terhubung ke ${account.slice(0, 6)}...${account.slice(-4)}`,
      color: "success",
    });
  } catch (err: unknown) {
    const error = err as { code?: number; message?: string };
    toast.add({
      title: "Koneksi gagal",
      description:
        error.code === 4001
          ? "Koneksi ditolak oleh pengguna"
          : (error.message ?? "Gagal menghubungkan wallet"),
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

    <!-- Connect Wallet -->
    <div class="space-y-2">
      <div v-if="isConnected" class="text-sm text-green-600">
        ✓ Berhasil menghubungkan wallet — {{ walletAddress?.slice(0, 6) }}...{{
          walletAddress?.slice(-4)
        }}
      </div>

      <UButton
        v-else
        block
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
