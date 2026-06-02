import { getAccount, walletClient } from "./walletClient";

export async function signLoginMessage(message: string, address?: string) {
  // Jika address dioper dari fungsi connectMetaMask, gunakan address tersebut.
  // Jika tidak, baru ambil dari getAccount() sebagai fallback.
  const account = address ? (address as `0x${string}`) : await getAccount();

  if (!account) {
    throw new Error("Account is not defined");
  }

  const client = walletClient();

  // Sekarang client akan meminta signature menggunakan account yang tepat
  const signature = await client.signMessage({
    account,
    message,
  });

  return signature;
}
