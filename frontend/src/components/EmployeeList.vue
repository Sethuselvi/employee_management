<template>
  <div>
    <h2 class="text-2xl font-bold mb-4">Employee List</h2>
    <div class="mb-4 flex flex-wrap gap-2 items-center">
      <input v-model="search" placeholder="Search..." class="border px-2 py-1 rounded" @keydown.enter="fetchEmployees" @input="debouncedSearch" @blur="fetchEmployees"/>
      <select v-model="status" class="border px-2 py-1 rounded cursor-pointer">
        <option value="">All Status</option>
        <option value="active">Active</option>
        <option value="inactive">Inactive</option>
      </select>
      <button @click="fetchEmployees" class="bg-blue-600 text-white px-3 py-1 rounded cursor-pointer">Search</button>
     
    </div>
    <div v-if="notification" class="mb-2 text-green-600">{{ notification }}</div>
    <table class="min-w-full bg-white border-2 border-black rounded-lg overflow-hidden">
      <thead>
        <tr>
          <th class="px-4 py-2 border-b-2 border-gray-500 bg-gray-100 text-left">ID</th>
          <th class="px-4 py-2 border-b-2 border-gray-500 bg-gray-100 text-left">Name</th>
          <th class="px-4 py-2 border-b-2 border-gray-500 bg-gray-100 text-left">Email</th>
          <th class="px-4 py-2 border-b-2 border-gray-500 bg-gray-100 text-left">Position</th>
          <th class="px-4 py-2 border-b-2 border-gray-500 bg-gray-100 text-left">Department</th>
          <th v-if="isAdminOrManager" class="px-4 py-2 border-b-2 border-gray-500 bg-gray-100 text-left">Status</th>
          <th v-if="isAdminOrManager" class="px-4 py-2 border-b-2 border-gray-500 bg-gray-100 text-left">Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="employee in employees" :key="employee._id" class="hover:bg-gray-50">
          <td class="px-4 py-2 border-b border-gray-400">{{ employee.employeeId }}</td>
          <td class="px-4 py-2 border-b border-gray-400">{{ employee.name }}</td>
          <td class="px-4 py-2 border-b border-gray-400">{{ employee.email }}</td>
          <td class="px-4 py-2 border-b border-gray-400">{{ employee.position }}</td>
          <td class="px-4 py-2 border-b border-gray-400">{{ employee.department }}</td>
          <td v-if="isAdminOrManager" class="px-4 py-2 border-b border-gray-400">{{ employee.status }}</td>
          <td v-if="isAdminOrManager" class="px-4 py-2 border-b border-gray-400">
            <router-link :to="`/employees/${employee._id}/edit`" class="text-blue-600 hover:underline">Edit</router-link>
            <button @click="deleteEmployee(employee._id)" class="ml-2 px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600 cursor-pointer">Delete</button>
          </td>
        </tr>
      </tbody>
    </table>
    <div class="mt-4 flex gap-2 items-center">
      <button @click="prevPage" :disabled="page === 1" class="px-3 py-1 bg-gray-200 rounded">Prev</button>
      <span>Page {{ page }} of {{ pages }}</span>
      <button @click="nextPage" :disabled="page === pages" class="px-3 py-1 bg-gray-200 rounded">Next</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { io } from 'socket.io-client'

interface Employee {
  _id: string
  employeeId: string
  name: string
  email: string
  position: string
  department: string
  status: string
}

const employees = ref<Employee[]>([])
const page = ref(1)
const pages = ref(1)
const search = ref('')
const status = ref('')
const notification = ref('')
const limit = 10
const userRole = ref('')
const isAdminOrManager = ref(false)

let timeout: ReturnType<typeof setTimeout> | undefined;
function debouncedSearch() {
  clearTimeout(timeout);
  if (search.value === '') {
    fetchEmployees();
    return;
  }
  timeout = setTimeout(() => {
    fetchEmployees();
  }, 300);
}

const fetchEmployees = async () => {
  try {
    const params = new URLSearchParams({
      page: page.value.toString(),
      limit: limit.toString(),
      search: search.value,
      status: status.value
    })
    const res = await fetch(`/api/employees?${params.toString()}`, {
      headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') }
    })
    if (!res.ok) throw new Error('Failed to fetch employees')
    const data = await res.json()
    employees.value = data.employees
    pages.value = data.pages
  } catch (err) {
    employees.value = []
  }
}

const fetchUserRole = async () => {
  try {
    const res = await fetch('/api/auth/profile', {
      headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') }
    });
    const data = await res.json();
    if (res.ok) {
      userRole.value = data.role;
      isAdminOrManager.value = data.role === 'admin' || data.role === 'manager';
    }
  } catch (err) {
    userRole.value = '';
    isAdminOrManager.value = false;
  }
}

const deleteEmployee = async (id: string) => {
  if (!confirm('Are you sure you want to delete this employee?')) return
  try {
    const res = await fetch(`/api/employees/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') }
    })
    if (!res.ok) throw new Error('Failed to delete employee')
    notification.value = 'Employee deleted.'
    setTimeout(() => notification.value = '', 2000)
  } catch (err) {
    notification.value = 'Error deleting employee.'
    setTimeout(() => notification.value = '', 2000)
  }
}

const prevPage = () => { if (page.value > 1) { page.value--; fetchEmployees() } }
const nextPage = () => { if (page.value < pages.value) { page.value++; fetchEmployees() } }

onMounted(() => {
  fetchUserRole();
  fetchEmployees()
  const socket = io('/', { transports: ['websocket'] })
  socket.on('employeeCreated', () => { fetchEmployees(); notification.value = 'Employee added.'; setTimeout(() => notification.value = '', 2000) })
  socket.on('employeeUpdated', () => { fetchEmployees(); notification.value = 'Employee updated.'; setTimeout(() => notification.value = '', 2000) })
  socket.on('employeeDeleted', () => { fetchEmployees(); notification.value = 'Employee deleted.'; setTimeout(() => notification.value = '', 2000) })
})
</script> 