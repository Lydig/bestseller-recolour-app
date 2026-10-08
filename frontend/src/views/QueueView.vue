<script setup>
import { onMounted, ref, watch } from 'vue'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Select from 'primevue/select'
import Button from 'primevue/button'
import Dialog from 'primevue/dialog'
import Message from 'primevue/message'
import CreateTicketDialog from '../components/CreateTicketDialog.vue'
import { getTickets, sendTicket, updateTicketStatus } from '../api'
import { formatDate } from '../utils'
import { role } from '../stores/role'

const STATUS_OPTIONS = ['All', 'Pending', 'Sent', 'In Progress', 'Completed', 'Rejected', 'Approved']

const tickets = ref([])
const loading = ref(false)
const error = ref('')
const statusFilter = ref('All')
const dialogOpen = ref(false)
const busyId = ref(null)
const receipt = ref(null)

async function loadTickets() {
  loading.value = true
  error.value = ''
  try {
    tickets.value = await getTickets(statusFilter.value)
  } catch (e) {
    error.value = e.message
  } finally {
    loading.value = false
  }
}

async function act(ticket, fn) {
  busyId.value = ticket.id
  error.value = ''
  try {
    const result = await fn()
    await loadTickets()
    return result
  } catch (e) {
    error.value = `Action failed: ${e.message}`
  } finally {
    busyId.value = null
  }
}

async function send(ticket) {
  const result = await act(ticket, () => sendTicket(ticket.id))
  if (result) receipt.value = { ...result.receipt, ticketId: ticket.id }
}

const setStatus = (ticket, status) => act(ticket, () => updateTicketStatus(ticket.id, status))

onMounted(loadTickets)
watch(statusFilter, loadTickets)
</script>

<template>
  <h2 class="mb-4 text-2xl font-semibold">Ticket Queue</h2>

  <div class="mb-4 flex items-center justify-between">
    <Select v-model="statusFilter" :options="STATUS_OPTIONS" class="w-48" />
    <Button v-if="role === 'Operator'" label="Create Ticket" icon="pi pi-plus" @click="dialogOpen = true" />
  </div>

  <Message v-if="error" severity="error" class="mb-4">{{ error }}</Message>

  <DataTable :value="tickets" :loading="loading" dataKey="id" stripedRows>
    <template #empty>No tickets found.</template>
    <Column field="id" header="ID" />
    <Column header="Preview">
      <template #body="{ data }">
        <img
          v-if="data.image_url"
          :src="data.image_url"
          :alt="`Photo ${data.photo_id}`"
          loading="lazy"
          class="h-12 w-12 rounded object-cover"
        />
        <div v-else class="flex h-12 w-12 items-center justify-center rounded bg-surface-200 text-surface-400">
          <i class="pi pi-image" />
        </div>
      </template>
    </Column>
    <Column field="photo_id" header="Photo ID" />
    <Column field="style" header="Style" />
    <Column field="priority" header="Priority" />
    <Column field="partner" header="Partner" />
    <Column field="status" header="Status" />
    <Column header="Date">
      <template #body="{ data }">{{ formatDate(data.created_at) }}</template>
    </Column>
    <Column header="Actions">
      <template #body="{ data }">
        <div class="flex gap-2">
          <Button
            v-if="data.status === 'Pending'"
            label="Send to Partner"
            size="small"
            :loading="busyId === data.id"
            @click="send(data)"
          />
          <Button
            v-else-if="data.status === 'Sent'"
            label="Simulate Return"
            size="small"
            severity="secondary"
            :loading="busyId === data.id"
            @click="setStatus(data, 'Completed')"
          />
          <template v-else-if="data.status === 'Completed' && role === 'Manager'">
            <Button
              label="Approve"
              size="small"
              severity="success"
              :loading="busyId === data.id"
              @click="setStatus(data, 'Approved')"
            />
            <Button
              label="Reject"
              size="small"
              severity="danger"
              :loading="busyId === data.id"
              @click="setStatus(data, 'Rejected')"
            />
          </template>
        </div>
      </template>
    </Column>
  </DataTable>

  <CreateTicketDialog v-model:visible="dialogOpen" @created="loadTickets" />

  <Dialog :visible="!!receipt" modal header="Partner Receipt" :style="{ width: '28rem' }" @update:visible="receipt = null">
    <dl v-if="receipt" class="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2">
      <dt class="text-surface-500">Ticket</dt>
      <dd>#{{ receipt.ticketId }}</dd>
      <dt class="text-surface-500">Receipt ID</dt>
      <dd class="break-all">{{ receipt.receiptId }}</dd>
      <dt class="text-surface-500">Partner</dt>
      <dd>{{ receipt.partner }}</dd>
      <dt class="text-surface-500">Sent at</dt>
      <dd>{{ new Date(receipt.sentAt).toLocaleString() }}</dd>
    </dl>
  </Dialog>
</template>
