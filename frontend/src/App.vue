<script setup>
import Select from 'primevue/select'
import { role, ROLES } from './stores/role'

const links = [
  { to: '/', label: 'Dashboard', icon: 'pi pi-home' },
  { to: '/queue', label: 'Queue', icon: 'pi pi-list' },
  { to: '/approved', label: 'Approved Library', icon: 'pi pi-check-circle' },
  { to: '/partners', label: 'Partner Overview', icon: 'pi pi-users' },
]
</script>

<template>
  <div class="flex min-h-screen">
    <aside class="w-60 shrink-0 bg-surface-900 p-4 text-white">
      <h1 class="mb-6 text-lg font-semibold">Recolour Requests</h1>
      <nav class="flex flex-col gap-1">
        <RouterLink
          v-for="link in links"
          :key="link.to"
          :to="link.to"
          class="flex items-center gap-2 rounded-md px-3 py-2 hover:bg-surface-700"
          active-class="bg-surface-700 font-medium"
        >
          <i :class="link.icon" />
          {{ link.label }}
        </RouterLink>
      </nav>
    </aside>

    <div class="flex flex-1 flex-col">
      <header class="flex items-center justify-end gap-2 border-b border-surface-200 px-6 py-3">
        <label for="role" class="text-sm text-surface-500">Role</label>
        <Select v-model="role" inputId="role" :options="ROLES" class="w-40" />
      </header>
      <main class="flex-1 p-6">
        <RouterView />
      </main>
    </div>
  </div>
</template>
