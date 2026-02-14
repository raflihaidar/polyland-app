<script setup lang="ts">
import { storeToRefs } from "pinia";
import { useAuthStore } from "../stores/auth.store";
import PublicationButton from "../components/PublicationButton.vue";

const store = useAuthStore();
const { address } = storeToRefs(store);
</script>

<template>
    <section class="w-screen h-screen p-5">
        <nav class="flex justify-between">
            <section>
                <h1 class="font-semibold text-2xl cursor-pointer group">
                    <span
                        class="text-purple-400 group-hover:text-white transition-colors"
                        >Poly</span
                    >
                    <span
                        class="text-white group-hover:text-purple-400 transition-colors"
                        >land</span
                    >
                </h1>
            </section>
            <section>
                <p class="font-mono font-semibold mb-4">{{ address }}</p>
            </section>
        </nav>
        <main class="w-full mt-20">
            <h1 class="text-center text-4xl mb-10">
                Selamat Datang di Polyland
            </h1>

            <section>
                <PublicationButton />
            </section>
        </main>
    </section>
</template>
