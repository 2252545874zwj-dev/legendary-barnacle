<script setup lang="ts">
<<<<<<< HEAD
import { ref, onMounted, computed, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useInfoStore } from '../stores/info'
import { Search, LogOut, User, Clock, ChevronRight, ArrowLeft, ArrowRight, Filter, X, Plus, Trash2, Eye, EyeOff, Edit2, Save, XCircle, Shield, Users } from 'lucide-vue-next'
import RichTextEditor from '../components/RichTextEditor.vue'
import { truncateText } from '../utils/markdown'
import { connectSocket, onInfoCreated, onInfoUpdated, onInfoDeleted, offInfoCreated, offInfoUpdated, offInfoDeleted, disconnectSocket } from '../services/socket'
=======
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useInfoStore } from '../stores/info'
import { Search, LogOut, User, Clock, ChevronRight, ArrowLeft, ArrowRight, Filter, X, Plus, Trash2, Eye, EyeOff, Edit2, Save, XCircle } from 'lucide-vue-next'
import RichTextEditor from '../components/RichTextEditor.vue'
import { truncateText } from '../utils/markdown'
>>>>>>> ac58535bee06e561eeda876df089ccdadedcee65

const router = useRouter()
const authStore = useAuthStore()
const infoStore = useInfoStore()

const keyword = ref('')
const selectedCategory = ref('all')
const currentPage = ref(1)

const categories = ref<{ id: string; name: string; count: number }[]>([])
const showAddForm = ref(false)
const editingId = ref<string | null>(null)

const newItem = ref({
  title: '',
  content: '',
  category: 'technology',
  isPrivate: false
})

const privacyFilter = ref<'all' | 'public' | 'private'>('all')

const handleLogout = () => {
  authStore.logout()
  router.push('/login')
}

const handleSearch = async () => {
  currentPage.value = 1
  await infoStore.search(keyword.value, selectedCategory.value, currentPage.value, 10, parseInt(authStore.user?.id || '0'), privacyFilter.value)
}

const goToPage = async (page: number) => {
  if (page < 1 || page > totalPages.value) return
  currentPage.value = page
  await infoStore.search(keyword.value, selectedCategory.value, currentPage.value, 10, parseInt(authStore.user?.id || '0'), privacyFilter.value)
}

const viewDetail = (id: string) => {
  if (editingId.value !== null) return
  
  const item = infoStore.searchResults.items.find(item => item.id.toString() === id)
  if (item) {
    item.viewCount = (item.viewCount || 0) + 1
  }
  
  router.push(`/info/${id}`)
}

const clearFilters = () => {
  keyword.value = ''
  selectedCategory.value = 'all'
  currentPage.value = 1
  infoStore.search('', 'all', 1)
}

const totalPages = computed(() => {
  return Math.ceil(infoStore.searchResults.total / infoStore.searchResults.pageSize)
})

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

const isOwnItem = (item: { userId?: number }) => {
  return item.userId === parseInt(authStore.user?.id || '0')
}

<<<<<<< HEAD
const isAdmin = () => {
  return authStore.user?.role === 'admin'
}

=======
>>>>>>> ac58535bee06e561eeda876df089ccdadedcee65
const handleAddInfo = async () => {
  if (!newItem.value.title || !newItem.value.content || !newItem.value.category) {
    alert('请填写完整信息')
    return
  }

  try {
    await infoStore.createInfo({
      title: newItem.value.title,
      content: newItem.value.content,
      category: newItem.value.category,
      userId: parseInt(authStore.user?.id || '0'),
      isPrivate: newItem.value.isPrivate
    })

    newItem.value = { title: '', content: '', category: 'technology', isPrivate: false }
    showAddForm.value = false
    await infoStore.search(keyword.value, selectedCategory.value, currentPage.value)
    alert('信息添加成功')
  } catch (error) {
    alert('添加失败，请重试')
  }
}

const startEdit = (item: typeof infoStore.searchResults.items[0]) => {
  editingId.value = item.id
  newItem.value = {
    title: item.title,
    content: item.content,
    category: item.category,
    isPrivate: item.isPrivate
  }
}

const handleUpdateInfo = async (id: string) => {
  if (!newItem.value.title || !newItem.value.content || !newItem.value.category) {
    alert('请填写完整信息')
    return
  }

  try {
    await infoStore.updateInfo(parseInt(id), {
      title: newItem.value.title,
      content: newItem.value.content,
      category: newItem.value.category,
      userId: parseInt(authStore.user?.id || '0'),
      isPrivate: newItem.value.isPrivate
    })

    editingId.value = null
    newItem.value = { title: '', content: '', category: 'technology', isPrivate: false }
    await infoStore.search(keyword.value, selectedCategory.value, currentPage.value)
    alert('信息更新成功')
  } catch (error) {
    alert('更新失败，请重试')
  }
}

const cancelEdit = () => {
  editingId.value = null
  newItem.value = { title: '', content: '', category: 'technology', isPrivate: false }
}

const handleDeleteInfo = async (id: string) => {
  if (!confirm('确定要删除这条信息吗？')) return

  try {
    await infoStore.deleteInfo(parseInt(id), parseInt(authStore.user?.id || '0'))
    await infoStore.search(keyword.value, selectedCategory.value, currentPage.value)
    alert('信息删除成功')
  } catch (error) {
    alert('删除失败，请重试')
  }
}

<<<<<<< HEAD
const handleInfoCreated = async () => {
  await infoStore.search(keyword.value, selectedCategory.value, currentPage.value, 10, parseInt(authStore.user?.id || '0'), privacyFilter.value)
}

const handleInfoUpdated = async () => {
  await infoStore.search(keyword.value, selectedCategory.value, currentPage.value, 10, parseInt(authStore.user?.id || '0'), privacyFilter.value)
}

const handleInfoDeleted = async () => {
  await infoStore.search(keyword.value, selectedCategory.value, currentPage.value, 10, parseInt(authStore.user?.id || '0'), privacyFilter.value)
}

onMounted(async () => {
  connectSocket()
  onInfoCreated(handleInfoCreated)
  onInfoUpdated(handleInfoUpdated)
  onInfoDeleted(handleInfoDeleted)
  categories.value = await infoStore.getCategories()
  await infoStore.search('', 'all', 1, 10, parseInt(authStore.user?.id || '0'))
})

onUnmounted(() => {
  offInfoCreated(handleInfoCreated)
  offInfoUpdated(handleInfoUpdated)
  offInfoDeleted(handleInfoDeleted)
  disconnectSocket()
})
=======
onMounted(async () => {
  categories.value = await infoStore.getCategories()
  await infoStore.search('', 'all', 1, 10, parseInt(authStore.user?.id || '0'))
})
>>>>>>> ac58535bee06e561eeda876df089ccdadedcee65
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <header class="bg-white shadow-sm sticky top-0 z-10">
      <div class="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center">
            <Search class="w-6 h-6 text-white" />
          </div>
          <h1 class="text-xl font-bold text-gray-800">信息论坛</h1>
        </div>

        <div class="flex items-center gap-4">
          <div class="flex items-center gap-2 text-gray-600">
            <User class="w-5 h-5" />
            <span>{{ authStore.user?.name }}</span>
<<<<<<< HEAD
            <span v-if="isAdmin()" class="flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full bg-yellow-100 text-yellow-700">
              <Shield class="w-3 h-3" />
              管理员
            </span>
          </div>
          <button
            @click="router.push('/profile')"
            class="flex items-center gap-2 px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            <span>编辑资料</span>
          </button>
          <button
            v-if="isAdmin()"
            @click="router.push('/admin')"
            class="flex items-center gap-2 px-4 py-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
          >
            <Users class="w-4 h-4" />
            <span>管理用户</span>
          </button>
          <button
=======
          </div>
          <button
>>>>>>> ac58535bee06e561eeda876df089ccdadedcee65
            @click="handleLogout"
            class="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <LogOut class="w-4 h-4" />
            <span>退出登录</span>
          </button>
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
              placeholder="输入关键词搜索信息..."
              class="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
              @keyup.enter="handleSearch"
            />
          </div>

          <div class="flex items-center gap-2">
            <Filter class="w-5 h-5 text-gray-400" />
            <select
              v-model="selectedCategory"
              class="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none bg-white"
              @change="handleSearch"
            >
              <option value="all">全部</option>
              <option v-for="cat in categories" :key="cat.id" :value="cat.id">
                {{ cat.name }} ({{ cat.count }})
              </option>
            </select>

            <button
              @click="clearFilters"
              v-if="keyword || selectedCategory !== 'all'"
              class="px-4 py-3 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-2"
            >
              <X class="w-4 h-4" />
              清除
            </button>

            <button
              @click="handleSearch"
              class="px-6 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 focus:ring-4 focus:ring-indigo-300 transition-all"
            >
              搜索
            </button>

            <button
              @click="showAddForm = !showAddForm"
              class="px-4 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 focus:ring-4 focus:ring-green-300 transition-all flex items-center gap-2"
            >
              <Plus class="w-5 h-5" />
              新增信息
            </button>
          </div>
        </div>

        <div v-if="showAddForm" class="mt-6 p-4 border border-gray-200 rounded-lg bg-gray-50">
          <h3 class="font-semibold text-gray-800 mb-4">新增信息</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">标题</label>
              <input
                v-model="newItem.title"
                type="text"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                placeholder="输入标题"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">分类</label>
              <select
                v-model="newItem.category"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
              >
                <option value="technology">技术</option>
                <option value="news">新闻</option>
                <option value="product">产品</option>
                <option value="other">其他</option>
              </select>
            </div>
            <div class="md:col-span-2">
              <label class="block text-sm font-medium text-gray-700 mb-1">内容</label>
              <RichTextEditor v-model="newItem.content" />
            </div>
            <div class="md:col-span-2">
              <label class="flex items-center gap-2 cursor-pointer">
                <input
                  v-model="newItem.isPrivate"
                  type="checkbox"
                  class="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                />
                <span class="text-sm text-gray-700">设为私密（仅自己可见）</span>
              </label>
            </div>
          </div>
          <div class="mt-4 flex justify-end gap-2">
            <button
              @click="showAddForm = false; newItem = { title: '', content: '', category: 'technology', isPrivate: false }"
              class="px-4 py-2 text-gray-600 hover:bg-gray-200 rounded-lg transition-colors"
            >
              取消
            </button>
            <button
              @click="handleAddInfo"
              class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              保存
            </button>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-xl shadow-sm overflow-hidden">
        <div class="p-4 border-b border-gray-100 flex items-center justify-between flex-wrap gap-4">
          <p class="text-gray-600">共找到 <span class="font-semibold text-indigo-600">{{ infoStore.searchResults.total }}</span> 条结果</p>
          <div class="flex items-center gap-2">
            <span class="text-sm text-gray-500">显示：</span>
            <select
              v-model="privacyFilter"
              class="px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
              @change="handleSearch"
            >
              <option value="all">全部</option>
              <option value="public">公共信息</option>
              <option value="private">私人信息</option>
            </select>
            <div class="flex items-center gap-2 text-sm text-gray-500 ml-4">
              <Eye class="w-4 h-4" />
              <span>公开</span>
              <EyeOff class="w-4 h-4 ml-4" />
              <span>私密</span>
            </div>
          </div>
        </div>

        <div v-if="infoStore.loading" class="p-12 text-center">
          <svg class="animate-spin h-8 w-8 text-indigo-600 mx-auto" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none" />
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <p class="mt-2 text-gray-500">加载中...</p>
        </div>

        <div v-else-if="infoStore.searchResults.items.length === 0" class="p-12 text-center">
          <Search class="w-16 h-16 text-gray-300 mx-auto" />
          <p class="mt-4 text-gray-500">没有找到相关信息</p>
          <button
            @click="clearFilters"
            class="mt-4 px-4 py-2 text-indigo-600 hover:bg-indigo-50 rounded-lg"
          >
            清除筛选条件
          </button>
        </div>

        <div v-else class="divide-y divide-gray-100">
          <div
            v-for="item in infoStore.searchResults.items"
            :key="item.id"
            class="p-4 hover:bg-gray-50 transition-colors"
          >
            <div v-if="editingId === item.id" class="bg-yellow-50 p-4 rounded-lg">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">标题</label>
                  <input
                    v-model="newItem.title"
                    type="text"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">分类</label>
                  <select
                    v-model="newItem.category"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                  >
                    <option value="technology">技术</option>
                    <option value="news">新闻</option>
                    <option value="product">产品</option>
                    <option value="other">其他</option>
                  </select>
                </div>
                <div class="md:col-span-2">
                  <label class="block text-sm font-medium text-gray-700 mb-1">内容</label>
                  <RichTextEditor v-model="newItem.content" />
                </div>
                <div class="md:col-span-2">
                  <label class="flex items-center gap-2 cursor-pointer">
                    <input
                      v-model="newItem.isPrivate"
                      type="checkbox"
                      class="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                    />
                    <span class="text-sm text-gray-700">设为私密</span>
                  </label>
                </div>
              </div>
              <div class="mt-4 flex justify-end gap-2">
                <button
                  @click="cancelEdit"
                  class="px-4 py-2 text-gray-600 hover:bg-gray-200 rounded-lg transition-colors flex items-center gap-1"
                >
                  <XCircle class="w-4 h-4" />
                  取消
                </button>
                <button
                  @click="handleUpdateInfo(item.id)"
                  class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-1"
                >
                  <Save class="w-4 h-4" />
                  保存
                </button>
              </div>
            </div>

            <div v-else class="flex items-start justify-between gap-4">
              <div class="flex-1" @click="viewDetail(item.id)">
                <div class="flex items-center gap-2 mb-2">
                  <h3 class="text-lg font-semibold text-gray-800 hover:text-indigo-600 transition-colors cursor-pointer">
                    {{ item.title }}
                  </h3>
                  <span :class="['px-2 py-0.5 text-xs font-medium rounded-full', getCategoryColor(item.category)]">
                    {{ getCategoryName(item.category) }}
                  </span>
                  <span v-if="item.isPrivate" class="flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full bg-red-100 text-red-700">
                    <EyeOff class="w-3 h-3" />
                    私密
                  </span>
                  <span v-if="isOwnItem(item) && !item.isPrivate" class="flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full bg-green-100 text-green-700">
                    <Eye class="w-3 h-3" />
                    我的
                  </span>
                </div>
                <p class="text-gray-600 text-sm line-clamp-2 mb-3">
                  {{ truncateText(item.content, 80) }}
                </p>
                <div class="flex items-center gap-4 text-sm text-gray-400">
                  <span class="flex items-center gap-1">
                    <Clock class="w-4 h-4" />
                    {{ formatDate(item.updatedAt) }}
                  </span>
                  <span class="flex items-center gap-1">
                    <Eye class="w-4 h-4" />
                    {{ item.viewCount || 0 }} 浏览
                  </span>
                </div>
              </div>

              <div class="flex items-center gap-2 flex-shrink-0">
                <button
                  v-if="isOwnItem(item)"
                  @click.stop="startEdit(item)"
                  class="p-2 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                  title="编辑"
                >
                  <Edit2 class="w-4 h-4" />
                </button>
                <button
<<<<<<< HEAD
                  v-if="isOwnItem(item) || isAdmin()"
                  @click.stop="handleDeleteInfo(item.id)"
                  class="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  :title="isAdmin() ? '管理员删除' : '删除'"
=======
                  v-if="isOwnItem(item)"
                  @click.stop="handleDeleteInfo(item.id)"
                  class="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="删除"
>>>>>>> ac58535bee06e561eeda876df089ccdadedcee65
                >
                  <Trash2 class="w-4 h-4" />
                </button>
                <ChevronRight class="w-5 h-5 text-gray-400 cursor-pointer" @click="viewDetail(item.id)" />
              </div>
            </div>
          </div>
        </div>

        <div v-if="infoStore.searchResults.total > 0" class="p-4 border-t border-gray-100 flex items-center justify-between">
          <p class="text-sm text-gray-500">
            显示第 {{ (currentPage - 1) * infoStore.searchResults.pageSize + 1 }} - {{ Math.min(currentPage * infoStore.searchResults.pageSize, infoStore.searchResults.total) }} 条，共 {{ infoStore.searchResults.total }} 条
          </p>

          <div class="flex items-center gap-2">
            <button
              @click="goToPage(currentPage - 1)"
              :disabled="currentPage === 1"
              class="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ArrowLeft class="w-4 h-4" />
            </button>

            <span class="px-3 py-1 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg">
              {{ currentPage }} / {{ totalPages }}
            </span>

            <button
              @click="goToPage(currentPage + 1)"
              :disabled="currentPage === totalPages"
              class="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ArrowRight class="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>
