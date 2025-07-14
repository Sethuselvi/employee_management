<template>
  <div class="flex items-center justify-center">
    <form @submit.prevent="login" class="bg-white p-8 rounded  w-full max-w-md">
      <h2 class="text-2xl font-bold mb-6 text-center">Login</h2>
      <div v-if="error" class="mb-4 text-red-500">{{ error }}</div>
      <div class="mb-4">
        <label class="block mb-1">Email</label>
        <input v-model="email" type="email" class="w-full px-3 py-2 border rounded" required />
      </div>
      <div class="mb-6">
        <label class="block mb-1">Password</label>
        <input v-model="password" type="password" class="w-full px-3 py-2 border rounded" required />
      </div>
      <button type="submit" class="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">Login</button>
      <p class="mt-2 text-center text-sm">
        <router-link to="/forgot-password" class="text-blue-600 hover:underline">Forgot Password?</router-link>
      </p>
      <p class="mt-4 text-center text-sm">Don't have an account? <router-link to="/register" class="text-blue-600 hover:underline">Register</router-link></p>
    </form>
   
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { isLoggedIn } from '../auth';

const email = ref('');
const password = ref('');
const error = ref('');
const router = useRouter();

const login = async () => {
  error.value = '';
  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email.value, password: password.value })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.msg || data.errors?.[0]?.msg || 'Login failed');
    localStorage.setItem('token', data.token);
    isLoggedIn.value = true;
    router.push('/');
  } catch (err) {
    error.value = err.message;
  }
};
</script> 