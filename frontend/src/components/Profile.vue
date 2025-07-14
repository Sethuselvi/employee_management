<template>
  <div class="max-w-md mx-auto mt-10 bg-white p-8 rounded shadow">
    <h2 class="text-2xl font-bold mb-6 text-center">Profile</h2>
    <div v-if="error" class="mb-4 text-red-500">{{ error }}</div>
    <div v-if="success" class="mb-4 text-green-600">{{ success }}</div>
    <form @submit.prevent="updateProfile">
      <div class="mb-4">
        <label class="block mb-1">Username</label>
        <input v-model="username" type="text" class="w-full px-3 py-2 border rounded" required />
      </div>
      <div class="mb-4">
        <label class="block mb-1">Email</label>
        <input v-model="email" type="email" class="w-full px-3 py-2 border rounded" required />
      </div>
      <div class="mb-4">
        <label class="block mb-1">Role</label>
        <input :value="role" type="text" class="w-full px-3 py-2 border rounded bg-gray-100" disabled />
      </div>
      <button type="submit" class="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">Update Profile</button>
    </form>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';

const username = ref('');
const email = ref('');
const role = ref('');
const password = ref('');
const error = ref('');
const success = ref('');

onMounted(async () => {
  error.value = '';
  try {
    const res = await fetch('/api/auth/profile', {
      headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') }
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.msg || 'Failed to fetch profile');
    username.value = data.username;
    email.value = data.email;
    role.value = data.role;
  } catch (err) {
    error.value = err.message;
  }
});

const updateProfile = async () => {
  error.value = '';
  success.value = '';
  try {
    const res = await fetch('/api/auth/profile', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + localStorage.getItem('token')
      },
      body: JSON.stringify({ username: username.value, email: email.value, password: password.value })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.msg || data.errors?.[0]?.msg || 'Update failed');
    success.value = 'Profile updated successfully!';
    password.value = '';
  } catch (err) {
    error.value = err.message;
  }
};
</script> 