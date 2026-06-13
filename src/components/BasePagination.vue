<script setup lang="ts">
interface Pagination {
  total: number
  page: number
  limit: number
  totalPages: number
}

const pagination = defineModel<Pagination>({
  required: true
})

const options = [
  '5', '10', '50', '100', 'Semua'
]

const emits = defineEmits(['goToPage'])
</script>

<template>

  <div class="flex items-center justify-between gap-3 border-t border-default pt-4 mt-auto">
    <div class="flex items-center gap-x-3">
      <USelect v-model="pagination.limit" :items="options" />
      <div class="text-sm text-muted">
        Total
        <span class="font-semibold text-highlighted">
          {{ pagination.total }}
        </span>
        data
      </div>
    </div>

    <div class="flex items-center gap-1.5">
      <UPagination :default-page="pagination.page" :items-per-page="pagination.limit" :total="pagination.total"
        @update:page="emits('goToPage')" />
    </div>
  </div>
</template>