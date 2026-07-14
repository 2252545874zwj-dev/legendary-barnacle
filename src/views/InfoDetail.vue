<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useInfoStore } from '../stores/info'
import { Calendar, Clock, Eye, MessageSquare, Send, Trash2 } from 'lucide-vue-next'
import MarkdownRenderer from '../components/MarkdownRenderer.vue'
import type { Comment } from '../types'
import { connectSocket, onCommentAdded, onCommentDeleted, onInfoUpdated, offCommentAdded, offCommentDeleted, offInfoUpdated, disconnectSocket } from '../services/socket'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const infoStore = useInfoStore()

const infoId = ref('')
const newComment = ref('')
const comments = ref<Comment[]>([])
const commentsLoading = ref(false)
const submittingComment = ref(false)

const loadInfo = async () => {
  const id = route.params.id as string
  infoId.value = id
  await infoStore.getInfoById(parseInt(id), parseInt(authStore.user?.id || '0'))
}

const loadComments = async () => {
  commentsLoading.value = true
  try {
    comments.value = await infoStore.getComments(parseInt(infoId.value))
  } catch (e) {
    console.error('Failed to load comments:', e)
  } finally {
    commentsLoading.value = false
  }
}

const handleSubmitComment = async () => {
  if (!newComment.value.trim()) return
  submittingComment.value = true
  try {
    await infoStore.addComment(parseInt(infoId.value), {
      content: newComment.value,
      userId: parseInt(authStore.user?.id || '0'),
      userName: authStore.user?.name || '匿名用户'
    })
    newComment.value = ''
    await loadComments()
  } catch (e) {
    console.error('Failed to submit comment:', e)
    alert('留言失败，请重试')
  } finally {
    submittingComment.value = false
  }
}

const handleDeleteComment = async (commentId: number) => {
  if (!confirm('确定要删除这条留言吗？')) return
  try {
    await infoStore.deleteComment(commentId, parseInt(authStore.user?.id || '0'))
    await loadComments()
  } catch (e) {
    console.error('Failed to delete comment:', e)
    alert('删除失败，请重试')
  }
}

const isOwnComment = (comment: Comment) => {
  return comment.userId === parseInt(authStore.user?.id || '0')
}

const isAdmin = () => {
  return authStore.user?.role === 'admin'
}

const handleDeleteInfo = async () => {
  if (!confirm('确定要删除这条帖子吗？')) return
  try {
    await infoStore.deleteInfo(parseInt(infoId.value), parseInt(authStore.user?.id || '0'))
    router.push('/')
  } catch (e) {
    console.error('Failed to delete info:', e)
    alert('删除失败，请重试')
  }
}

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

const handleCommentAdded = async (data: { infoId?: number }) => {
  if (data.infoId === parseInt(infoId.value)) {
    await loadComments()
  }
}

const handleCommentDeleted = async () => {
  await loadComments()
}

const handleInfoUpdated = async (data: { id: number }) => {
  if (data.id === parseInt(infoId.value)) {
    await loadInfo()
  }
}

onMounted(async () => {
  connectSocket()
  onCommentAdded(handleCommentAdded)
  onCommentDeleted(handleCommentDeleted)
  onInfoUpdated(handleInfoUpdated)
  await loadInfo()
  await loadComments()
})

onUnmounted(() => {
  offCommentAdded(handleCommentAdded)
  offCommentDeleted(handleCommentDeleted)
  offInfoUpdated(handleInfoUpdated)
  disconnectSocket()
})
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <header class="bg-white shadow-sm sticky top-0 z-10">
      <div class="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
        <button
          @click="router.back()"
          class="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 class="text-xl font-bold text-gray-800">信息论坛</h1>
      </div>
    </header>

    <main class="max-w-4xl mx-auto px-4 py-6">
      <div v-if="infoStore.currentInfo" class="bg-white rounded-xl shadow-sm p-6 mb-6">
        <div class="flex items-center justify-between mb-4">
          <div class="flex items-center gap-2">
            <span :class="[
              'px-3 py-1 text-sm font-medium rounded-full',
              infoStore.currentInfo.category === 'technology' ? 'bg-blue-100 text-blue-700' :
              infoStore.currentInfo.category === 'news' ? 'bg-green-100 text-green-700' :
              infoStore.currentInfo.category === 'product' ? 'bg-purple-100 text-purple-700' :
              'bg-gray-100 text-gray-700'
            ]">
              {{ infoStore.currentInfo.category === 'technology' ? '技术' :
                 infoStore.currentInfo.category === 'news' ? '新闻' :
                 infoStore.currentInfo.category === 'product' ? '产品' : '其他' }}
            </span>
            <span v-if="infoStore.currentInfo.isPrivate" class="px-3 py-1 text-sm font-medium rounded-full bg-red-100 text-red-700">
              私密
            </span>
          </div>
          <button
            v-if="isAdmin()"
            @click="handleDeleteInfo"
            class="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <Trash2 class="w-4 h-4" />
            <span>删除帖子</span>
          </button>
        </div>

        <h2 class="text-2xl font-bold text-gray-800 mb-4">{{ infoStore.currentInfo.title }}</h2>

        <div class="flex flex-wrap items-center gap-4 mb-6 text-sm text-gray-500">
          <span class="flex items-center gap-1">
            <Calendar class="w-4 h-4" />
            创建于 {{ formatDate(infoStore.currentInfo.createdAt) }}
          </span>
          <span class="flex items-center gap-1">
            <Clock class="w-4 h-4" />
            更新于 {{ formatDate(infoStore.currentInfo.updatedAt) }}
          </span>
          <span class="flex items-center gap-1">
            <Eye class="w-4 h-4" />
            {{ infoStore.currentInfo.viewCount || 0 }} 次浏览
          </span>
        </div>

        <div class="prose max-w-none">
          <MarkdownRenderer :content="infoStore.currentInfo.content" />
        </div>
      </div>

      <div v-else class="bg-white rounded-xl shadow-sm p-12 text-center">
        <svg class="animate-spin h-8 w-8 text-indigo-600 mx-auto" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none" />
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
        <p class="mt-4 text-gray-500">加载中...</p>
      </div>

      <div class="mt-6 bg-white rounded-xl shadow-sm p-6">
        <div class="flex items-center gap-2 mb-4">
          <MessageSquare class="w-5 h-5 text-indigo-600" />
          <h2 class="text-lg font-semibold text-gray-800">留言 ({{ comments.length }})</h2>
        </div>

        <div v-if="authStore.isAuthenticated()" class="mb-6">
          <div class="flex gap-3">
            <input
              v-model="newComment"
              type="text"
              placeholder="写下你的留言..."
              class="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
              @keyup.enter="handleSubmitComment"
            />
            <button
              @click="handleSubmitComment"
              :disabled="!newComment.trim() || submittingComment"
              class="px-6 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              <Send class="w-4 h-4" />
              发送
            </button>
          </div>
        </div>

        <div v-else class="mb-6 p-4 bg-yellow-50 rounded-lg text-center text-gray-600">
          请登录后发表留言
        </div>

        <div v-if="commentsLoading" class="text-center py-8">
          <svg class="animate-spin h-6 w-6 text-indigo-600 mx-auto" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none" />
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        </div>

        <div v-else-if="comments.length === 0" class="text-center py-8 text-gray-500">
          暂无留言，发表第一条留言吧
        </div>

        <div v-else class="space-y-4">
          <div
            v-for="comment in comments"
            :key="comment.id"
            class="p-4 bg-gray-50 rounded-lg"
          >
            <div class="flex items-start justify-between gap-3">
              <div class="flex-1">
                <div class="flex items-center gap-2 mb-1">
                  <span class="font-medium text-gray-800">{{ comment.userName }}</span>
                  <span class="text-xs text-gray-400">{{ formatDate(comment.createdAt) }}</span>
                </div>
                <p class="text-gray-600">{{ comment.content }}</p>
              </div>
              <button
                v-if="isOwnComment(comment)"
                @click="handleDeleteComment(comment.id)"
                class="p-1 text-gray-400 hover:text-red-500 transition-colors"
                title="删除留言"
              >
                <Trash2 class="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>
