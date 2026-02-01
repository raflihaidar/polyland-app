<script setup lang="ts">
import { ref } from "vue";
import {
  createWalletClient,
  custom,
} from "viem";
import { polygonAmoy } from "viem/chains";
import CertificateABI from "../abi/CertificateNFT.json";
import { useAuthStore } from "../store/auth.store";
import { storeToRefs } from "pinia";

const contractAddress = "0x223F85e402137A9c92c56Afef3BF63335be7922f";

const store = useAuthStore()
const {address} = storeToRefs(store)
const cid = ref("");
const loading = ref(false);
const txHash = ref("");
const error = ref("");

// Mint NFT
const mint = async () => {
  try {
    loading.value = true;
    error.value = "";
    txHash.value = "";

    // 1) Buat wallet client dari MetaMask
    const walletClient = createWalletClient({
      chain: polygonAmoy,
      transport: custom(window.ethereum),
    });

    // 2) Ambil akun yang sedang terkoneksi
    const [account] = await walletClient.requestAddresses();

    // 3) Panggil fungsi mint() di smart contract
    const hash = await walletClient.writeContract({
      account : account,
      address: contractAddress,
      abi: CertificateABI,
      functionName: "mintCertificate",
      args: [address.value, cid.value],
    //   value: parseEther("0.001"), // jika contract ada payable
    });

    txHash.value = hash;
  } catch (err: any) {
    error.value = err.message || String(err);
  } finally {
    loading.value = false;
  }
};
</script>

<template>
    <div class="p-4 border rounded">
        <h2 class="text-xl font-semibold mb-4">Penerbitan Sertifikat</h2>

        <div class="space-y-3">
            <input v-model="cid" placeholder="CID IPFS" class="border p-2 w-full" />

            <button @click="mint" :disabled="loading" class="px-4 py-2 bg-blue-600 text-white rounded">
                {{ loading ? "Menerbitkan..." : "Terbitkan Sertifikat" }}
            </button>
        </div>

        <div v-if="txHash" class="mt-4 text-green-600">
            <p>Transaksi terkirim!</p>
            <p>
                Hash:
                <a :href="`https://amoy.polygonscan.com/tx/${txHash}`" target="_blank" class="underline">
                    {{ txHash }}
                </a>
            </p>
        </div>

        <p v-if="error" class="mt-3 text-red-600">{{ error }}</p>
    </div>
</template>