<template>
  <div>
    <h2 class="text-2xl font-bold mb-4">{{ isEdit ? 'Edit Employee' : 'Add Employee' }}</h2>
    <form class="max-w-md space-y-4" @submit="handleSubmit">
      <div>
        <label class="block mb-1 font-medium">Name</label>
        <input v-model="form.name" class="w-full border border-gray-300 rounded px-3 py-2" required />
      </div>
      <div>
        <label class="block mb-1 font-medium">Email</label>
        <input v-model="form.email" class="w-full border border-gray-300 rounded px-3 py-2" required />
      </div>
      <div>
        <label class="block mb-1 font-medium">Position</label>
        <input v-model="form.position" class="w-full border border-gray-300 rounded px-3 py-2" required />
      </div>
      <div>
        <label class="block mb-1 font-medium">Department</label>
        <input v-model="form.department" class="w-full border border-gray-300 rounded px-3 py-2" required />
      </div>
      <div>
        <label class="block mb-1 font-medium">Status</label>
        <select v-model="form.status" class="w-full border border-gray-300 rounded px-3 py-2">
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>
      <div v-if="notification" class="text-green-600">{{ notification }}</div>
      <div v-if="error" class="text-red-600">{{ error }}</div>
      <button type="submit" class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
        {{ isEdit ? 'Update' : 'Add' }} Employee
      </button>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const props = defineProps<{ id?: string }>()

const router = useRouter()

const isEdit = ref(!!props.id)

const form = ref({
  id: '',
  name: '',
  email: '',
  position: '',
  department: '',
  status: 'active',
})

const notification = ref('')
const error = ref('')

async function loadEmployee(id: string) {
  try {
    const res = await fetch(`/api/employees/${id}`, {
      
      headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') }
      
    })
    if (!res.ok) throw new Error('Failed to fetch employee')
    const emp = await res.json()
    form.value = { id: emp._id, name: emp.name, email: emp.email, position: emp.position, department: emp.department, status: emp.status }
  } catch (err) {
    error.value = 'Error loading employee'
  }
}

onMounted(() => {
  if (props.id) {
    loadEmployee(props.id)
  }
})

watch(() => props.id, (newId) => {
  if (newId) loadEmployee(newId)
})

async function handleSubmit(e: Event) {
  e.preventDefault()
  error.value = ''
  notification.value = ''
  if (!isEdit.value) {
    // Add new employee
    try {
      const res = await fetch('/api/employees', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + localStorage.getItem('token')
        },
        body: JSON.stringify({
          name: form.value.name,
          email: form.value.email,
          position: form.value.position,
          department: form.value.department,
          status: form.value.status
        }),
      })
      if (!res.ok) throw new Error('Failed to add employee')
      notification.value = 'Employee added.'
      setTimeout(() => router.push('/employees'), 1000)
    } catch (err) {
      error.value = 'Error adding employee'
    }
  } else {
    // Update employee
    try {
      const res = await fetch(`/api/employees/${form.value.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + localStorage.getItem('token')
        },
        body: JSON.stringify({
          name: form.value.name,
          email: form.value.email,
          position: form.value.position,
          department: form.value.department,
          status: form.value.status
        }),
      })
      if (!res.ok) throw new Error('Failed to update employee')
      notification.value = 'Employee updated.'
      setTimeout(() => router.push('/employees'), 1000)
    } catch (err) {
      error.value = 'Error updating employee'
    }
  }
}
</script> 