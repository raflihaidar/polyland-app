<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useAuthStore } from "../store/auth.store";
import { storeToRefs } from "pinia";
import { useRouter } from "vue-router";
import type { FormSubmitEvent } from "@nuxt/ui";
import * as z from "zod";

const error = ref<string | null>(null);

const store = useAuthStore();
const { isAuthenticated, isMetaMaskSupported } = storeToRefs(store);
const schema = z
    .object({
        name: z.string().min(2).max(100),
        username: z.string().min(2).max(100),
        email: z.string().email(),
        password: z.string().min(8).max(100),
        confirmPassword: z.string().min(8).max(100),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: "Passwords do not match",
        path: ["confirmPassword"],
    });

const router = useRouter();
const form = ref<any>({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
});

const connect = async (): Promise<void> => {
    await store.connectMetaMask();

    if (isAuthenticated) router.push("/");
};

const onSubmit = async (): Promise<void> => {
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
                Daftar
            </h1>

            <UForm
                :schema="schema"
                :state="form"
                class="space-y-4"
                @submit="onSubmit"
            >
                <UInput
                    v-model="form.name"
                    size="xl"
                    icon="iconoir:user-square"
                    placeholder="Masukkan Nama"
                    class="mb-4 outline-none"
                    :ui="{ base: 'rounded-full' }"
                />

                <UInput
                    v-model="form.username"
                    size="xl"
                    icon="iconoir:user-square"
                    placeholder="Masukkan username"
                    class="mb-4 outline-none"
                    :ui="{ base: 'rounded-full' }"
                />

                <UInput
                    v-model="form.email"
                    size="xl"
                    icon="iconoir:mail"
                    placeholder="Masukkan Email"
                    class="mb-4 outline-none"
                    :ui="{ base: 'rounded-full' }"
                />
                <UInput
                    v-model="form.password"
                    type="password"
                    size="xl"
                    icon="iconoir:lock"
                    placeholder="Masukkan Password"
                    class="mb-4 rounded-full"
                    :ui="{ base: 'rounded-full' }"
                />

                <UInput
                    v-model="form.confirmPassword"
                    type="password"
                    size="xl"
                    icon="iconoir:lock"
                    placeholder="Konfirmasi Password"
                    class="mb-4 rounded-full"
                    :ui="{ base: 'rounded-full' }"
                />

                <UButton
                    v-if="isMetaMaskSupported"
                    @click="connect"
                    label="Masuk"
                    variant="solid"
                    block
                    class="mt-5 rounded-full py-3"
                />

                <p class="text-center mt-5">
                    Sudah punya akun?
                    <ULink to="/login" class="text-primary font-medium"
                        >Masuk</ULink
                    >
                </p>
            </UForm>

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
