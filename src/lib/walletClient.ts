import { createWalletClient, custom } from "viem";
import { polygonAmoy } from "viem/chains";

export const walletClient = createWalletClient({
  chain: polygonAmoy,
  transport: custom(window.ethereum),
});

export const [account] = await walletClient.getAddresses();
