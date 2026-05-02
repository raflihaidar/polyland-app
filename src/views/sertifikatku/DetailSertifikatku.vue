<script setup lang="ts">
import MobileLayout from "@/layouts/Mobile.vue";
import { useCertificateStore } from "@/stores/certificate.store";
import { useIPFSStore } from "@/stores/ipfs.store";
import { onMounted, ref, provide } from "vue";
import { useRoute } from "vue-router";
import { account, walletClient } from "@/lib/walletClient";
import { keccak256 } from "viem";
import { decrypt } from "eciesjs";
import { Buffer } from "buffer";

provide("head-title", "Detail Sertifikat");

const store = useIPFSStore();
const certificateStore = useCertificateStore();
const route = useRoute();
const certificate = ref<null | any>(null);

const isDecrypting = ref(false);

if (typeof window !== "undefined" && !(window as any).Buffer) {
  (window as any).Buffer = Buffer;
}

const handleViewCertificate = async () => {
  if (!certificate.value) return;

  try {
    isDecrypting.value = true;

    const metadataResponse = await store.getMetadata(certificate.value.cid);
    const encryptedFileRaw = await store.getEncryptedFile(
      certificate.value.cid,
      certificate.value.code,
    );

    if (!metadataResponse || !encryptedFileRaw) {
      throw new Error("Data IPFS tidak ditemukan");
    }

    // Dapatkan signature user
    const message = "Otorisasi Kunci Sertifikat Digital Jejak Tanahku";

    const signature = await walletClient.signMessage({
      account: account as `0x${string}`,
      message,
    });

    const entropyHex = keccak256(signature);
    const privateKeyBuffer = Buffer.from(entropyHex.slice(2), "hex");

    const encryptedAESKeyBase64 =
      metadataResponse?.recipients?.[0]?.encryptedKey;

    if (!encryptedAESKeyBase64) {
      throw new Error("Encrypted key tidak ditemukan");
    }

    const encryptedKeyBuffer = Buffer.from(encryptedAESKeyBase64, "base64");

    const decryptedAESKeyBuffer = decrypt(privateKeyBuffer, encryptedKeyBuffer);

    if (decryptedAESKeyBuffer.length !== 32) {
      throw new Error("AES Key tidak valid (bukan 32 bytes)");
    }

    const iv = Uint8Array.from(Buffer.from(metadataResponse.aes.iv, "base64"));

    const authTag = Uint8Array.from(
      Buffer.from(metadataResponse.aes.authTag, "base64"),
    );

    const ciphertext = Uint8Array.from(Buffer.from(encryptedFileRaw));

    const encryptedCombined = new Uint8Array(
      ciphertext.length + authTag.length,
    );

    encryptedCombined.set(ciphertext);
    encryptedCombined.set(authTag, ciphertext.length);

    const cryptoKey = await crypto.subtle.importKey(
      "raw",
      decryptedAESKeyBuffer.buffer as ArrayBuffer,
      { name: "AES-GCM" },
      false,
      ["decrypt"],
    );

    // Decrypt
    const decryptedBuffer = await crypto.subtle.decrypt(
      {
        name: "AES-GCM",
        iv,
      },
      cryptoKey,
      encryptedCombined,
    );

    const blob = new Blob([decryptedBuffer], {
      type: "application/pdf",
    });

    const fileUrl = URL.createObjectURL(blob);

    window.open(fileUrl, "_blank");
  } catch (error: any) {
    console.error("Proses Dekripsi Gagal:", error);

    alert(
      `Gagal membuka file:\n${error?.message || "Kesalahan tidak diketahui"}`,
    );
  } finally {
    isDecrypting.value = false;
  }
};

onMounted(async () => {
  if (route?.params?.id) {
    const res = await certificateStore.getDetailCertificate(
      route.params.id as string,
    );
    certificate.value = res.data;
  }
});
</script>
<template>
  <MobileLayout>
    <h3>{{ certificate?.nib || "Belum ada sertifikat" }}</h3>
    <UButton @click="handleViewCertificate" :loading="isDecrypting"
      >Lihat Sertifikat</UButton
    >
  </MobileLayout>
</template>
