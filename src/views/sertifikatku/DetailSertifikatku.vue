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
import VuePdfEmbed from 'vue-pdf-embed';
import QrcodeVue from 'qrcode.vue';

provide("head-title", "Detail Sertifikat");

const store = useIPFSStore();
const certificateStore = useCertificateStore();
const route = useRoute();
const certificate = ref<null | any>(null);
const pdfUrl = ref<string | null>(null);
const totalPages = ref<number>(0)
const pdfWidth = ref(window.innerWidth - 20)

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

    // const fileUrl = URL.createObjectURL(blob);
    // window.open(fileUrl, "_blank");
    pdfUrl.value = URL.createObjectURL(blob);

  } catch (error: any) {
    console.error("Proses Dekripsi Gagal:", error);

    alert(
      `Gagal membuka file:\n${error?.message || "Kesalahan tidak diketahui"}`,
    );
  } finally {
    isDecrypting.value = false;
  }
};

const handleDocumentLoad = (pdf: any) => {
  totalPages.value = pdf.numPages;
};

onMounted(async () => {
  if (route?.params?.id) {
    const res = await certificateStore.getDetailCertificate(
      route.params.id as string,
    );
    certificate.value = res.data;

      window.addEventListener('resize', () => {
        pdfWidth.value = window.innerWidth - 20
      })
  }
});
</script>
<template>
  <MobileLayout>
    <h3>{{ certificate?.nib || "Belum ada sertifikat" }}</h3>
    <UButton v-if="!pdfUrl" @click="handleViewCertificate" :loading="isDecrypting"
      >Lihat Sertifikat</UButton
    >

    <!-- Viewer Area -->
    <div v-if="pdfUrl" class="pdf-viewer-container">
      <div class="pdf-page-wrapper">
        <!-- Render PDF Halaman 1 -->
        <vue-pdf-embed 
          :source="pdfUrl" 
          :page="1" 
          @loaded="handleDocumentLoad"
          :width="pdfWidth"
        />
      </div>

      <!-- Render Halaman 2 (Jika ada) -->
      <div v-if="totalPages > 1" class="pdf-page-wrapper mt-4">
        <vue-pdf-embed :source="pdfUrl" :page="2" />

        <div class="qr-overlay">
          <qrcode-vue 
            :value="`https://jejak-tanahku.id/verify/${certificate?.tokenId}`" 
            :size="75" 
            level="H" 
          />
        </div>
      </div>
    </div>
  </MobileLayout>
</template>

<style scoped>
.pdf-viewer-container {
  padding: 20px 10px;
  border-radius: 8px;
  margin-top: 1rem;
}

.pdf-page-wrapper {
  position: relative; /* Menjadi jangkar untuk QR Code */
  background: white;
  box-shadow: 0 4px 10px rgba(0,0,0,0.3);
  line-height: 0;
}

.qr-overlay {
  position: absolute;
  bottom: 40px; 
  right: 30px;
  background: white;
  padding: 6px;
  border: 1px solid #e5e7eb;
  text-align: center;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.qr-label {
  display: block;
  font-size: 7px;
  font-weight: 800;
  color: #065f46;
  margin-top: 4px;
  text-transform: uppercase;
}

.qr-token {
  display: block;
  font-size: 6px;
  color: #6b7280;
}
</style>