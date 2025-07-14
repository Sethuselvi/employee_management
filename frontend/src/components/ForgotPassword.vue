<template>
  <div class="flex items-center justify-center min-h-[60vh]">
    <div class="bg-white shadow-md rounded px-8 pt-6 pb-8 w-full max-w-sm">
      <h2 class="text-2xl font-bold mb-6 text-center text-gray-800">Forgot Password</h2>
      <form @submit.prevent="submitEmail">
        <div class="mb-4">
          <label for="email" class="block text-gray-700 text-sm font-bold mb-2">Email:</label>
          <input type="email" v-model="email" required class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
        </div>
        <button type="submit" class="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 font-semibold">Send Reset Link</button>
      </form>
      <div v-if="resetUrl" class="mt-4 bg-green-100 text-green-800 p-2 rounded text-sm">
        <p><strong>Reset Link:</strong></p>
        <a :href="resetUrl" class="text-blue-600 underline break-all">{{ resetUrl }}</a>
        <p class="mt-2"><router-link to="/reset-password">Click the link above to reset your password.</router-link></p>
      </div>
      <div v-if="error" class="mt-4 text-red-600 text-sm">{{ error }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import axios from 'axios'

const email = ref('')
const resetUrl = ref('')
const error = ref('')

const submitEmail = async () => {
  error.value = ''
  resetUrl.value = ''
  try {
    const res = await axios.post('/api/auth/forgot-password', { email: email.value })
    // If backend returns a preview (for dev), try to fetch the token from the preview email for demo, else use the real flow
    if (res.data.resetUrl) {
      resetUrl.value = res.data.resetUrl
    } else if (res.data.preview) {
      // For dev/ethereal: fetch the email preview and extract the reset link
      resetUrl.value = '(Check your email for the reset link)'
    } else {
      resetUrl.value = '(Check your email for the reset link)'
    }
  } catch (err: any) {
    error.value = err.response?.data?.msg || 'Error sending reset link'
  }
}
</script>

<style scoped>
.forgot-password { max-width: 400px; margin: 2rem auto; }
.error { color: red; }
</style> 