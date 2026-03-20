<script setup lang="ts">
import {provide} from "vue"
import MobileLayout from '../../layouts/mobile.vue';

provide("head-title", "Profil");
</script>


<template>
    <MobileLayout>
        <p>Profile</p>
    </MobileLayout>
</template>