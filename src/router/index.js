import { createRouter, createWebHistory } from 'vue-router'
import LayoutShell from '@/components/LayoutShell.vue'
import CalendarPage from '@/pages/CalendarPage.vue'
import BudgetManagePage from '@/pages/BudgetManagePage.vue'
import HomeOverviewPage from '@/pages/HomeOverviewPage.vue'
import TransactionFormPage from '@/pages/TransactionFormPage.vue'
import TransactionsPage from '@/pages/TransactionsPage.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      component: LayoutShell,
      children: [
        { path: '', name: 'home', component: HomeOverviewPage },
        { path: 'transactions', name: 'transactions', component: TransactionsPage },
        { path: 'transactions/new', name: 'transaction-new', component: TransactionFormPage },
        { path: 'transactions/:id/edit', name: 'transaction-edit', component: TransactionFormPage },
        { path: 'budgets', name: 'budgets', component: BudgetManagePage },
        { path: 'calendar', name: 'calendar', component: CalendarPage },
      ],
    },
  ],
})

export default router
