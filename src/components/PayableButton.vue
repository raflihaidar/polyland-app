<script setup lang="ts">
import { ref } from "vue";
import { createWalletClient, custom } from "viem";
import { polygonAmoy } from "viem/chains";
import CertificateABI from "../abi/certificateNFT.json";
import { useAuthStore } from "../stores/auth.store";
import { storeToRefs } from "pinia";

const paymentContractAddress = import.meta.env.VITE_CONTRACT_ADDRESS;

const store = useAuthStore();
const { address } = storeToRefs(store);
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
            account: account,
            address: paymentContractAddress,
            abi: CertificateABI,
            functionName: "mintCertificate",
            args: [address.value, cid.value],
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
    <UButton
        block
        @click="mint"
        :disabled="loading"
    >
    {{ loading ? "Memproses" : "Bayar Sekarang" }}
    </UButton>
</template>
