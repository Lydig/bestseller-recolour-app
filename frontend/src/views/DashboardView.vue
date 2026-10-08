<script setup>
import { onMounted, ref } from 'vue'
import Card from 'primevue/card'
import Message from 'primevue/message'
import { getKpis } from '../api'

const kpis = ref(null)
const error = ref('')

onMounted(async () => {
  try {
    kpis.value = await getKpis()
  } catch (e) {
    error.value = e.message
  }
})
</script>

<template>
  <h2 class="mb-4 text-2xl font-semibold">Dashboard</h2>
  <Message v-if="error" severity="error">Could not load KPIs: {{ error }}</Message>
  <p v-else-if="!kpis">Loading…</p>
  <div v-else class="grid max-w-3xl grid-cols-1 gap-4 sm:grid-cols-2">
    <Card>
      <template #title>{{ kpis.pending }} tickets pending</template>
      <template #content>Waiting to be sent to a partner.</template>
    </Card>
    <Card>
      <template #title>{{ kpis.awaitingApproval }} awaiting approval</template>
      <template #content>Completed by partner, ready for manager review.</template>
    </Card>
  </div>
</template>
