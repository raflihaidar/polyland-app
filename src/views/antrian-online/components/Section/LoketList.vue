<script setup lang="ts">
import type { OfficeLand, User } from "@/types";
import { computed, useTemplateRef } from "vue";
import { CalendarDate } from '@internationalized/date'
import { today, getLocalTimeZone } from '@internationalized/date'

const props = defineProps<{
    data: {
        pemohon: User | null;
        office: OfficeLand | null;
        date: Date | null;
    };
}>();

const emits = defineEmits<{
    (e: 'update:data', value: { pemohon: User | null; office: OfficeLand | null; date: Date | null }): void;
    (e: 'handleMenu', menu: 'form' | 'loket'): void;
}>();

const minDate = computed(() => {
    const t = today(getLocalTimeZone());
    return new CalendarDate(t.year, t.month, 1);
});

const data = computed({
    get: () => props.data,
    set: (val) => emits('update:data', val),
});

const modelValue = computed({
    get: () => data.value.date ?? today(getLocalTimeZone()),
    set: (val: Date) => {
        data.value = { ...data.value, date: val };
    },
});

const inputDate = useTemplateRef('inputDate');
</script>

<template>
    <div>
        <div class="text-center">
            <h3 class="font-medium">{{ data.office?.name }}</h3>
            <p>Sudah tutup</p>
        </div>


        <div class="text-center mt-3">
            <UInputDate ref="inputDate" v-model="modelValue">
                <template #trailing>
                    <UPopover :reference="inputDate?.inputsRef[3]?.$el">
                        <UButton color="neutral" variant="link" size="sm" icon="i-lucide-calendar"
                            aria-label="Select a date" class="px-0" />

                        <template #content>
                            <UCalendar :min-value="minDate" v-model="modelValue" class="p-2" />
                        </template>
                    </UPopover>
                </template>
            </UInputDate>
        </div>

        <UCard class="w-full mt-5">
            <template #header>
                <h3 class="font-bold">Loket Peralihan Hak Tanpa Kuasa</h3>
                <p class="text-sm text-gray-500">Loket untuk administrasi balik nama sertifikat</p>
            </template>

            <div class="grid grid-cols-[auto_1fr] gap-x-4 text-sm">
                <p class="font-normal">Total Antrian</p>
                <p>: 0</p>

                <p class="font-normal">Sisa Antrian</p>
                <p>: 0</p>

                <p class="font-normal">Antrian Saat ini</p>
                <p>: 0</p>

                <p class="font-normal">Status</p>
                <p>: <span class="font-medium">Istirahat / Tutup</span></p>
            </div>


            <template #footer>
                <div class="flex justify-end">
                    <UButton>Ambil antrian</UButton>
                </div>
            </template>
        </UCard>
    </div>
</template>