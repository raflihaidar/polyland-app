const addNftToWallet = async (
contractAddress: string,
tokenId: string
) => {
if (!window.ethereum) {
throw new Error("MetaMask tidak ditemukan");
}

try {
const wasAdded = await window.ethereum.request({
method: "wallet_watchAsset",
params: {
type: "ERC721",
options: {
address: contractAddress,
tokenId,
},
},
});

    if (wasAdded) {
      console.log("NFT berhasil ditambahkan");
    } else {
      console.log("User membatalkan");
    }

} catch (error) {
console.error(error);
}
};

const importNFTToMetamask = async () => {
if (typeof window.ethereum !== "undefined") {
try {
const wasAdded = await window.ethereum.request({
method: "wallet_watchAsset",
params: {
type: "ERC721", // Supported asset type for NFTs
options: {
address: "0xYourNFTContractAddress",
symbol: "SYMBOL", // Collection ticker/symbol (up to 5 chars)
tokenId: "1234", // Specific Token ID of your NFT
image: "https://your-image-url.com", // Optional preview URL
decimals: 0 // MUST be 0 for NFTs
},
},
});

      if (wasAdded) {
        console.log("NFT successfully imported!");
      } else {
        console.log("User rejected the NFT import.");
      }
    } catch (error) {
      console.log(error);
    }

} else {
console.log("MetaMask is not installed!");
}
};

    <!-- Statistik Antrian Online -->
    <UCard>
      <template #header>
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <UIcon name="i-tabler-users-group" class="size-5 text-primary" />
            <span class="font-semibold text-highlighted">
              Statistik Antrian Online
            </span>
          </div>
          <UBadge color="success" variant="subtle" class="gap-1">
            <UIcon name="i-tabler-circle-filled" class="size-2" />
            Live
          </UBadge>
        </div>
      </template>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <!-- Nomor antrian saat ini -->
        <div
          class="flex flex-col items-center justify-center gap-2 p-4 rounded-lg bg-primary/5 border border-primary/20"
        >
          <span class="text-xs text-muted">Sedang Dilayani</span>
          <span class="text-3xl font-bold text-primary font-mono">
            {{ queueStats.currentNumber || "-" }}
          </span>
          <span class="text-xs text-muted">
            Berikutnya:
            <span class="font-semibold text-highlighted">
              {{ queueStats.nextNumber || "-" }}
            </span>
          </span>
        </div>

        <!-- Ringkasan angka -->
        <div class="flex flex-col gap-3 md:col-span-2">
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div class="flex flex-col gap-1">
              <span class="text-xs text-muted">Total Hari Ini</span>
              <span class="text-lg font-bold text-highlighted">
                {{ queueStats.totalToday }}
              </span>
            </div>
            <div class="flex flex-col gap-1">
              <span class="text-xs text-muted">Menunggu</span>
              <span class="text-lg font-bold text-warning">
                {{ queueStats.waiting }}
              </span>
            </div>
            <div class="flex flex-col gap-1">
              <span class="text-xs text-muted">Dilayani</span>
              <span class="text-lg font-bold text-info">
                {{ queueStats.serving }}
              </span>
            </div>
            <div class="flex flex-col gap-1">
              <span class="text-xs text-muted">Selesai</span>
              <span class="text-lg font-bold text-success">
                {{ queueStats.completed }}
              </span>
            </div>
          </div>

          <div class="flex items-center gap-2 pt-3 border-t border-default">
            <UIcon name="i-tabler-clock-hour-3" class="size-4 text-muted" />
            <span class="text-sm text-muted">
              Rata-rata waktu tunggu:
              <span class="font-semibold text-highlighted">
                {{ queueStats.avgWaitMinutes }} menit
              </span>
            </span>
          </div>
        </div>
      </div>
    </UCard>



        <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <!-- Status Jaringan Blockchain (Polygon) -->
      <UCard class="lg:col-span-1">
        <template #header>
          <div class="flex items-center gap-2">
            <UIcon name="i-tabler-cube" class="size-5 text-primary" />
            <span class="font-semibold text-highlighted">
              Status Jaringan Blockchain
            </span>
          </div>
        </template>

        <div class="flex flex-col gap-4">
          <div class="flex items-center justify-between">
            <span class="text-sm text-muted">Jaringan</span>
            <UBadge color="primary" variant="subtle">
              {{ networkLabel }}
            </UBadge>
          </div>

          <div class="flex items-center justify-between">
            <span class="text-sm text-muted">Status Koneksi</span>
            <UBadge
              :color="
                blockchainStats.networkStatus === 'connected'
                  ? 'success'
                  : 'error'
              "
              variant="subtle"
              class="gap-1"
            >
              <UIcon
                :name="
                  blockchainStats.networkStatus === 'connected'
                    ? 'i-tabler-plug-connected'
                    : 'i-tabler-plug-connected-x'
                "
                class="size-3.5"
              />
              {{
                blockchainStats.networkStatus === "connected"
                  ? "Terhubung"
                  : "Terputus"
              }}
            </UBadge>
          </div>

          <div class="flex items-center justify-between">
            <span class="text-sm text-muted">Sertifikat Terverifikasi</span>
            <span class="text-sm font-semibold text-highlighted">
              {{ blockchainStats.totalVerified }}
            </span>
          </div>

          <div class="flex items-center justify-between">
            <span class="text-sm text-muted">Tercatat On-Chain</span>
            <span class="text-sm font-semibold text-highlighted">
              {{ blockchainStats.totalOnChain }}
            </span>
          </div>

          <div class="flex flex-col gap-1 pt-2 border-t border-default">
            <span class="text-xs text-muted">Blok Terakhir</span>
            <div class="flex items-center gap-1.5">
              <UIcon
                name="i-tabler-link"
                class="size-3.5 text-muted shrink-0"
              />
              <span class="text-xs font-mono truncate text-highlighted">
                #{{ blockchainStats.lastBlockNumber || "-" }}
              </span>
            </div>
            <span
              class="text-xs font-mono truncate text-muted"
              :title="blockchainStats.lastBlockHash"
            >
              {{ blockchainStats.lastBlockHash || "-" }}
            </span>
          </div>

          <UButton
            icon="i-tabler-external-link"
            label="Lihat di Polygonscan"
            variant="ghost"
            size="sm"
            block
            :to="polygonscanUrl"
            target="_blank"
          />
        </div>
      </UCard>

      <!-- Distribusi Status Permohonan -->
      <UCard class="lg:col-span-2">
        <template #header>
          <div class="flex items-center gap-2">
            <UIcon name="i-tabler-chart-bar" class="size-5 text-primary" />
            <span class="font-semibold text-highlighted">
              Distribusi Status Permohonan
            </span>
          </div>
        </template>

        <div class="flex flex-col gap-3">
          <div
            v-for="item in visibleDistribution"
            :key="item.status"
            class="flex items-center gap-3"
          >
            <span class="text-xs w-40 shrink-0 truncate text-muted">
              {{ statusLabel[item.status] ?? item.status }}
            </span>
            <div class="flex-1 h-2.5 rounded-full bg-elevated overflow-hidden">
              <div
                class="h-full rounded-full transition-all"
                :class="`bg-${statusColor[item.status] ?? 'neutral'}-500`"
                :style="{ width: `${(item.count / getMaxCount()) * 100}%` }"
              />
            </div>
            <span class="text-xs w-8 text-right font-medium text-highlighted">
              {{ item.count }}
            </span>
          </div>

          <div
            v-if="!isLoading && !visibleDistribution.length"
            class="text-sm text-muted text-center py-6"
          >
            Belum ada data permohonan
          </div>
        </div>
      </UCard>
    </div>
