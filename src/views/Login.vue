<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useAuthStore } from "../store/auth.store";
import { storeToRefs } from "pinia";
import { useRouter } from "vue-router";

const error = ref<string | null>(null);

const store = useAuthStore();
const { isAuthenticated, isMetaMaskSupported } = storeToRefs(store);

const router = useRouter();

const email = ref<string | null>(null);
const password = ref<string | null>(null);
const rememberMe = ref<boolean>(false);

const connect = async (): Promise<void> => {
    await store.connectMetaMask();

    if (isAuthenticated) router.push("/");
};

onMounted(() => {
    store.attempt();
});
</script>

<template>
    <div class="flex place-items-center justify-center min-h-screen">
        <section v-if="store.isLoading('AUTH_CHECK')">
            <UIcon name="line-md:loading-loop" class="text-primary size-10" />
        </section>
        <section v-else class="flex flex-col justify-center w-[85%]">
            <h1 class="text-3xl font-semibold mb-10 text-center text-dark-500">
                Masuk
            </h1>

            <UInput
                v-model="email"
                size="xl"
                icon="iconoir:mail"
                placeholder="Masukkan Email"
                class="mb-4 outline-none"
                :ui="{ base: 'rounded-full' }"
            />
            <UInput
                v-model="password"
                type="password"
                size="xl"
                icon="iconoir:lock"
                placeholder="Masukkan Password"
                class="mb-4 rounded-full"
                :ui="{ base: 'rounded-full' }"
            />

            <section class="flex justify-between mt-5">
                <div class="flex items-center gap-x-3">
                    <UCheckbox v-model="rememberMe" />
                    <p>Ingat Saya</p>
                </div>

                <ULink>Lupa Password?</ULink>
            </section>

            <UButton
                v-if="isMetaMaskSupported"
                @click="connect"
                label="Masuk"
                variant="solid"
                block
                class="mt-5 rounded-full py-3"
            />

            <p class="text-center mt-5">
                Belum punya akun?
                <ULink to="/register" class="text-primary font-medium"
                    >Daftar</ULink
                >
            </p>

            <div class="flex items-center my-6">
                <div class="grow border-t border border-gray-300"></div>
                <span class="mx-4 text-sm text-gray-500">
                    atau lanjutkan dengan
                </span>
                <div class="grow border border-t border-gray-300"></div>
            </div>

            <UButton
                v-if="isMetaMaskSupported"
                @click="connect"
                label="Connect Wallet"
                variant="solid"
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
    </div>
</template>
