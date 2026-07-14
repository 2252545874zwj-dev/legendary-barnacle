import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { User, LoginForm, RegisterForm } from '../types'
import { api } from '../services/api'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const token = ref<string | null>(localStorage.getItem('token') || null)
  const errorMessage = ref('')

  const isAuthenticated = () => {
    return token.value !== null && user.value !== null
  }

  const login = async (form: LoginForm): Promise<boolean> => {
    errorMessage.value = ''
    try {
      const response = await api.login(form)
      token.value = response.token
      user.value = response.user
      localStorage.setItem('token', response.token)
      localStorage.setItem('user', JSON.stringify(response.user))
      return true
    } catch (error: any) {
      errorMessage.value = error.response?.data?.message || '登录失败'
      console.error('Login failed:', error)
      return false
    }
  }

  const register = async (form: RegisterForm): Promise<boolean> => {
    errorMessage.value = ''
    try {
      const response = await api.register(form)
      token.value = response.token
      user.value = response.user
      localStorage.setItem('token', response.token)
      localStorage.setItem('user', JSON.stringify(response.user))
      return true
    } catch (error: any) {
      errorMessage.value = error.response?.data?.message || '注册失败'
      console.error('Register failed:', error)
      return false
    }
  }

  const logout = () => {
    token.value = null
    user.value = null
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  }

  const initFromStorage = () => {
    const storedUser = localStorage.getItem('user')
    if (storedUser) {
      try {
        user.value = JSON.parse(storedUser)
      } catch (e) {
        console.error('Failed to parse stored user:', e)
      }
    }
  }

  return {
    user,
    token,
    errorMessage,
    isAuthenticated,
    login,
    register,
    logout,
    initFromStorage
  }
})
