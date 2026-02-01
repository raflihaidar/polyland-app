import type { Web3AuthContextConfig } from "@web3auth/modal";
import { WEB3AUTH_NETWORK, type Web3AuthOptions } from "@web3auth/modal";

const web3AuthOptions: Web3AuthOptions = {
  clientId:
    "BPM5nmVV7GuFWZ6fXDy4sUQXjIi6E6gEAG-FOJ_9vR6FJkhQpCKUnz4zYU1wMCP0zlezXc_OIf9CC0p2QnSAXAk",
  web3AuthNetwork: WEB3AUTH_NETWORK.SAPPHIRE_DEVNET,
};

const web3AuthContextConfig: Web3AuthContextConfig = {
  web3AuthOptions,
};

export default web3AuthContextConfig;
