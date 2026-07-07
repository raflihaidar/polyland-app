<script setup lang="ts">
import { useCertificateStore } from "@/stores/certificate.store";
import { useIPFSStore } from "@/stores/ipfs.store";
import { onMounted, ref, provide, nextTick } from "vue";
import { useRoute } from "vue-router";
import { getAccount, walletClient } from "@/lib/walletClient";
import { keccak256 } from "viem";
import { decrypt } from "eciesjs";
import { Buffer } from "buffer";
import type { CertificateDetail, CertificateType } from "@/types";
import { formatDateIndonesia } from "@/utils/formatter";
import PdfViewer from "./components/PdfViewer.vue";
import { useApiPrivate } from "@/composables/useApi";
import { useToast } from "@nuxt/ui/runtime/composables/useToast.js";

provide("head-title", "Detail Sertifikat");

const api = useApiPrivate();
const store = useIPFSStore();
const certificateStore = useCertificateStore();
const route = useRoute();
const certificate = ref<CertificateDetail | null>(null);
const pdfUrl = ref<string | null>(null);
const currentPage = ref<number>(1);
const isDecrypting = ref(false);
const pdfContainer = ref<HTMLElement | null>(null);
const baseWidth = ref(0);
const modalLabel = ref(false);
const tempLabel = ref("");
const isImportingNFT = ref(false);
const toast = useToast();

if (typeof window !== "undefined" && !(window as any).Buffer) {
  (window as any).Buffer = Buffer;
}

const typeMapping = (type: CertificateType) => {
  if (type === "SHM") return "Hak Milik";
  else if (type === "SHGB") return "Hak Guna Bangunan";
  else if (type === "SHGU") return "Hak Guna Usaha";
};

const updateWidth = () => {
  if (pdfContainer.value) {
    baseWidth.value = pdfContainer.value.clientWidth;
  } else {
    baseWidth.value = window.innerWidth - 32;
  }
};

const openModal = () => {
  if (certificate.value && certificate.value.label) {
    tempLabel.value = certificate.value.label;
    modalLabel.value = true;
  } else {
    modalLabel.value = true;
  }
};

const updateLabel = async () => {
  if (!certificate.value) return;

  try {
    await api.put(`/certificate/${certificate.value.id}`, {
      label: tempLabel.value,
    });

    const res = await certificateStore.getDetailCertificate(
      route.params.id as string,
    );
    certificate.value = res.data;
  } catch (error: any) {
    toast.add({
      title: "Gagal mengupdate label",
      description:
        error.response.data.message || "Terjadi kesalahan saat update label",
      color: "error",
    });
  } finally {
    modalLabel.value = false;
  }
};

const closeModal = () => {
  tempLabel.value = "";
  modalLabel.value = false;
};

const importNFTToMetamask = async () => {
  if (typeof window === "undefined" || typeof window.ethereum === "undefined") {
    toast.add({
      title: "MetaMask tidak ditemukan",
      description: "Silakan install ekstensi MetaMask terlebih dahulu",
      color: "error",
    });
    return;
  }

  if (!certificate.value) return;

  try {
    isImportingNFT.value = true;

    // Ambil token_id dari endpoint certificate
    const res = await api.get(`/certificate/${certificate.value.id}`);

    console.log("res : ", res.data);

    const tokenId = res?.data?.data?.token_id;

    if (!tokenId) {
      throw new Error("Token ID tidak ditemukan untuk sertifikat ini");
    }

    const contractAddress = import.meta.env.VITE_CONTRACT_ADDRESS;

    if (!contractAddress) {
      throw new Error("Contract address tidak ditemukan pada konfigurasi env");
    }

    const wasAdded = await window.ethereum.request({
      method: "wallet_watchAsset",
      params: {
        type: "ERC721",
        options: {
          address: contractAddress,
          symbol: "TNH",
          tokenId: String(tokenId),
          decimals: 0,
        },
      },
    });

    if (wasAdded) {
      toast.add({
        title: "Berhasil",
        description: "NFT berhasil ditambahkan ke MetaMask",
        color: "success",
      });
    } else {
      toast.add({
        title: "Dibatalkan",
        description: "Anda menolak proses import NFT",
        color: "warning",
      });
    }
  } catch (error: any) {
    console.error("Import NFT gagal:", error);
    toast.add({
      title: "Gagal menambahkan NFT",
      description:
        error?.response?.data?.message ||
        error?.message ||
        "Terjadi kesalahan saat menambahkan NFT ke MetaMask",
      color: "error",
    });
  } finally {
    isImportingNFT.value = false;
  }
};

const handleViewCertificate = async () => {
  if (!certificate.value) return;

  try {
    isDecrypting.value = true;

    if (!certificate.value.cid) return;

    const metadataResponse = await store.getMetadata(certificate.value.cid);
    const encryptedFileRaw = await store.getEncryptedFile(
      certificate.value.cid,
      certificate.value.code,
    );

    if (!metadataResponse || !encryptedFileRaw) {
      throw new Error("Data IPFS tidak ditemukan");
    }

    const account = await getAccount();

    const message = "Otorisasi Kunci Sertifikat Digital Jejak Tanahku";
    const signature = await walletClient().signMessage({
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

    const decryptedBuffer = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv },
      cryptoKey,
      encryptedCombined,
    );

    const blob = new Blob([decryptedBuffer], { type: "application/pdf" });
    pdfUrl.value = URL.createObjectURL(blob);
    currentPage.value = 1;
    await nextTick();
    updateWidth();
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

  nextTick(() => {
    updateWidth();
  });

  window.addEventListener("resize", updateWidth);
  window.addEventListener("orientationchange", () => {
    setTimeout(updateWidth, 200);
  });
});
</script>

<template>
  <!-- Loading -->
  <div
    v-if="certificateStore.isLoading('FETCH_DETAIL')"
    class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
  >
    <UIcon name="tabler:loader-2" class="size-6 animate-spin text-primary" />
  </div>

  <div v-if="certificate">
    <div v-if="!pdfUrl">
      <div
        class="bg-white rounded-xl p-5 shadow-border flex justify-between items-center mb-5"
      >
        <section>
          <div class="text-primary flex items-center gap-x-2">
            <p class="font-semibold">
              {{ certificate.label || "Tambahkan label" }}
            </p>
            <UIcon
              @click="openModal"
              name="tabler:edit-filled"
              class="size-5 cursor-pointer m-0 p-0"
            />
          </div>
          <h3 class="text-sm font-medium">
            {{ certificate?.nib }}
          </h3>
        </section>

        <section>
          <div class="w-14 h-14">
            <img src="@/assets/logo-garuda.png" alt="" class="w-full" />
          </div>
        </section>
      </div>

      <div class="bg-white rounded-xl p-5 shadow-border mb-5">
        <section class="text-center mb-5">
          <h3 class="font-semibold">Otentikasi Kepemilikan</h3>
          <p class="text-sm mt-2">
            Hubungkan wallet untuk membuka akses penuh dokumen
          </p>
        </section>
        <section
          class="w-full h-48 border bg-secondary border-orange-300 rounded-2xl flex flex-col justify-center items-center p-5 gap-y-5"
        >
          <div
            class="bg-white shadow-border rounded-full w-14 h-14 flex justify-center items-center"
          >
            <UIcon name="tabler:lock" class="size-6" />
          </div>
          <UButton
            icon="token-branded:metamask"
            @click="handleViewCertificate"
            :loading="isDecrypting"
            block
          >
            {{ isDecrypting ? "Memproses..." : "Tanda tangani digital" }}
          </UButton>
        </section>
      </div>

      <!-- Import NFT ke MetaMask -->
      <div class="bg-white rounded-xl p-5 shadow-border mb-5">
        <section class="text-center mb-5">
          <h3 class="font-semibold">Sertifikat NFT</h3>
          <p class="text-sm mt-2">
            Tambahkan sertifikat ini sebagai NFT ke wallet MetaMask Anda
          </p>
        </section>
        <UButton
          icon="token-branded:metamask"
          color="neutral"
          variant="outline"
          @click="importNFTToMetamask"
          :loading="isImportingNFT"
          block
        >
          {{ isImportingNFT ? "Menambahkan..." : "Tambahkan ke MetaMask" }}
        </UButton>
      </div>

      <div class="flex justify-between w-full items-center gap-x-5">
        <div
          class="bg-white rounded-xl p-5 shadow-border mb-5 w-full min-h-32 flex flex-col justify-center"
        >
          <UIcon name="tabler:calendar" class="size-6 text-primary mb-2" />
          <h3 class="font-medium text-sm text-gray-500">Tanggal Terbit</h3>
          <p class="text-sm font-medium">
            {{ formatDateIndonesia(certificate.createdAt) }}
          </p>
        </div>

        <div
          class="bg-white rounded-xl p-5 shadow-border mb-5 w-full min-h-32 flex flex-col justify-center"
        >
          <UIcon
            name="tabler:file-certificate"
            class="size-6 text-primary mb-2"
          />
          <h3 class="font-medium text-sm text-gray-500">Jenis Hak</h3>
          <p class="text-sm font-medium">{{ typeMapping(certificate.type) }}</p>
        </div>
      </div>
    </div>

    <div v-else>
      <PdfViewer :pdfUrl="pdfUrl" />
    </div>
  </div>
  <section
    v-if="!certificateStore.isLoading('FETCH_DETAIL') && !certificate"
    class="mt-5"
  >
    <UEmpty
      icon="tabler:error-404"
      title="Sertifikat tidak ditemukan"
      description="Sertifikat yang diminta tidak tersedia atau telah dihapus."
    />
  </section>
  <UModal v-model:open="modalLabel">
    <template #title>
      <h3>Tambahkan label</h3>
    </template>

    <template #body>
      <UInput v-model="tempLabel" class="w-full" />
    </template>

    <template #footer>
      <div class="flex justify-end w-full gap-x-5">
        <UButton
          label="Batal"
          color="neutral"
          variant="outline"
          @click="closeModal"
        />
        <UButton label="Update" @click="updateLabel" />
      </div>
    </template>
  </UModal>
</template>

<style scoped>
:deep(.vpv-variables) {
  --vpv-container-width-sm: 0px;
}
</style>
