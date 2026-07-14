<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { User, Lock, Eye, EyeOff, AlertCircle, ArrowRight } from 'lucide-vue-next'

const router = useRouter()
const authStore = useAuthStore()

const form = ref({
  username: '',
  password: ''
})

const showPassword = ref(false)
const loading = ref(false)

const isFormValid = computed(() => {
  return form.value.username.trim() !== '' && form.value.password.trim() !== ''
})

const handleLogin = async () => {
  if (!isFormValid.value) {
    return
  }
  
  loading.value = true
  
  const success = await authStore.login(form.value)
  
  loading.value = false
  
  if (success) {
    router.push('/')
  }
}

const goToRegister = () => {
  router.push('/register')
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
    <div class="w-full max-w-md mx-4">
      <div class="bg-white rounded-2xl shadow-xl p-8">
        <div class="text-center mb-8">
          <div class="w-16 h-16 bg-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <User class="w-8 h-8 text-white" />
          </div>
          <h1 class="text-2xl font-bold text-gray-800">信息论坛</h1>
          <p class="text-gray-500 mt-2">欢迎登录</p>
        </div>
        
        <form @submit.prevent="handleLogin" class="space-y-6">
          <div v-if="authStore.errorMessage" class="flex items-center gap-2 text-red-500 bg-red-50 px-4 py-3 rounded-lg">
            <AlertCircle class="w-5 h-5" />
            <span>{{ authStore.errorMessage }}</span>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">用户名</label>
            <div class="relative">
              <User class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                v-model="form.username"
                type="text"
                placeholder="请输入用户名"
                class="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
              />
            </div>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">密码</label>
            <div class="relative">
              <Lock class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                v-model="form.password"
                :type="showPassword ? 'text' : 'password'"
                placeholder="请输入密码"
                class="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
              />
              <button
                type="button"
                @click="showPassword = !showPassword"
                class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <Eye v-if="showPassword" class="w-5 h-5" />
                <EyeOff v-else class="w-5 h-5" />
              </button>
            </div>
          </div>
          
          <div class="flex items-center justify-between text-sm">
            <label class="flex items-center gap-2">
              <input type="checkbox" class="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500" />
              <span class="text-gray-600">记住我</span>
            </label>
            <a href="#" class="text-indigo-600 hover:text-indigo-800">忘记密码？</a>
          </div>
          
          <button
            type="submit"
            :disabled="!isFormValid || loading"
            class="w-full py-3 px-4 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 focus:ring-4 focus:ring-indigo-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            <span v-if="loading" class="flex items-center justify-center gap-2">
              <svg class="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none" />
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              登录中...
            </span>
            <span v-else>登录</span>
          </button>
        </form>
        
        <div class="mt-6 flex items-center justify-center gap-2">
          <span class="text-gray-600">还没有账号？</span>
          <button
            @click="goToRegister"
            class="flex items-center gap-1 text-indigo-600 hover:text-indigo-800"
          >
            立即注册
            <ArrowRight class="w-4 h-4" />
          </button>
        </div>
        
        <div class="mt-4 text-center">
          <p class="text-gray-500 text-sm">
            测试账号：admin / admin123
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
