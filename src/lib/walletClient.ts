import { createWalletClient, custom } from "viem";
import { polygonAmoy } from "viem/chains";

export const walletClient = () => {
  if (typeof window === "undefined" || !window.ethereum) {
    throw new Error("MetaMask not installed");
  }

  return createWalletClient({
    chain: polygonAmoy,
    transport: custom(window.ethereum),
  });
};

export const getAccount = async () => {
  const client = walletClient();

  const [account] = await client.getAddresses();

  return account;
};
