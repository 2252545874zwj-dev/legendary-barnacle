<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { Users, ArrowLeft, Eye, EyeOff, Trash2, Clock, X, Search, ChevronRight } from 'lucide-vue-next'
import { api, type AdminUser, type InfoItem } from '../services/api'

const router = useRouter()
const authStore = useAuthStore()

const users = ref<AdminUser[]>([])
const loading = ref(false)
const selectedUser = ref<AdminUser | null>(null)
const userPosts = ref<InfoItem[]>([])
const keyword = ref('')

const formatDate = (dateString: string) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const getRoleBadge = (role: string) => {
  if (role === 'admin') {
    return { text: '管理员', class: 'bg-yellow-100 text-yellow-700' }
  }
  return { text: '普通用户', class: 'bg-gray-100 text-gray-700' }
}

const getCategoryName = (categoryId: string) => {
  const categoryMap: Record<string, string> = {
    technology: '技术',
    news: '新闻',
    product: '产品',
    other: '其他'
  }
  return categoryMap[categoryId] || categoryId
}

const getCategoryColor = (categoryId: string) => {
  const colors: Record<string, string> = {
    technology: 'bg-blue-100 text-blue-700',
    news: 'bg-green-100 text-green-700',
    product: 'bg-purple-100 text-purple-700',
    other: 'bg-gray-100 text-gray-700'
  }
  return colors[categoryId] || 'bg-gray-100 text-gray-700'
}

const loadUsers = async () => {
  loading.value = true
  try {
    users.value = await api.adminGetUsers()
  } catch (error) {
    console.error('Failed to load users:', error)
    alert('加载用户列表失败')
  } finally {
    loading.value = false
  }
}

const viewUserPosts = async (user: AdminUser) => {
  selectedUser.value = user
  try {
    const posts = await api.adminGetUserPosts(user.id)
    console.log('Loaded posts:', posts)
    userPosts.value = posts.map(post => ({
      ...post,
      isPrivate: post.isPrivate !== undefined ? post.isPrivate : (post.is_private === 1)
    }))
  } catch (error) {
    console.error('Failed to load user posts:', error)
    alert('加载用户帖子失败')
  }
}

const closeUserPosts = () => {
  selectedUser.value = null
  userPosts.value = []
}

const deleteUserPost = async (postId: number) => {
  if (!selectedUser.value || !confirm('确定要删除这条帖子吗？')) return
  
  try {
    await api.adminDeleteUserPost(selectedUser.value.id, postId)
    userPosts.value = userPosts.value.filter(p => parseInt(p.id) !== postId)
    alert('帖子删除成功')
  } catch (error) {
    console.error('Failed to delete post:', error)
    alert('删除失败，请重试')
  }
}

const viewPostDetail = (postId: string) => {
  closeUserPosts()
  router.push(`/info/${postId}`)
}

const handleBack = () => {
  router.push('/')
}

const filteredUsers = () => {
  if (!keyword.value.trim()) return users.value
  const kw = keyword.value.toLowerCase()
  return users.value.filter(u => 
    u.username.toLowerCase().includes(kw) || 
    u.name.toLowerCase().includes(kw) ||
    u.email.toLowerCase().includes(kw)
  )
}

onMounted(async () => {
  if (authStore.user?.role !== 'admin') {
    router.push('/')
    return
  }
  await loadUsers()
})
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <header class="bg-white shadow-sm sticky top-0 z-10">
      <div class="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <button
            @click="handleBack"
            class="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft class="w-5 h-5 text-gray-600" />
          </button>
          <div class="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center">
            <Users class="w-6 h-6 text-white" />
          </div>
          <h1 class="text-xl font-bold text-gray-800">用户管理</h1>
        </div>
        <div class="flex items-center gap-2 text-gray-600">
          <span>{{ authStore.user?.name }}</span>
          <span class="px-2 py-0.5 text-xs font-medium rounded-full bg-yellow-100 text-yellow-700">
            管理员
          </span>
        </div>
      </div>
    </header>

    <main class="max-w-6xl mx-auto px-4 py-6">
      <div class="bg-white rounded-xl shadow-sm p-6 mb-6">
        <div class="flex flex-col lg:flex-row gap-4">
          <div class="flex-1 relative">
            <Search class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              v-model="keyword"
              type="text"
              placeholder="搜索用户名、姓名或邮箱..."
              class="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
            />
          </div>
          <div class="flex items-center gap-2 text-sm text-gray-500">
            <Users class="w-4 h-4" />
            <span>共 {{ users.length }} 名用户</span>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-xl shadow-sm overflow-hidden">
        <div class="p-4 border-b border-gray-100">
          <h2 class="font-semibold text-gray-800">用户列表</h2>
        </div>

        <div v-if="loading" class="p-12 text-center">
          <svg class="animate-spin h-8 w-8 text-indigo-600 mx-auto" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none" />
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <p class="mt-2 text-gray-500">加载中...</p>
        </div>

        <div v-else-if="filteredUsers().length === 0" class="p-12 text-center">
          <Users class="w-16 h-16 text-gray-300 mx-auto" />
          <p class="mt-4 text-gray-500">没有找到相关用户</p>
        </div>

        <div v-else class="divide-y divide-gray-100">
          <div
            v-for="user in filteredUsers()"
            :key="user.id"
            class="p-4 hover:bg-gray-50 transition-colors flex items-center justify-between"
          >
            <div class="flex items-center gap-4">
              <div class="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
                <Users class="w-6 h-6 text-indigo-600" />
              </div>
              <div>
                <div class="flex items-center gap-2">
                  <h3 class="font-semibold text-gray-800">{{ user.name }}</h3>
                  <span :class="['px-2 py-0.5 text-xs font-medium rounded-full', getRoleBadge(user.role).class]">
                    {{ getRoleBadge(user.role).text }}
                  </span>
                </div>
                <p class="text-sm text-gray-500 mt-1">{{ user.username }} · {{ user.email }}</p>
                <p class="text-xs text-gray-400 mt-1">注册于 {{ formatDate(user.created_at) }}</p>
              </div>
            </div>
            <button
              @click="viewUserPosts(user)"
              class="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <Eye class="w-4 h-4" />
              <span>查看帖子</span>
            </button>
          </div>
        </div>
      </div>
    </main>

    <div
      v-if="selectedUser"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      @click.self="closeUserPosts"
    >
      <div class="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[80vh] overflow-hidden">
        <div class="p-4 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h3 class="font-semibold text-gray-800">用户帖子 - {{ selectedUser.name }}</h3>
            <p class="text-sm text-gray-500">{{ userPosts.length }} 条帖子</p>
          </div>
          <button
            @click="closeUserPosts"
            class="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X class="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div class="p-4 overflow-y-auto max-h-[60vh]">
          <div v-if="userPosts.length === 0" class="text-center py-8">
            <p class="text-gray-500">该用户暂无帖子</p>
          </div>
          <div v-else class="space-y-4">
            <div
              v-for="post in userPosts"
              :key="post.id"
              @click="viewPostDetail(post.id)"
              class="p-4 border border-gray-200 rounded-lg hover:border-indigo-300 transition-colors cursor-pointer"
            >
              <div class="flex items-start justify-between gap-4">
                <div class="flex-1">
                  <div class="flex items-center gap-2 mb-2">
                    <h4 class="font-semibold text-gray-800">{{ post.title }}</h4>
                    <span :class="['px-2 py-0.5 text-xs font-medium rounded-full', getCategoryColor(post.category)]">
                      {{ getCategoryName(post.category) }}
                    </span>
                    <span :class="['flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full', post.isPrivate ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700']">
                      <component :is="post.isPrivate ? EyeOff : Eye" class="w-3 h-3" />
                      {{ post.isPrivate ? '私密' : '公开' }}
                    </span>
                  </div>
                  <p class="text-gray-600 text-sm line-clamp-2">{{ post.content }}</p>
                  <div class="flex items-center gap-4 text-sm text-gray-400 mt-3">
                    <span class="flex items-center gap-1">
                      <Clock class="w-4 h-4" />
                      {{ formatDate(post.updatedAt) }}
                    </span>
                    <span class="flex items-center gap-1">
                      <Eye class="w-4 h-4" />
                      {{ post.viewCount || 0 }} 浏览
                    </span>
                  </div>
                </div>
                <div class="flex items-center gap-2 flex-shrink-0">
                  <button
                    @click.stop="deleteUserPost(parseInt(post.id))"
                    class="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="删除帖子"
                  >
                    <Trash2 class="w-4 h-4" />
                  </button>
                  <ChevronRight class="w-5 h-5 text-gray-400" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>