<script setup lang="ts">
import { computed } from 'vue'
import { marked } from 'marked'

const props = defineProps<{
  content: string
}>()

marked.setOptions({
  gfm: true,
  breaks: true
})

const renderedContent = computed(() => {
  if (!props.content) return ''
  
  let content = props.content
  
  content = content.replace(/!\[([^\]]*)\]\((\/uploads\/[^)]+)\)/g, (_match, _alt, url) => {
    return `![](${url})`
  })
  
  return marked(content)
})
</script>

<template>
  <div 
    class="prose max-w-none prose-indigo"
    v-html="renderedContent"
  ></div>
</template>

<style scoped>
:deep(h1), :deep(h2), :deep(h3), :deep(h4), :deep(h5), :deep(h6) {
  font-weight: 600;
  margin-top: 1.5em;
  margin-bottom: 0.5em;
  color: #1f2937;
}

:deep(h1) { font-size: 1.875rem; }
:deep(h2) { font-size: 1.5rem; }
:deep(h3) { font-size: 1.25rem; }
:deep(h4) { font-size: 1.125rem; }

:deep(p) {
  margin-bottom: 1em;
  line-height: 1.75;
  color: #4b5563;
}

:deep(a) {
  color: #4f46e5;
  text-decoration: underline;
}

:deep(a:hover) {
  color: #4338ca;
}

:deep(strong) {
  font-weight: 600;
  color: #1f2937;
}

:deep(em) {
  font-style: italic;
}

:deep(code) {
  background-color: #f3f4f6;
  padding: 0.2em 0.4em;
  border-radius: 0.375rem;
  font-size: 0.875em;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
}

:deep(pre) {
  background-color: #1f2937;
  color: #e5e7eb;
  padding: 1em;
  border-radius: 0.5rem;
  overflow-x: auto;
  margin: 1em 0;
}

:deep(pre code) {
  background-color: transparent;
  padding: 0;
  color: inherit;
}

:deep(blockquote) {
  border-left: 4px solid #4f46e5;
  padding-left: 1em;
  margin: 1em 0;
  color: #6b7280;
  font-style: italic;
}

:deep(ul), :deep(ol) {
  margin: 1em 0;
  padding-left: 2em;
}

:deep(li) {
  margin-bottom: 0.5em;
}

:deep(li:last-child) {
  margin-bottom: 0;
}

:deep(img) {
  max-width: 600px;
  width: 100%;
  height: auto;
  border-radius: 0.5rem;
  margin: 1em auto;
  display: block;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

:deep(img[src^="/uploads/"]) {
  display: block;
  max-width: 600px;
  width: 100%;
  height: auto;
  margin: 1em auto;
  border-radius: 0.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

:deep(hr) {
  border: none;
  border-top: 1px solid #e5e7eb;
  margin: 2em 0;
}
</style>
