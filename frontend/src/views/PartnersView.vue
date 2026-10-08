<script setup>
import { onMounted, ref } from 'vue'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Message from 'primevue/message'
import { getPartners } from '../api'

const partners = ref([])
const error = ref('')
const loading = ref(true)

onMounted(async () => {
  try {
    partners.value = await getPartners()
  } catch (e) {
    error.value = e.message
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <h2 class="mb-4 text-2xl font-semibold">Partner Overview</h2>
  <Message v-if="error" severity="error" class="mb-4">Could not load partners: {{ error }}</Message>
  <DataTable :value="partners" :loading="loading" dataKey="partner" stripedRows>
    <template #empty>No partners yet.</template>
    <Column field="partner" header="Partner Name" />
    <Column field="total" header="Total Tickets Assigned" />
    <Column field="active" header="Active Tickets" />
    <Column field="done" header="Completed/Approved Tickets" />
  </DataTable>
</template>
