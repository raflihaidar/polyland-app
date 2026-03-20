<script setup lang="ts">
import { ref } from "vue"
import {
  createWalletClient,
  createPublicClient,
  custom,
  http,
  parseUnits
} from "viem"
import { polygonAmoy } from "viem/chains"
import PaymentABI from "../abi/applicationPayment.json"
import MobileLayout from "@/layouts/mobile.vue"

const contractAddress = import.meta.env.VITE_PAYMENT_CONTRACT_ADDRESS_V4

const kantahCode = ref("")
const price = ref("") // harga tanah per m2
const registrationFee = ref("") // biaya registrasi per kantah

const loading = ref(false)
const error = ref("")
const success = ref("")

const publicClient = createPublicClient({
  chain: polygonAmoy,
  transport: http()
})

function toBytes32(str: string) {
  const encoder = new TextEncoder()
  const bytes = encoder.encode(str)
  if (bytes.length > 32) throw new Error("String terlalu panjang untuk bytes32")
  const padded = new Uint8Array(32)
  padded.set(bytes)
  return '0x' + Array.from(padded).map(b => b.toString(16).padStart(2, '0')).join('')
}

const setFee = async () => {
  try {
    loading.value = true
    error.value = ""
    success.value = ""

    if (!kantahCode.value) throw new Error("Kode kantah wajib diisi")
    if (!price.value) throw new Error("Harga tanah wajib diisi")
    if (!registrationFee.value) throw new Error("Biaya registrasi wajib diisi")

    // wallet client metamask
    const walletClient = createWalletClient({
      chain: polygonAmoy,
      transport: custom(window.ethereum)
    })

    // ambil account metamask
    const [account] = await walletClient.requestAddresses()

    const kantahCodeBytes32 = toBytes32(kantahCode.value.trim())
    const decimals = 6

    // estimate gas
    const gas = await publicClient.estimateContractGas({
      account,
      address: contractAddress,
      abi: PaymentABI,
      functionName: "setKantahFee",
      args: [
        kantahCodeBytes32,
        parseUnits(price.value.trim(), decimals),
        parseUnits(registrationFee.value.trim(), decimals)
      ]
    })

    // kirim transaksi
    const hash = await walletClient.writeContract({
      account,
      address: contractAddress,
      abi: PaymentABI,
      functionName: "setKantahFee",
      args: [
        kantahCodeBytes32,
        parseUnits(price.value.trim(), decimals),
        parseUnits(registrationFee.value.trim(), decimals)
      ],
      gas
    })

    const receipt = await publicClient.waitForTransactionReceipt({ hash })
    success.value = `Transaksi sukses di block ${receipt.blockNumber}`

  } catch (err: any) {
    error.value = err.message || String(err)
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <MobileLayout>
    <div class="space-y-4 max-w-md">

      <UInput v-model="kantahCode" placeholder="Kode Kantah" class="w-full" />

      <UInput v-model="price" placeholder="Harga tanah per meter (ETH)" class="w-full" />

      <UInput v-model="registrationFee" placeholder="Biaya registrasi (ETH)" class="w-full" />

      <UButton block :loading="loading" @click="setFee">
        {{ loading ? "Memproses..." : "Set Fee Kantah" }}
      </UButton>

      <p v-if="error" class="text-red-500">
        {{ error }}
      </p>

      <p v-if="success" class="text-green-500 break-all">
        {{ success }}
      </p>

    </div>
  </MobileLayout>
</template>