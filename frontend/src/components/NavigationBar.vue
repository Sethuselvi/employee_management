<script setup lang="ts">
import { useRouter } from 'vue-router'
import { isLoggedIn, getUserRole } from '../auth'
import { ref, onMounted } from 'vue'
const router = useRouter()



function logout() {
  localStorage.removeItem('token')
  isLoggedIn.value = false
  router.push('/login')
}

const showEmployeeLink = ref(false)

onMounted(() => {
  if (isLoggedIn.value) {
    // Only show for admin or manager, not for employee
    const role = getUserRole();
    showEmployeeLink.value = role === 'admin' || role === 'manager';
  } else {
    showEmployeeLink.value = false;
  }
})
</script>

<template>
  <nav class="bg-gray-800 p-4 flex items-center justify-between">
    <div class="text-white font-bold text-lg">Employee Management</div>
    <div>
      <template v-if="isLoggedIn">
        <router-link v-if="showEmployeeLink" to="/employees" class="text-white px-3 py-2 rounded hover:bg-gray-700">Employees</router-link>
        <router-link to="/profile" class="text-white px-3 py-2 rounded hover:bg-gray-700">Profile</router-link>
        <button @click="logout" class="ml-2 bg-red-600 text-white px-3 py-2 rounded hover:bg-red-700 cursor-pointer">Logout</button>
      </template>
      <template v-else>
        <router-link to="/login" class="text-white px-3 py-2 rounded hover:bg-gray-700">Login</router-link>
        <router-link to="/register" class="text-white px-3 py-2 rounded hover:bg-gray-700">Register</router-link>
      </template>
    </div>
  </nav>
  
</template>

<style scoped>
.read-the-docs {
  color: #888;
}
</style>
