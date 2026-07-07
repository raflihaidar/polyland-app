import { ref } from "vue";
import { useApiPrivate } from "@/composables/useApi";

const RPC_URL = import.meta.env.VITE_POLYGON_RPC_URL as string;

interface BlockchainStats {
  networkStatus: "connected" | "disconnected";
  chainId: number;
  lastBlockNumber: number;
  lastBlockHash: string;
  totalVerified: number;
  totalOnChain: number;
}

async function rpcCall<T = any>(method: string, params: any[] = []): Promise<T> {
  const res = await fetch(RPC_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: 1,
      method,
      params,
    }),
  });

  if (!res.ok) {
    throw new Error(`RPC error: ${res.status}`);
  }

  const json = await res.json();
  if (json.error) {
    throw new Error(json.error.message ?? "RPC returned an error");
  }
  return json.result as T;
}

export function useBlockchainStatus() {
  const blockchainStats = ref<BlockchainStats>({
    networkStatus: "disconnected",
    chainId: 80002, // default Polygon Amoy
    lastBlockNumber: 0,
    lastBlockHash: "",
    totalVerified: 0,
    totalOnChain: 0,
  });
  const isLoadingBlockchain = ref(true);

  const getNetworkStatus = async () => {
    try {
      // 1. Ambil chain id (hex) -> decimal
      const chainIdHex = await rpcCall<string>("eth_chainId");
      const chainId = parseInt(chainIdHex, 16);

      // 2. Ambil nomor blok terakhir (hex) -> decimal
      const blockNumberHex = await rpcCall<string>("eth_blockNumber");
      const blockNumber = parseInt(blockNumberHex, 16);

      // 3. Ambil detail blok terakhir untuk hash-nya
      const block = await rpcCall<{ hash: string }>("eth_getBlockByNumber", [
        blockNumberHex,
        false, // false = jangan sertakan detail transaksi, cukup hash
      ]);

      blockchainStats.value.networkStatus = "connected";
      blockchainStats.value.chainId = chainId;
      blockchainStats.value.lastBlockNumber = blockNumber;
      blockchainStats.value.lastBlockHash = block?.hash ?? "";
    } catch (error) {
      console.error("Gagal terhubung ke jaringan Polygon:", error);
      blockchainStats.value.networkStatus = "disconnected";
    }
  };

  // totalVerified & totalOnChain TIDAK bisa didapat dari RPC node biasa,
  // karena itu bukan data on-chain generik, melainkan data aplikasi kamu
  // (jumlah sertifikat yang sudah diverifikasi & jumlah yang sudah dicatat on-chain).
  // Sumbernya harus backend kamu sendiri, contoh endpoint:
  // GET /ownership-transfer/dashboard/blockchain-summary/{land_office_id}
  const getBlockchainAppStats = async (landOfficeId?: string) => {
    try {
      const res = await useApiPrivate().get(
        `/ownership-transfer/dashboard/blockchain-summary/${landOfficeId}`,
      );
      const data = res.data?.data;
      if (data) {
        blockchainStats.value.totalVerified = data.total_verified ?? 0;
        blockchainStats.value.totalOnChain = data.total_on_chain ?? 0;
      }
    } catch (error) {
      console.error("Gagal memuat statistik sertifikat blockchain:", error);
    }
  };

  const refreshBlockchainStatus = async (landOfficeId?: string) => {
    isLoadingBlockchain.value = true;
    await Promise.all([
      getNetworkStatus(),
      getBlockchainAppStats(landOfficeId),
    ]);
    isLoadingBlockchain.value = false;
  };

  return {
    blockchainStats,
    isLoadingBlockchain,
    refreshBlockchainStatus,
  };
}