<script setup lang="ts">
import { ref } from "vue";
import { useAuthStore } from "../../stores/auth.store";
import { storeToRefs } from "pinia";
import { useRouter } from "vue-router";
import type { FormSubmitEvent } from "@nuxt/ui";
import { MetaMaskSDK } from "@metamask/sdk";
import * as z from "zod";
import { PrivateKey } from "eciesjs";
import { Buffer } from "buffer";
import { keccak256 } from "viem";
import { account, walletClient } from "@/lib/walletClient";
import MobileLayout from "@/layouts/Mobile.vue";

const error = ref<string | null>(null);
const store = useAuthStore();
const { isAuthenticated, isMetaMaskSupported } = storeToRefs(store);
const router = useRouter();
const form = ref<Partial<Schema>>({
  email: "",
  password: "",
});
const rememberMe = ref<boolean>(false);
const alert = ref<{ show: boolean; message: string }>({
  show: false,
  message: "",
});
const show = ref<boolean>(false);
const schema = z.object({
  email: z.email("Email tidak valid").trim(),
  password: z.string().trim(),
});
type Schema = z.output<typeof schema>;

const mmsdk = new MetaMaskSDK({
  dappMetadata: {
    name: "Jejak Tanahku",
    url: window.location.href,
  },
});

const getProvider = async () => {
  if (typeof window !== "undefined" && window.ethereum) {
    return window.ethereum;
  }

  // fallback ke SDK (mobile / PWA)
  await mmsdk.connect();
  return mmsdk.getProvider();
};

const getEncryptionPublicKey = async () => {
  const message = "Otorisasi Kunci Sertifikat Digital Jejak Tanahku";

  // 3. Minta Signature menggunakan viem
  const signature = await walletClient.signMessage({
    account: account as `0x${string}`,
    message: message,
  });

  // 4. Hash signature menggunakan keccak256 dari viem untuk entropy 32-byte
  const entropy = keccak256(signature);

  // 5. Generate KeyPair menggunakan eciesjs
  // Hapus '0x' dan ubah ke Buffer
  const privKey = new PrivateKey(Buffer.from(entropy.substring(2), "hex"));

  // Return Public Key dalam format Hex (tanpa 0x biasanya lebih baik untuk eciesjs)
  return privKey.publicKey.toHex();
};

const login = async (event: FormSubmitEvent<Schema>): Promise<void> => {
  //   const provider = await getProvider();
  //   if (!provider) {
  //     alert.value = { show: true, message: "MetaMask tidak ditemukan" };
  //     return;
  //   }

  //   const encryptionPublicKey = await getEncryptionPublicKey();
  //   console.log("encrypt public key : ", encryptionPublicKey);
  //   return;
  const { status, message } = await store.login(event.data);
  alert.value = {
    show: status === "error" ? true : false,
    message,
  };

  if (status === "success") router.push("/");
};

const connect = async (): Promise<void> => {
  const provider = await getProvider();
  const { status, message } = await store.connectMetaMask(provider);

  alert.value = {
    show: status === "error" ? true : false,
    message,
  };

  if (isAuthenticated) router.push("/");
};
</script>

<template>
  <MobileLayout>
    <section v-if="store.isLoading('AUTH_CHECK')">
      <UIcon name="line-md:loading-loop" class="text-primary size-10" />
    </section>
    <section v-else class="flex flex-col justify-center w-full">
      <h1 class="text-3xl font-semibold mb-10 text-center text-dark-500">
        Masuk
      </h1>

      <UAlert
        v-if="alert.show"
        :description="alert.message"
        color="error"
        class="rounded-lg mb-4"
      />

      <UForm :schema="schema" :state="form" class="space-y-4" @submit="login">
        <UFormField name="email" class="mb-4 outline-none">
          <UInput
            v-model="form.email"
            size="xl"
            icon="iconoir:mail"
            placeholder="Masukkan Email"
            class="rounded-full w-full"
            :ui="{ base: 'rounded-full' }"
          />
        </UFormField>
        <UFormField name="password" class="mb-4 outline-none">
          <UInput
            v-model="form.password"
            :type="show ? 'text' : 'password'"
            size="xl"
            icon="iconoir:lock"
            placeholder="Masukkan Password"
            class="rounded-full w-full"
            :ui="{ base: 'rounded-full' }"
          >
            <template #trailing>
              <UButton
                color="neutral"
                variant="link"
                size="sm"
                :icon="show ? 'i-lucide-eye-off' : 'i-lucide-eye'"
                :aria-label="show ? 'Hide password' : 'Show password'"
                :aria-pressed="show"
                aria-controls="password"
                @click="show = !show"
              />
            </template>
          </UInput>
        </UFormField>
        <section class="flex justify-between mt-5">
          <div class="flex items-center gap-x-3">
            <UCheckbox v-model="rememberMe" />
            <p>Ingat Saya</p>
          </div>

          <ULink>Lupa Password?</ULink>
        </section>

        <UButton
          type="submit"
          label="Masuk"
          :loading="store.isLoading('LOGIN')"
          variant="solid"
          block
          class="mt-5 rounded-full py-3"
        />
      </UForm>

      <p class="text-center mt-5">
        Belum punya akun?
        <ULink to="/register" class="text-primary font-medium">Daftar</ULink>
      </p>

      <div class="flex items-center my-6">
        <div class="grow border-t border border-gray-300"></div>
        <span class="mx-4 text-sm text-gray-500"> atau lanjutkan dengan </span>
        <div class="grow border border-t border-gray-300"></div>
      </div>

      <UButton
        v-if="isMetaMaskSupported"
        @click="connect"
        :loading="store.isLoading('CONNECT_WALLET')"
        label="Connect Wallet"
        variant="solid"
        icon="token-branded:metamask"
        block
        class="mt-5 rounded-full py-3"
      />

      <p v-else class="text-3xl font-semibold text-text-500">
        Install Metamask extension
      </p>

      <p v-if="error" class="text-red-500 mt-4 text-sm">
        {{ error }}
      </p>
      <div></div>
    </section>
  </MobileLayout>
</template>
