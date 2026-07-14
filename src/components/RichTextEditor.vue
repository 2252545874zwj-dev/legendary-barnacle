<script setup lang="ts">
import { ref, watch } from 'vue'
import { Bold, Italic, Code, Link, Image, List, ListOrdered, Upload } from 'lucide-vue-next'

const props = defineProps<{
  modelValue: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const textareaRef = ref<HTMLTextAreaElement | null>(null)
const fileInputRef = ref<HTMLInputElement | null>(null)
const isUploading = ref(false)

const insertText = (before: string, after: string = '', selectText: string = '') => {
  const textarea = textareaRef.value
  if (!textarea) return

  const start = textarea.selectionStart
  const end = textarea.selectionEnd
  const selectedText = props.modelValue.substring(start, end) || selectText

  const newValue = props.modelValue.substring(0, start) + 
    before + selectedText + after + 
    props.modelValue.substring(end)

  emit('update:modelValue', newValue)

  setTimeout(() => {
    const newStart = start + before.length
    const newEnd = newStart + selectedText.length
    textarea.focus()
    textarea.setSelectionRange(newStart, newEnd)
  }, 0)
}

const handleBold = () => {
  insertText('**', '**', '加粗文本')
}

const handleItalic = () => {
  insertText('*', '*', '斜体文本')
}

const handleCode = () => {
  insertText('\n```\n', '\n```\n', '// 代码')
}

const handleLink = () => {
  const url = prompt('请输入链接地址：', 'https://')
  if (url) {
    insertText('[', `](${url})`, '链接文本')
  }
}

const handleImageUpload = () => {
  fileInputRef.value?.click()
}

const handleFileChange = async (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  
  if (!file) return

  isUploading.value = true
  
  try {
    const formData = new FormData()
    formData.append('image', file)

    const response = await fetch('/api/upload/image', {
      method: 'POST',
      body: formData
    })

    const result = await response.json()
    
    if (result.success) {
      insertText('![', `](${result.url})`, '图片描述')
    } else {
      alert(result.message || '上传失败')
    }
  } catch (error) {
    console.error('上传失败:', error)
    alert('上传失败，请重试')
  } finally {
    isUploading.value = false
    target.value = ''
  }
}

const handleUnorderedList = () => {
  insertText('- ', '', '列表项')
}

const handleOrderedList = () => {
  const textarea = textareaRef.value
  if (!textarea) return

  const start = textarea.selectionStart
  const content = props.modelValue
  
  const lineStart = content.lastIndexOf('\n', start - 1) + 1
  const lineContent = content.substring(lineStart, start)
  
  const existingMatch = lineContent.match(/^\s*(\d+)\.\s/)
  if (existingMatch) {
    const currentNum = parseInt(existingMatch[1])
    insertText(`${currentNum + 1}. `, '', '列表项')
  } else {
    const beforeStart = content.lastIndexOf('\n', lineStart - 2) + 1
    const prevLine = content.substring(beforeStart, lineStart - 1)
    const prevMatch = prevLine.match(/^\s*(\d+)\.\s/)
    
    if (prevMatch) {
      const prevNum = parseInt(prevMatch[1])
      insertText(`${prevNum + 1}. `, '', '列表项')
    } else {
      insertText('1. ', '', '列表项')
    }
  }
}

watch(() => props.modelValue, (newValue) => {
  emit('update:modelValue', newValue)
})
</script>

<template>
  <div class="border border-gray-300 rounded-lg overflow-hidden">
    <div class="flex items-center gap-1 p-2 bg-gray-50 border-b border-gray-300 flex-wrap">
      <button
        @click="handleBold"
        class="p-2 hover:bg-gray-200 rounded transition-colors"
        title="加粗"
      >
        <Bold class="w-4 h-4 text-gray-600" />
      </button>
      <button
        @click="handleItalic"
        class="p-2 hover:bg-gray-200 rounded transition-colors"
        title="斜体"
      >
        <Italic class="w-4 h-4 text-gray-600" />
      </button>
      <div class="w-px h-6 bg-gray-300 mx-1"></div>
      <button
        @click="handleCode"
        class="p-2 hover:bg-gray-200 rounded transition-colors"
        title="代码块"
      >
        <Code class="w-4 h-4 text-gray-600" />
      </button>
      <button
        @click="handleLink"
        class="p-2 hover:bg-gray-200 rounded transition-colors"
        title="链接"
      >
        <Link class="w-4 h-4 text-gray-600" />
      </button>
      <button
        @click="handleImageUpload"
        :disabled="isUploading"
        class="p-2 hover:bg-gray-200 rounded transition-colors disabled:opacity-50"
        title="上传本地图片"
      >
        <Upload v-if="isUploading" class="w-4 h-4 text-gray-600 animate-spin" />
        <Image v-else class="w-4 h-4 text-gray-600" />
      </button>
      <div class="w-px h-6 bg-gray-300 mx-1"></div>
      <button
        @click="handleUnorderedList"
        class="p-2 hover:bg-gray-200 rounded transition-colors"
        title="无序列表"
      >
        <List class="w-4 h-4 text-gray-600" />
      </button>
      <button
        @click="handleOrderedList"
        class="p-2 hover:bg-gray-200 rounded transition-colors"
        title="有序列表"
      >
        <ListOrdered class="w-4 h-4 text-gray-600" />
      </button>
    </div>
    
    <textarea
      ref="textareaRef"
      :value="modelValue"
      @input="emit('update:modelValue', ($event.target as HTMLTextAreaElement).value)"
      rows="6"
      class="w-full px-3 py-2 border-none focus:ring-0 outline-none resize-none font-mono text-sm"
      placeholder="输入内容，支持 Markdown 格式..."
    ></textarea>
    
    <input
      ref="fileInputRef"
      type="file"
      accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
      class="hidden"
      @change="handleFileChange"
    />
  </div>
</template>
