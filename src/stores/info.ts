import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { InfoItem, SearchResult, Category, Comment } from '../types'
import { api } from '../services/api'

export const useInfoStore = defineStore('info', () => {
  const items = ref<InfoItem[]>([])
  const categories = ref<Category[]>([])
  const searchResults = ref<SearchResult>({
    items: [],
    total: 0,
    page: 1,
    pageSize: 10
  })
  const currentInfo = ref<InfoItem | null>(null)
  const loading = ref(false)

  const search = async (keyword: string, category?: string, page = 1, pageSize = 10, userId?: number, privacyFilter: 'all' | 'public' | 'private' = 'all') => {
    loading.value = true
    try {
      searchResults.value = await api.searchInfo(keyword, category, page, pageSize, userId, privacyFilter)
      return searchResults.value
    } finally {
      loading.value = false
    }
  }

  const getCategories = async () => {
    if (categories.value.length > 0) return categories.value
    loading.value = true
    try {
      categories.value = await api.getCategories()
      return categories.value
    } finally {
      loading.value = false
    }
  }

  const updateSearchResultViewCount = (infoId: number, newViewCount: number) => {
    const itemIndex = searchResults.value.items.findIndex(item => parseInt(item.id) === infoId)
    if (itemIndex !== -1) {
      searchResults.value.items[itemIndex].viewCount = newViewCount
    }
  }

  const getInfoById = async (id: number, userId?: number) => {
    loading.value = true
    try {
      const info = await api.getInfoById(id.toString(), userId)
      currentInfo.value = info
      
      if (info) {
        updateSearchResultViewCount(id, info.viewCount || 0)
      }
      
      return currentInfo.value
    } finally {
      loading.value = false
    }
  }

  const createInfo = async (form: { title: string; content: string; category: string; userId: number; isPrivate: boolean }) => {
    loading.value = true
    try {
      return await api.createInfo(form)
    } finally {
      loading.value = false
    }
  }

  const updateInfo = async (id: number, form: { title: string; content: string; category: string; userId: number; isPrivate: boolean }) => {
    loading.value = true
    try {
      return await api.updateInfo(id, form)
    } finally {
      loading.value = false
    }
  }

  const deleteInfo = async (id: number, userId: number) => {
    loading.value = true
    try {
      return await api.deleteInfo(id, userId)
    } finally {
      loading.value = false
    }
  }

  const getComments = async (infoId: number): Promise<Comment[]> => {
    try {
      return await api.getComments(infoId.toString())
    } catch (error) {
      console.error('Failed to get comments:', error)
      return []
    }
  }

  const addComment = async (infoId: number, form: { content: string; userId: number; userName: string }) => {
    try {
      return await api.addComment(infoId.toString(), form)
    } catch (error) {
      console.error('Failed to add comment:', error)
      throw error
    }
  }

  const deleteComment = async (commentId: number, userId: number) => {
    try {
      return await api.deleteComment(commentId, userId)
    } catch (error) {
      console.error('Failed to delete comment:', error)
      throw error
    }
  }

  return {
    items,
    categories,
    searchResults,
    currentInfo,
    loading,
    search,
    getCategories,
    getInfoById,
    createInfo,
    updateInfo,
    deleteInfo,
    getComments,
    addComment,
    deleteComment,
    updateSearchResultViewCount
  }
})
