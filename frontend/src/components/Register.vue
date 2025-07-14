<template>
  <div class="flex items-center justify-center min-h-screen bg-gray-100">
    <form @submit.prevent="register" class="bg-white p-8 rounded shadow-md w-full max-w-md">
      <h2 class="text-2xl font-bold mb-6 text-center">Register</h2>
      <div v-if="error" class="mb-4 text-red-500">{{ error }}</div>
      <div v-if="success" class="mb-4 text-green-600 text-center">{{ success }}</div>
      <div v-if="!success">
        <div class="mb-4">
          <label class="block mb-1">Username</label>
          <input v-model="username" type="text" class="w-full px-3 py-2 border rounded" required />
        </div>
        <div class="mb-4">
          <label class="block mb-1">Email</label>
          <input v-model="email" type="email" class="w-full px-3 py-2 border rounded" required />
        </div>
        <div class="mb-6">
          <label class="block mb-1">Password</label>
          <input v-model="password" type="password" class="w-full px-3 py-2 border rounded" required />
        </div>
        <button type="submit" class="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700">Register</button>
      </div>
      <p class="mt-4 text-center text-sm">Already have an account? <router-link to="/login" class="text-green-600 hover:underline">Login</router-link></p>
      <div v-if="success" class="mt-4 text-center text-sm">
        <router-link to="/login" class="text-green-600 hover:underline">Click here to login with your new account</router-link>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue';
// import { useRouter } from 'vue-router';

const username = ref('');
const email = ref('');
const password = ref('');
const error = ref('');
const success = ref('');
// const router = useRouter();

const register = async () => {
  error.value = '';
  try {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: username.value, email: email.value, password: password.value })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.msg || data.errors?.[0]?.msg || 'Registration failed');
    success.value = 'Registration successful! Please login with your new credentials.';
    // localStorage.setItem('token', data.token);
    // router.push('/');
  } catch (err) {
    error.value = err.message;
  }
};
</script> 