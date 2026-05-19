import { MetaMaskSDK } from '@metamask/sdk';

const mmsdk = new MetaMaskSDK({
  dappMetadata: {
    name: "Jejak Tanahku",
    url: window.location.href,
  }
});

export const ethereum = mmsdk.getProvider();