import { ref, watch } from 'vue'

export const ROLES = ['Operator', 'Manager']

const stored = localStorage.getItem('role')
export const role = ref(ROLES.includes(stored) ? stored : 'Operator')

watch(role, (value) => localStorage.setItem('role', value))
