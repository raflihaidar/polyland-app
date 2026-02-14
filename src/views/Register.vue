<script setup lang="ts">
import { ref } from "vue";
import { useAuthStore } from "../stores/auth.store";
import { storeToRefs } from "pinia";
import { useRouter } from "vue-router";
import type { FormSubmitEvent } from "@nuxt/ui";
import * as z from "zod";

const error = ref<string | null>(null);

const store = useAuthStore();
const { isAuthenticated, isMetaMaskSupported } = storeToRefs(store);
const schema = z
    .object({
        name: z
            .string()
            .min(2, {
                message: "Username minimal 2 kata",
            })
            .trim()
            .transform((val) =>
                val
                    .toLowerCase()
                    .split(" ")
                    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                    .join(" "),
            ),
        username: z
            .string()
            .min(2, {
                message: "Username minimal 2 kata",
            })
            .max(100, {
                message: "Username terlalu panjang, maksimal 100 kata",
            })
            .trim()
            .normalize(),
        email: z.email("Email tidak valid").trim(),
        password: z
            .string()
            .trim()
            .min(8, { message: "Password minimal terdiri dari 8 karakter" })
            .regex(/[a-z]/, {
                message: "Password harus mengandung minimal satu huruf kecil",
            })
            .regex(/[A-Z]/, {
                message: "Password harus mengandung minimal satu huruf besar",
            })
            .regex(/\d/, {
                message: "Password harus mengandung minimal satu angka",
            })
            .regex(/[\W_]/, {
                message:
                    "Password harus mengandung minimal satu karakter khusus",
            }),
        confirmPassword: z.string(),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: "Passwords do not match",
        path: ["confirmPassword"],
    });

type Schema = z.output<typeof schema>;

const router = useRouter();
const form = ref<Partial<Schema>>({
    name: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
});
const showPassword = ref<boolean>(false);
const showConfirmPassowrd = ref<boolean>(false);
const alert = ref<{ show: boolean; message: string }>({
    show: false,
    message: "",
});

const connect = async (): Promise<void> => {
    await store.connectMetaMask();

    if (isAuthenticated) router.push("/");
};

const onSubmit = async (event: FormSubmitEvent<Schema>): Promise<void> => {
    const { status, message } = await store.register(event.data);
    alert.value = {
        show: status === "error" ? true : false,
        message,
    };
    if (status) router.push("/login");
};
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

            <UAlert
                v-if="alert.show"
                :description="alert.message"
                color="error"
                class="rounded-lg mb-4"
            />

            <UForm
                :schema="schema"
                :state="form"
                class="space-y-4"
                @submit="onSubmit"
            >
                <UFormField name="name" class="mb-4 outline-none">
                    <UInput
                        v-model="form.name"
                        size="xl"
                        icon="iconoir:user-square"
                        placeholder="Masukkan Nama"
                        :ui="{ base: 'rounded-full' }"
                    />
                </UFormField>

                <UFormField name="username" class="mb-4 outline-none">
                    <UInput
                        v-model="form.username"
                        size="xl"
                        icon="iconoir:user-scan"
                        placeholder="Masukkan username"
                        :ui="{ base: 'rounded-full' }"
                    />
                </UFormField>

                <UFormField name="email" class="mb-4 outline-none">
                    <UInput
                        v-model="form.email"
                        size="xl"
                        icon="iconoir:mail"
                        placeholder="Masukkan Email"
                        :ui="{ base: 'rounded-full' }"
                    />
                </UFormField>

                <UFormField name="password" class="mb-4 outline-none">
                    <UInput
                        v-model="form.password"
                        :type="showPassword ? 'text' : 'password'"
                        size="xl"
                        icon="iconoir:lock"
                        placeholder="Masukkan Password"
                        :ui="{ base: 'rounded-full' }"
                    >
                        <template #trailing>
                            <UButton
                                color="neutral"
                                variant="link"
                                size="sm"
                                :icon="
                                    showPassword
                                        ? 'i-lucide-eye-off'
                                        : 'i-lucide-eye'
                                "
                                :aria-label="
                                    showPassword
                                        ? 'Hide password'
                                        : 'Show password'
                                "
                                :aria-pressed="showPassword"
                                aria-controls="password"
                                @click="showPassword = !showPassword"
                            />
                        </template>
                    </UInput>
                </UFormField>

                <UFormField name="confirmPassword" class="mb-4 rounded-full">
                    <UInput
                        v-model="form.confirmPassword"
                        :type="showConfirmPassowrd ? 'text' : 'password'"
                        size="xl"
                        icon="iconoir:lock"
                        placeholder="Konfirmasi Password"
                        :ui="{ base: 'rounded-full' }"
                    >
                        <template #trailing>
                            <UButton
                                color="neutral"
                                variant="link"
                                size="sm"
                                :icon="
                                    showConfirmPassowrd
                                        ? 'i-lucide-eye-off'
                                        : 'i-lucide-eye'
                                "
                                :aria-label="
                                    showConfirmPassowrd
                                        ? 'Hide password'
                                        : 'Show password'
                                "
                                :aria-pressed="showConfirmPassowrd"
                                aria-controls="password"
                                @click="
                                    showConfirmPassowrd = !showConfirmPassowrd
                                "
                            />
                        </template>
                    </UInput>
                </UFormField>

                <UButton
                    type="submit"
                    label="Daftar"
                    variant="solid"
                    :loading="store.isLoading('REGISTER')"
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
    </div>
</template>
