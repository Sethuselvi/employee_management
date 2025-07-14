import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import EmployeeList from './components/EmployeeList.vue'
import EmployeeForm from './components/EmployeeForm.vue'
import Login from './components/Login.vue'
import Register from './components/Register.vue'
import Profile from './components/Profile.vue'
import ForgotPassword from './components/ForgotPassword.vue'
import ResetPassword from './components/ResetPassword.vue'

const routes: RouteRecordRaw[] = [
  { path: '/', redirect: '/employees' },
  { path: '/login', component: Login },
  { path: '/register', component: Register },
  { path: '/profile', component: Profile, meta: { requiresAuth: true } },
  { path: '/employees', component: EmployeeList, meta: { requiresAuth: true } },
  { path: '/employees/new', component: EmployeeForm, meta: { requiresAuth: true } },
  { path: '/employees/:id/edit', component: EmployeeForm, props: true, meta: { requiresAuth: true } },
  { path: '/forgot-password', component: ForgotPassword },
  { path: '/reset-password', component: ResetPassword },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach((to, from, next) => {
  if (to.meta.requiresAuth && !localStorage.getItem('token')) {
    next('/login')
  } else {
    next()
  }
})

export default router 