<template>
  <div class="flex items-center justify-center">
    <form class="bg-white p-8 rounded w-full max-w-md" @submit.prevent="handleSubmit">
      <h2 class="text-2xl font-bold mb-6 text-center">Reset your password</h2>
      <div v-if="error" class="mb-4 text-red-500 text-center">{{ error }}</div>
      <div v-if="success" class="mb-4 text-green-600 text-center">{{ success }}</div>
      <div class="mb-4">
        <label for="password" class="block mb-1">New Password</label>
        <input
          id="password"
          v-model="password"
          name="password"
          type="password"
          required
          class="w-full px-3 py-2 border rounded"
        />
      </div>
      <div class="mb-6">
        <label for="confirmPassword" class="block mb-1">Confirm Password</label>
        <input
          id="confirmPassword"
          v-model="confirmPassword"
          name="confirmPassword"
          type="password"
          required
          class="w-full px-3 py-2 border rounded"
        />
      </div>
      <button
        type="submit"
        :disabled="loading"
        class="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
      >
        <span v-if="loading">Resetting...</span>
        <span v-else>Reset Password</span>
      </button>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import axios from 'axios';

const route = useRoute();
const router = useRouter();
const token = ref('');
const password = ref('');
const confirmPassword = ref('');
const loading = ref(false);
const error = ref('');
const success = ref('');

onMounted(() => {
  token.value = route.query.token as string || '';
  if (!token.value) {
    error.value = 'Invalid or missing reset token';
  }
});

const handleSubmit = async () => {
  if (!token.value) {
    error.value = 'Invalid or missing reset token';
    return;
  }
  if (password.value !== confirmPassword.value) {
    error.value = 'Passwords do not match';
    return;
  }

  loading.value = true;
  error.value = '';
  success.value = '';

  try {
    await axios.post('/api/auth/reset-password', {
      token: token.value,
      password: password.value
    });
    success.value = 'Password has been reset successfully';
    setTimeout(() => {
      router.push('/login');
    }, 2000);
  } catch (err: any) {
    error.value = err.response?.data?.message || 'An error occurred';
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.reset-password { max-width: 400px; margin: 2rem auto; }
.error { color: red; }
.success { color: green; }
</style> 