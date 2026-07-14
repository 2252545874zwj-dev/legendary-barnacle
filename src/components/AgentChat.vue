<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';
<<<<<<< HEAD
import { MessageCircle, X, Send, Bot, User, BarChart3, Search, FileText, Sparkles, ChevronRight, Eye, Calendar, Check, XCircle, AlertCircle } from 'lucide-vue-next';
=======
import { MessageCircle, X, Send, Bot, User, BarChart3, Search, FileText, Sparkles, ChevronRight, Eye, Calendar } from 'lucide-vue-next';
>>>>>>> ac58535bee06e561eeda876df089ccdadedcee65
import { api, type AgentContext } from '../services/api';

interface PostItem {
  id: number;
  title: string;
  category: string;
  viewCount: number;
  createdAt: string;
}

interface ChatMessage {
  type: 'user' | 'agent';
  content: string;
  timestamp: Date;
  postData?: PostItem[];
<<<<<<< HEAD
  messageType?: 'text' | 'posts' | 'confirmation' | 'question' | 'success' | 'error';
  actionData?: {
    actionId: string;
    intentType: string;
    params: Record<string, any>;
  };
=======
>>>>>>> ac58535bee06e561eeda876df089ccdadedcee65
}

const router = useRouter();
const authStore = useAuthStore();

const props = withDefaults(defineProps<{
  context?: AgentContext;
}>(), {
  context: () => ({})
});

const isOpen = ref(false);
const message = ref('');
const messages = ref<ChatMessage[]>([]);
const isLoading = ref(false);
<<<<<<< HEAD
const currentStreamingId = ref<number | null>(null);
=======
>>>>>>> ac58535bee06e561eeda876df089ccdadedcee65

const quickQuestions = [
  { text: '最近一周有多少新帖子？', icon: BarChart3 },
  { text: '各分类帖子数量', icon: BarChart3 },
  { text: '我发布了多少篇帖子？', icon: FileText },
  { text: '帮我搜索技术相关帖子', icon: Search },
<<<<<<< HEAD
  { text: '推荐一些帖子', icon: Sparkles },
  { text: '发布一篇技术帖子', icon: FileText }
=======
  { text: '推荐一些帖子', icon: Sparkles }
>>>>>>> ac58535bee06e561eeda876df089ccdadedcee65
];

const toggleChat = () => {
  isOpen.value = !isOpen.value;
  if (isOpen.value && messages.value.length === 0) {
<<<<<<< HEAD
    addAgentMessage('您好！我是信息论坛的智能助手，请问有什么可以帮助您的？\n\n您可以点击下方快捷问题快速了解论坛数据，也可以直接输入您的问题。\n\n💡 新功能：您可以说"发布一篇关于Vue的帖子"让我帮您发布！');
  }
};

const addAgentMessage = (content: string, postData?: PostItem[], messageType?: ChatMessage['messageType'], actionData?: ChatMessage['actionData']) => {
=======
    addAgentMessage('您好！我是信息论坛的智能助手，请问有什么可以帮助您的？\n\n您可以点击下方快捷问题快速了解论坛数据，也可以直接输入您的问题。');
  }
};

const addAgentMessage = (content: string, postData?: PostItem[]) => {
>>>>>>> ac58535bee06e561eeda876df089ccdadedcee65
  messages.value.push({
    type: 'agent',
    content,
    timestamp: new Date(),
<<<<<<< HEAD
    postData,
    messageType: messageType || 'text',
    actionData
=======
    postData
>>>>>>> ac58535bee06e561eeda876df089ccdadedcee65
  });
  scrollToBottom();
};

const addUserMessage = (content: string) => {
  messages.value.push({
    type: 'user',
    content,
    timestamp: new Date()
  });
  scrollToBottom();
};

const handleSend = async () => {
  if (!message.value.trim() || isLoading.value) return;

  const userId = parseInt(authStore.user?.id || '0');
  if (!userId) {
    addAgentMessage('请先登录后再使用智能助手');
    message.value = '';
    return;
  }

  addUserMessage(message.value);
  const question = message.value;
  message.value = '';
  isLoading.value = true;

<<<<<<< HEAD
  messages.value.push({
    type: 'agent',
    content: '',
    timestamp: new Date(),
    messageType: 'text'
  });
  const agentMessageIndex = messages.value.length - 1;
  scrollToBottom();

  const timeoutTimer = setTimeout(() => {
    if (isLoading.value) {
      isLoading.value = false;
      currentStreamingId.value = null;
      messages.value[agentMessageIndex].content = '请求超时，请重试';
      messages.value[agentMessageIndex].messageType = 'error';
    }
  }, 30000);

  try {
    await api.agentAskStream(
      userId,
      question,
      props.context,
      (chunk: string) => {
        messages.value[agentMessageIndex].content += chunk;
        scrollToBottom();
      },
      (fullAnswer: string) => {
        clearTimeout(timeoutTimer);
        isLoading.value = false;
        currentStreamingId.value = null;
      },
      (error: string) => {
        clearTimeout(timeoutTimer);
        messages.value[agentMessageIndex].content = error;
        messages.value[agentMessageIndex].messageType = 'error';
        isLoading.value = false;
        currentStreamingId.value = null;
      }
    );
  } catch (error) {
    clearTimeout(timeoutTimer);
    console.error('Agent error:', error);
    messages.value[agentMessageIndex].content = '抱歉，服务暂时不可用，请稍后重试';
    messages.value[agentMessageIndex].messageType = 'error';
    isLoading.value = false;
    currentStreamingId.value = null;
  }
};

const handleConfirmAction = async (actionId: string) => {
  const userId = parseInt(authStore.user?.id || '0');
  if (!userId) {
    addAgentMessage('请先登录后再执行操作');
    return;
  }

  isLoading.value = true;

  try {
    const response = await api.agentAsk(userId, '', props.context, actionId, true);
    if (response.success) {
      addUserMessage('确认');
      if (response.type === 'success') {
        addAgentMessage(response.answer, undefined, 'success');
      } else {
        addAgentMessage(response.answer, undefined, response.type);
      }
    } else {
      addAgentMessage('操作失败');
    }
  } catch (error) {
    console.error('Confirm action error:', error);
    addAgentMessage('操作失败，请稍后重试');
=======
  try {
    const response = await api.agentAsk(userId, question, props.context);
    if (response.success) {
      if (response.interactionType === 'posts' && response.data) {
        addAgentMessage(response.answer, response.data);
      } else {
        addAgentMessage(response.answer);
      }
    } else {
      addAgentMessage('抱歉，我暂时无法回答您的问题');
    }
  } catch (error) {
    console.error('Agent error:', error);
    addAgentMessage('抱歉，服务暂时不可用，请稍后重试');
>>>>>>> ac58535bee06e561eeda876df089ccdadedcee65
  } finally {
    isLoading.value = false;
  }
};

<<<<<<< HEAD
const handleCancelAction = () => {
  addUserMessage('取消');
  addAgentMessage('操作已取消');
};

=======
>>>>>>> ac58535bee06e561eeda876df089ccdadedcee65
const handleQuickQuestion = async (question: string) => {
  message.value = question;
  await handleSend();
};

const handleKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    handleSend();
  }
};

const handlePostClick = (postId: number) => {
  router.push(`/info/${postId}`);
  isOpen.value = false;
};

const formatTime = (date: Date) => {
  return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
};

const getCategoryColor = (category: string) => {
  const colors: Record<string, string> = {
    '技术': 'bg-blue-100 text-blue-700',
    '新闻': 'bg-green-100 text-green-700',
    '产品': 'bg-purple-100 text-purple-700',
    '其他': 'bg-gray-100 text-gray-700'
  };
  return colors[category] || 'bg-gray-100 text-gray-700';
};

<<<<<<< HEAD
const getMessageBgClass = (msg: ChatMessage) => {
  if (msg.type === 'user') {
    return 'bg-indigo-600 text-white rounded-br-md';
  }
  
  switch (msg.messageType) {
    case 'success':
      return 'bg-green-50 text-green-800 border-green-200 rounded-bl-md';
    case 'error':
      return 'bg-red-50 text-red-800 border-red-200 rounded-bl-md';
    case 'confirmation':
      return 'bg-amber-50 text-amber-800 border-amber-200 rounded-bl-md';
    case 'question':
      return 'bg-blue-50 text-blue-800 border-blue-200 rounded-bl-md';
    default:
      return 'bg-white text-gray-800 border-gray-200 rounded-bl-md';
  }
};

=======
>>>>>>> ac58535bee06e561eeda876df089ccdadedcee65
const chatContainer = ref<HTMLElement | null>(null);

const scrollToBottom = () => {
  setTimeout(() => {
    if (chatContainer.value) {
      chatContainer.value.scrollTop = chatContainer.value.scrollHeight;
    }
  }, 100);
};

const showChat = computed(() => {
  return authStore.isAuthenticated() && isOpen.value;
});

watch(messages, () => {
  scrollToBottom();
});
</script>

<template>
  <div class="fixed bottom-6 right-6 z-50">
    <button
      v-if="!isOpen"
      @click="toggleChat"
      class="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-4 py-3 rounded-full shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl"
    >
      <MessageCircle class="w-5 h-5" />
      <span class="hidden sm:inline font-medium">智能助手</span>
    </button>

    <div
      v-if="showChat"
      class="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden"
    >
      <div class="flex items-center justify-between bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-3">
        <div class="flex items-center gap-2 text-white">
          <div class="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
            <Bot class="w-5 h-5" />
          </div>
          <span class="font-semibold">智能助手</span>
        </div>
        <button
          @click="toggleChat"
          class="text-white/80 hover:text-white transition-colors p-1 hover:bg-white/10 rounded-full"
        >
          <X class="w-5 h-5" />
        </button>
      </div>

      <div
        ref="chatContainer"
        class="h-80 overflow-y-auto px-4 py-3 space-y-4 bg-gray-50"
      >
        <div
          v-for="(msg, index) in messages"
          :key="index"
          class="flex gap-2"
          :class="msg.type === 'user' ? 'justify-end' : 'justify-start'"
        >
          <div
            :class="[
              'flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center',
              msg.type === 'user' ? 'bg-indigo-600' : 'bg-gray-200'
            ]"
          >
            <User v-if="msg.type === 'user'" class="w-4 h-4 text-white" />
            <Bot v-else class="w-4 h-4 text-gray-600" />
          </div>
          <div
            :class="[
<<<<<<< HEAD
              'max-w-[75%] px-4 py-2.5 rounded-2xl border shadow-sm',
              getMessageBgClass(msg)
            ]"
          >
            <div class="flex items-start gap-2">
              <AlertCircle v-if="msg.messageType === 'confirmation'" class="w-4 h-4 flex-shrink-0 mt-0.5 text-amber-500" />
              <Check v-if="msg.messageType === 'success'" class="w-4 h-4 flex-shrink-0 mt-0.5 text-green-500" />
              <XCircle v-if="msg.messageType === 'error'" class="w-4 h-4 flex-shrink-0 mt-0.5 text-red-500" />
              <p class="text-sm leading-relaxed whitespace-pre-wrap flex-1">{{ msg.content }}</p>
            </div>
            
=======
              'max-w-[75%] px-4 py-2.5 rounded-2xl',
              msg.type === 'user'
                ? 'bg-indigo-600 text-white rounded-br-md'
                : 'bg-white text-gray-800 rounded-bl-md border border-gray-200 shadow-sm'
            ]"
          >
            <p class="text-sm leading-relaxed whitespace-pre-wrap">{{ msg.content }}</p>
            
            <!-- 帖子列表 -->
>>>>>>> ac58535bee06e561eeda876df089ccdadedcee65
            <div v-if="msg.postData && msg.postData.length > 0" class="mt-3 space-y-2">
              <div
                v-for="post in msg.postData"
                :key="post.id"
                @click="handlePostClick(post.id)"
                class="flex items-center gap-3 p-2 bg-gray-50 rounded-lg hover:bg-indigo-50 cursor-pointer transition-colors group"
              >
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-medium text-gray-800 truncate group-hover:text-indigo-600 transition-colors">
                    {{ post.title }}
                  </p>
                  <div class="flex items-center gap-2 mt-1">
                    <span :class="['text-xs px-2 py-0.5 rounded-full', getCategoryColor(post.category)]">
                      {{ post.category }}
                    </span>
                    <span class="flex items-center gap-1 text-xs text-gray-400">
                      <Eye class="w-3 h-3" />
                      {{ post.viewCount }}
                    </span>
                    <span class="flex items-center gap-1 text-xs text-gray-400">
                      <Calendar class="w-3 h-3" />
                      {{ post.createdAt }}
                    </span>
                  </div>
                </div>
                <ChevronRight class="w-4 h-4 text-gray-400 group-hover:text-indigo-600 transition-colors flex-shrink-0" />
              </div>
            </div>

<<<<<<< HEAD
            <div v-if="msg.messageType === 'confirmation' && msg.actionData" class="mt-3 flex gap-2">
              <button
                @click="handleConfirmAction(msg.actionData.actionId)"
                class="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs rounded-lg transition-colors"
              >
                <Check class="w-3.5 h-3.5" />
                确认
              </button>
              <button
                @click="handleCancelAction"
                class="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 text-xs rounded-lg transition-colors"
              >
                <XCircle class="w-3.5 h-3.5" />
                取消
              </button>
            </div>

=======
>>>>>>> ac58535bee06e561eeda876df089ccdadedcee65
            <span
              :class="[
                'text-xs mt-1.5 block',
                msg.type === 'user' ? 'text-white/70' : 'text-gray-400'
              ]"
            >
              {{ formatTime(msg.timestamp) }}
            </span>
          </div>
        </div>

<<<<<<< HEAD
        <div v-if="isLoading && !messages.length" class="flex justify-center py-2">
=======
        <div v-if="isLoading" class="flex justify-center py-2">
>>>>>>> ac58535bee06e561eeda876df089ccdadedcee65
          <div class="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>

      <div v-if="messages.length === 1" class="px-4 py-3 bg-white border-t border-gray-100">
        <p class="text-xs text-gray-500 mb-2">快速提问：</p>
        <div class="flex flex-wrap gap-2">
          <button
            v-for="(q, index) in quickQuestions"
            :key="index"
            @click="handleQuickQuestion(q.text)"
            class="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-indigo-100 text-gray-600 hover:text-indigo-600 text-xs rounded-full transition-colors"
          >
            <component :is="q.icon" class="w-3.5 h-3.5" />
            {{ q.text }}
          </button>
        </div>
      </div>

      <div class="p-3 border-t border-gray-100 bg-white">
        <div class="flex gap-2">
          <input
            v-model="message"
            type="text"
            placeholder="输入您的问题..."
            class="flex-1 px-4 py-2.5 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent shadow-sm"
            @keydown="handleKeydown"
          />
          <button
            @click="handleSend"
            :disabled="isLoading || !message.trim()"
            class="px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 disabled:from-gray-300 disabled:to-gray-300 text-white rounded-full transition-all flex items-center gap-1 shadow-sm"
          >
            <Send class="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  </div>
<<<<<<< HEAD
</template>
=======
</template>
>>>>>>> ac58535bee06e561eeda876df089ccdadedcee65
