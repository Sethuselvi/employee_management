<template>
  <NavigationBar />
  <div >
    <nav v-if="isLoggedIn">
      <router-link to="/employees">Employee List</router-link>|
      <router-link to="/employees/new" v-if="isAdminOrManager">Add Employee</router-link>
    </nav>
    <router-view />
  </div>
</template>

<script setup>
import NavigationBar from './components/NavigationBar.vue'
import { useRouter } from 'vue-router'
import { isLoggedIn } from './auth'
import { ref, onMounted, watch } from 'vue'
const router = useRouter()

const isAdminOrManager = ref(false)


onMounted(async () => {
  if (isLoggedIn.value) {
   
    try {
      const res = await fetch('/api/auth/profile', {
        headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') }
      });
      const data = await res.json();
      if (res.ok) {
        isAdminOrManager.value = ['admin', 'manager'].includes((data.role || '').trim().toLowerCase());
      }
      
    } catch (err) {
      isAdminOrManager.value = false;
    }
  }
})

watch(isLoggedIn, async (newVal) => {
  if (newVal) {
    // User just logged in, fetch role
    try {
      const res = await fetch('/api/auth/profile', {
        headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') }
      });
      const data = await res.json();
      if (res.ok) {
        isAdminOrManager.value = ['admin', 'manager'].includes((data.role || '').trim().toLowerCase());
      } else {
        isAdminOrManager.value = false;
      }
    } catch (err) {
      isAdminOrManager.value = false;
    }
  } else {
    // User just logged out, reset
    isAdminOrManager.value = false;
  }
}, { immediate: true });
</script>

<style scoped>
nav {
  margin-bottom: 1rem;
}
nav a {
  margin-right: 0.5rem;
  text-decoration: none;
  color: #42b983;
}
nav a.router-link-exact-active {
  font-weight: bold;
  color: #35495e;
}
</style>
