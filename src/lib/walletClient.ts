import { CertificateABI } from "@/configs/abi";
import { createWalletClient, custom, createPublicClient, http } from "viem";
import { polygonAmoy } from "viem/chains";

const RPC_URL = import.meta.env.VITE_RPC_URL;
const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS;

export const walletClient = () => {
  if (typeof window === "undefined" || !window.ethereum) {
    throw new Error("MetaMask not installed");
  }

  return createWalletClient({
    chain: polygonAmoy,
    transport: custom(window.ethereum),
  });
};

export const publicClient = createPublicClient({
  chain: polygonAmoy,
  transport: http(RPC_URL),
});

export const contractConfig = {
  address: CONTRACT_ADDRESS as `0x${string}`,
  abi: CertificateABI,
} as const;

export const getAccount = async () => {
  const client = walletClient();

  const [account] = await client.getAddresses();

  return account;
};
