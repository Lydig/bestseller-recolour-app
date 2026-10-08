<script setup>
import { onMounted, ref } from 'vue'
import Card from 'primevue/card'
import Message from 'primevue/message'
import { getTickets } from '../api'
import { formatDate } from '../utils'

const tickets = ref([])
const error = ref('')
const loading = ref(true)

onMounted(async () => {
  try {
    tickets.value = await getTickets('Approved')
  } catch (e) {
    error.value = e.message
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <h2 class="mb-4 text-2xl font-semibold">Approved Library</h2>
  <Message v-if="error" severity="error">Could not load approved photos: {{ error }}</Message>
  <p v-else-if="loading">Loading…</p>
  <p v-else-if="!tickets.length" class="text-surface-500">No approved photos yet.</p>
  <div v-else class="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
    <Card v-for="t in tickets" :key="t.id">
      <template #header>
        <img v-if="t.image_url" :src="t.image_url" :alt="`Photo ${t.photo_id}`" class="h-56 w-full object-cover" />
        <div v-else class="flex h-56 w-full items-center justify-center bg-surface-200 text-surface-400">
          <i class="pi pi-image text-4xl" />
        </div>
      </template>
      <template #title>{{ t.photo_id }}</template>
      <template #subtitle>{{ t.style }}</template>
      <template #content>
        <dl class="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-sm">
          <dt class="text-surface-500">Partner</dt>
          <dd>{{ t.partner }}</dd>
          <dt class="text-surface-500">Approved</dt>
          <dd>{{ formatDate(t.updated_at || t.created_at) }}</dd>
        </dl>
      </template>
    </Card>
  </div>
</template>
