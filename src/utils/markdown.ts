export function stripMarkdown(text: string): string {
  if (!text) return ''
  
  let result = text
  
  // 移除图片格式 ![alt](url) -> 完全移除，不在目录显示
  result = result.replace(/!\[([^\]]*)\]\([^)]+\)/g, '')
  
  // 移除链接格式 [text](url) -> text
  result = result.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
  
  // 移除粗体和斜体
  result = result.replace(/\*\*([^*]+)\*\*/g, '$1')
  result = result.replace(/\*([^*]+)\*/g, '$1')
  result = result.replace(/__([^_]+)__/g, '$1')
  result = result.replace(/_([^_]+)_/g, '$1')
  
  // 移除代码块
  result = result.replace(/```[\s\S]*?```/g, '')
  result = result.replace(/`([^`]+)`/g, '$1')
  
  // 移除标题标记
  result = result.replace(/^#+\s*/gm, '')
  
  // 移除列表标记
  result = result.replace(/^\s*[-*+]\s*/gm, '')
  result = result.replace(/^\s*\d+\.\s*/gm, '')
  
  // 移除引用标记
  result = result.replace(/^\s*>\s*/gm, '')
  
  // 移除水平线
  result = result.replace(/^[-*=_]{3,}$/gm, '')
  
  // 移除多余的空行和空白
  result = result.replace(/\n{3,}/g, '\n\n')
  result = result.replace(/\s+/g, ' ')
  
  return result.trim()
}

export function truncateText(text: string, maxLength: number = 80): string {
  const cleaned = stripMarkdown(text)
  if (cleaned.length <= maxLength) {
    return cleaned
  }
  return cleaned.substring(0, maxLength) + '...'
}
