import { account, walletClient } from "./walletClient";

export async function signLoginMessage(message: string) {
  if (!account) {
    throw new Error("Account is not defined");
  }

  const signature = await walletClient.signMessage({
    account,
    message,
  });

  return signature;
}
