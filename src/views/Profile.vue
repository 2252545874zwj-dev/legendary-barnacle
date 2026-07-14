<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { ArrowLeft, User, Mail, Lock, Save, CheckCircle } from 'lucide-vue-next'
import { api } from '../services/api'

const router = useRouter()
const authStore = useAuthStore()

const form = ref({
  name: authStore.user?.name || '',
  email: authStore.user?.email || '',
  password: '',
  confirmPassword: ''
})

const errors = ref<Record<string, string>>({})
const successMessage = ref('')
const isSubmitting = ref(false)

const isAdmin = computed(() => authStore.user?.role === 'admin')

const validateForm = () => {
  errors.value = {}

  if (!form.value.name.trim()) {
    errors.value.name = '姓名不能为空'
  }

  if (!form.value.email.trim()) {
    errors.value.email = '邮箱不能为空'
  } else {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(form.value.email)) {
      errors.value.email = '邮箱格式不正确'
    }
  }

  if (form.value.password) {
    if (form.value.password.length < 6) {
      errors.value.password = '密码长度至少为6位'
    } else if (form.value.password !== form.value.confirmPassword) {
      errors.value.confirmPassword = '两次输入的密码不一致'
    }
  }

  return Object.keys(errors.value).length === 0
}

const handleSubmit = async () => {
  if (!validateForm()) return

  isSubmitting.value = true
  successMessage.value = ''

  try {
    const updateData: { email?: string; name?: string; password?: string } = {}
    
    if (form.value.email !== authStore.user?.email) {
      updateData.email = form.value.email
    }
    
    if (form.value.name !== authStore.user?.name) {
      updateData.name = form.value.name
    }
    
    if (form.value.password) {
      updateData.password = form.value.password
    }

    if (Object.keys(updateData).length === 0) {
      successMessage.value = '没有需要更新的内容'
      return
    }

    const response = await api.updateProfile(updateData)
    
    authStore.user = response.user
    authStore.token = response.token
    localStorage.setItem('token', response.token)
    localStorage.setItem('user', JSON.stringify(response.user))

    successMessage.value = '信息更新成功'
    form.value.password = ''
    form.value.confirmPassword = ''

    setTimeout(() => {
      successMessage.value = ''
    }, 3000)
  } catch (error: any) {
    const message = error.response?.data?.message || '更新失败，请重试'
    if (error.response?.data?.message?.includes('邮箱')) {
      errors.value.email = message
    } else {
      alert(message)
    }
  } finally {
    isSubmitting.value = false
  }
}

const handleBack = () => {
  router.push('/')
}
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <header class="bg-white shadow-sm sticky top-0 z-10">
      <div class="max-w-2xl mx-auto px-4 py-4 flex items-center gap-4">
        <button
          @click="handleBack"
          class="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft class="w-5 h-5 text-gray-600" />
        </button>
        <h1 class="text-xl font-bold text-gray-800">个人资料</h1>
      </div>
    </header>

    <main class="max-w-2xl mx-auto px-4 py-6">
      <div class="bg-white rounded-xl shadow-sm p-6 mb-6">
        <div class="flex items-center gap-4 mb-6">
          <div class="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center">
            <User class="w-8 h-8 text-indigo-600" />
          </div>
          <div>
            <h2 class="text-lg font-semibold text-gray-800">{{ authStore.user?.name }}</h2>
            <p class="text-sm text-gray-500">{{ authStore.user?.username }}</p>
            <span v-if="isAdmin" class="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full bg-yellow-100 text-yellow-700 mt-1">
              管理员
            </span>
          </div>
        </div>

        <form @submit.prevent="handleSubmit" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              <User class="w-4 h-4 inline mr-1" />
              姓名
            </label>
            <input
              v-model="form.name"
              type="text"
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
              :class="{ 'border-red-500': errors.name }"
            />
            <p v-if="errors.name" class="mt-1 text-sm text-red-500">{{ errors.name }}</p>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              <Mail class="w-4 h-4 inline mr-1" />
              邮箱
            </label>
            <input
              v-model="form.email"
              type="email"
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
              :class="{ 'border-red-500': errors.email }"
            />
            <p v-if="errors.email" class="mt-1 text-sm text-red-500">{{ errors.email }}</p>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              <Lock class="w-4 h-4 inline mr-1" />
              密码（留空表示不修改）
            </label>
            <input
              v-model="form.password"
              type="password"
              placeholder="请输入新密码"
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
              :class="{ 'border-red-500': errors.password }"
            />
            <p v-if="errors.password" class="mt-1 text-sm text-red-500">{{ errors.password }}</p>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              <Lock class="w-4 h-4 inline mr-1" />
              确认密码
            </label>
            <input
              v-model="form.confirmPassword"
              type="password"
              placeholder="请再次输入新密码"
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
              :class="{ 'border-red-500': errors.confirmPassword }"
            />
            <p v-if="errors.confirmPassword" class="mt-1 text-sm text-red-500">{{ errors.confirmPassword }}</p>
          </div>

          <div v-if="successMessage" class="flex items-center gap-2 px-4 py-3 bg-green-50 border border-green-200 rounded-lg text-green-700">
            <CheckCircle class="w-5 h-5" />
            <span>{{ successMessage }}</span>
          </div>

          <button
            type="submit"
            :disabled="isSubmitting"
            class="w-full px-6 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            <Save class="w-4 h-4" />
            <span>{{ isSubmitting ? '保存中...' : '保存修改' }}</span>
          </button>
        </form>
      </div>
    </main>
  </div>
</template>