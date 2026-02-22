<script setup lang="ts">
import { ref } from "vue";
import { useRoute } from "vue-router";

const route = useRoute();
const navigationItem = ref<{ name: string; icon: string; slug: string }[]>([
    {
        name: "Beranda",
        icon: "ri:home-3-fill",
        slug: "Home",
    },
    {
        name: "Aktaku",
        icon: "ri:folder-shield-line",
        slug: "Akta",
    },
    {
        name: "Scan Dokumen",
        icon: "ri:qr-scan-2-line",
        slug: "Scan-dokumen",
    },
    {
        name: "Sertifikatku",
        icon: "ri:file-list-2-line",
        slug: "Sertifikatku",
    },
    {
        name: "Profil",
        icon: "ri:user-3-line",
        slug: "Profil",
    },
]);

const scanDokumenClass =
    "absolute -translate-y-1/2 -translate-x-1/2 left-1/2 -top-[90%] size-10 bg-primary text-white rounded-xl p-1";
</script>

{{ item.name }}
<template>
    <div
        class="w-full flex items-center gap-x-2 fixed bottom-0 p-5 bg-white shadow-xs"
    >
        <ul v-for="(item, index) in navigationItem" :key="index" class="w-full">
            <li
                class="w-full text-center relative cursor-pointer"
                :class="[
                    route.name === item.slug ? 'text-primary font-medium' : '',
                ]"
            >
                <UIcon
                    :name="item.icon"
                    class="mx-auto"
                    :class="[
                        item.name === 'Scan Dokumen'
                            ? scanDokumenClass
                            : 'size-7',
                    ]"
                />
                <p
                    class="text-xs"
                    :class="[item.name === 'Scan Dokumen' ? 'mt-5' : 'mt-2']"
                >
                    {{ item.name }}
                </p>
            </li>
        </ul>
    </div>
</template>
