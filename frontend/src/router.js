import { createRouter, createWebHistory } from 'vue-router'
import DashboardView from './views/DashboardView.vue'
import QueueView from './views/QueueView.vue'
import ApprovedView from './views/ApprovedView.vue'
import PartnersView from './views/PartnersView.vue'

export default createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'dashboard', component: DashboardView },
    { path: '/queue', name: 'queue', component: QueueView },
    { path: '/approved', name: 'approved', component: ApprovedView },
    { path: '/partners', name: 'partners', component: PartnersView },
  ],
})
