<script setup>
import { reactive, ref } from 'vue'
import Dialog from 'primevue/dialog'
import InputText from 'primevue/inputtext'
import Select from 'primevue/select'
import Textarea from 'primevue/textarea'
import Button from 'primevue/button'
import Message from 'primevue/message'
import { createTicket, parseGuideline } from '../api'

const visible = defineModel('visible', { type: Boolean, default: false })
const emit = defineEmits(['created'])

const PRIORITIES = ['Low', 'Normal', 'High', 'Urgent']
const blank = () => ({ photo_id: '', style: '', priority: 'Normal', partner: '', image_url: '', rawGuideline: '' })

const form = reactive(blank())
const saving = ref(false)
const error = ref('')
const isParsing = ref(false)
const parseError = ref('')

async function autoFill() {
  isParsing.value = true
  parseError.value = ''
  try {
    const data = await parseGuideline(form.rawGuideline)
    form.photo_id = data.photo_id
    form.style = data.style
    if (PRIORITIES.includes(data.priority)) form.priority = data.priority
    form.partner = data.partner
  } catch (e) {
    parseError.value = `AI parsing failed: ${e.message}`
  } finally {
    isParsing.value = false
  }
}

async function submit() {
  if (!form.photo_id.trim() || !form.style.trim() || !form.partner.trim()) {
    error.value = 'Photo ID, Style and Partner are required.'
    return
  }
  saving.value = true
  error.value = ''
  try {
    // rawGuideline is UI-only for now; AI parsing will hook in here later.
    const { photo_id, style, priority, partner, image_url } = form
    await createTicket({ photo_id, style, priority, partner, image_url: image_url.trim() || undefined })
    Object.assign(form, blank())
    visible.value = false
    emit('created')
  } catch (e) {
    error.value = e.message
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <Dialog v-model:visible="visible" modal header="Create Ticket" :style="{ width: '40rem' }">
    <form class="flex flex-col gap-4" @submit.prevent="submit">
      <Message v-if="error" severity="error">{{ error }}</Message>

      <div class="flex flex-col gap-1">
        <label for="photo_id">Photo ID</label>
        <InputText id="photo_id" v-model="form.photo_id" />
      </div>
      <div class="flex flex-col gap-1">
        <label for="style">Style</label>
        <InputText id="style" v-model="form.style" />
      </div>
      <div class="flex flex-col gap-1">
        <label for="priority">Priority</label>
        <Select v-model="form.priority" inputId="priority" :options="PRIORITIES" />
      </div>
      <div class="flex flex-col gap-1">
        <label for="partner">Partner</label>
        <InputText id="partner" v-model="form.partner" />
      </div>
      <div class="flex flex-col gap-1">
        <label for="image_url">Image URL (optional)</label>
        <InputText id="image_url" v-model="form.image_url" placeholder="/static/images/15377489_5081878_001.jpg" />
      </div>
      <div class="flex flex-col gap-1">
        <label for="guideline">Raw Guideline (AI Parsing)</label>
        <Textarea id="guideline" v-model="form.rawGuideline" rows="8" autoResize />
        <Message v-if="parseError" severity="error">{{ parseError }}</Message>
        <Button
          type="button"
          class="self-start"
          severity="secondary"
          outlined
          :label="isParsing ? 'Parsing…' : '✨ Auto-Fill with AI'"
          :icon="isParsing ? 'pi pi-spin pi-spinner' : undefined"
          :disabled="isParsing || !form.rawGuideline.trim()"
          @click="autoFill"
        />
      </div>

      <div class="flex justify-end gap-2">
        <Button type="button" label="Cancel" severity="secondary" @click="visible = false" />
        <Button type="submit" label="Create" :loading="saving" />
      </div>
    </form>
  </Dialog>
</template>
