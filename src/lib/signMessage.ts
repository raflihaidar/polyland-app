import { getAccount, walletClient } from "./walletClient";

export async function signLoginMessage(message: string) {
  const account = await getAccount();

  if (!account) {
    throw new Error("Account is not defined");
  }

  const client = walletClient();

  const signature = await client.signMessage({
    account,
    message,
  });

  return signature;
}
