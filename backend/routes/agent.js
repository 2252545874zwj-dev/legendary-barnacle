/**
 * 智能助手路由
 * 负责处理用户与智能助手的交互
 */

import express from 'express';
<<<<<<< HEAD
import { pool, executeWithRetry } from '../config/db.js';
=======
import { pool } from '../config/db.js';
>>>>>>> a648754d40cbc3e44cd03f0cf82527487e5b6465
import { doubaoService } from '../services/doubaoService.js';
import { 
  smartIdentifyIntent, 
  isGreeting, 
  isThanks, 
  isHelpRequest,
  hasSummaryIntent,
<<<<<<< HEAD
  hasExplainIntent,
  getIntentByType,
  intentConfig
=======
<<<<<<< HEAD
  hasExplainIntent,
  getIntentByType,
  intentConfig
=======
  hasExplainIntent 
>>>>>>> ac58535bee06e561eeda876df089ccdadedcee65
>>>>>>> a648754d40cbc3e44cd03f0cf82527487e5b6465
} from '../services/intentService.js';
import { 
  searchPosts, 
  getMyPostsList, 
  getMyPostsCount,
  getTotalPosts, 
  getTotalViews, 
  getTotalComments,
  getTotalUsers,
  getCategoryStats,
  getLatestPosts,
<<<<<<< HEAD
  getSystemOverview,
  getPostById,
  getPostsByKeyword
=======
<<<<<<< HEAD
  getSystemOverview,
  getPostById,
  getPostsByKeyword
=======
  getSystemOverview
>>>>>>> ac58535bee06e561eeda876df089ccdadedcee65
>>>>>>> a648754d40cbc3e44cd03f0cf82527487e5b6465
} from '../services/searchService.js';

const router = express.Router();

<<<<<<< HEAD
const conversationHistory = new Map();
const pendingActions = new Map();

const MAX_PENDING_ACTION_AGE = 300000;
const MAX_CONVERSATION_HISTORY_AGE = 3600000;
const MAX_CONVERSATION_HISTORY_SIZE = 50;

function cleanupExpiredData() {
  const now = Date.now();
  
  for (const [actionId, action] of pendingActions.entries()) {
    if (now - action.createdAt > MAX_PENDING_ACTION_AGE) {
      pendingActions.delete(actionId);
      console.log(`[CLEANUP] Removed expired pending action: ${actionId}`);
    }
  }
  
  for (const [sessionId, history] of conversationHistory.entries()) {
    const lastEntry = history[history.length - 1];
    if (lastEntry && now - lastEntry.timestamp > MAX_CONVERSATION_HISTORY_AGE) {
      conversationHistory.delete(sessionId);
      console.log(`[CLEANUP] Removed expired conversation history: ${sessionId}`);
    } else if (history.length > MAX_CONVERSATION_HISTORY_SIZE) {
      history.splice(0, history.length - MAX_CONVERSATION_HISTORY_SIZE);
      console.log(`[CLEANUP] Trimmed conversation history for: ${sessionId}`);
    }
  }
}

setInterval(cleanupExpiredData, 60000);

router.post('/ask', async (req, res) => {
  try {
    const { userId, question, sessionId, stream = false, actionId, confirm = false } = req.body;
=======
<<<<<<< HEAD
const conversationHistory = new Map();
const pendingActions = new Map();

router.post('/ask', async (req, res) => {
  try {
    const { userId, question, sessionId, stream = false, actionId, confirm = false } = req.body;
=======
// 存储对话历史（模拟会话管理）
const conversationHistory = new Map();

router.post('/ask', async (req, res) => {
  try {
    const { userId, question, sessionId, stream = false } = req.body;
>>>>>>> ac58535bee06e561eeda876df089ccdadedcee65
>>>>>>> a648754d40cbc3e44cd03f0cf82527487e5b6465

    console.log('Received question:', question);
    console.log('User ID:', userId);
    console.log('Session ID:', sessionId);
    console.log('Stream mode:', stream);
<<<<<<< HEAD
=======
<<<<<<< HEAD
>>>>>>> a648754d40cbc3e44cd03f0cf82527487e5b6465
    console.log('Action ID:', actionId);
    console.log('Confirm:', confirm);

    if (!question && !actionId) {
      return res.status(400).json({ message: '问题不能为空' });
    }

<<<<<<< HEAD
=======
=======

    if (!question) {
      return res.status(400).json({ message: '问题不能为空' });
    }

    // 获取对话历史
>>>>>>> ac58535bee06e561eeda876df089ccdadedcee65
>>>>>>> a648754d40cbc3e44cd03f0cf82527487e5b6465
    let history = [];
    if (sessionId && conversationHistory.has(sessionId)) {
      history = conversationHistory.get(sessionId);
    }

<<<<<<< HEAD
    if (actionId && confirm) {
      const result = await executePendingAction(actionId, userId);
      if (sessionId) {
        history.push({ question: `确认执行: ${actionId}`, answer: result.answer, timestamp: Date.now() });
=======
<<<<<<< HEAD
    if (actionId && confirm) {
      const result = await executePendingAction(actionId, userId);
      if (sessionId) {
        history.push({ question: `确认执行: ${actionId}`, answer: result.answer });
>>>>>>> a648754d40cbc3e44cd03f0cf82527487e5b6465
        if (history.length > 10) history.shift();
        conversationHistory.set(sessionId, history);
      }
      return res.json({ success: true, ...result });
    }

<<<<<<< HEAD
    const intentResult = await analyzeIntentAndReply(userId, question, history);
    
    if (sessionId) {
      history.push({ question, answer: intentResult.answer, timestamp: Date.now() });
      if (history.length > 10) history.shift();
      conversationHistory.set(sessionId, history);
    }
    await executeWithRetry(
      'INSERT INTO agent_interactions (user_id, question, answer) VALUES (?, ?, ?)',
      [userId || null, question, intentResult.answer]
    );

    if (!stream) {
      return res.json(intentResult);
    }

    if (stream) {
      res.writeHead(200, {
        'Content-Type': 'text/event-stream; charset=utf-8',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*'
      });

      res.socket.setNoDelay(true);
      res.socket.setTimeout(0);
=======
    if (stream) {
=======
    // 检查是否需要流式输出
    if (stream) {
      // 设置SSE响应头
>>>>>>> ac58535bee06e561eeda876df089ccdadedcee65
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');
      res.setHeader('Access-Control-Allow-Origin', '*');
>>>>>>> a648754d40cbc3e44cd03f0cf82527487e5b6465

      let fullAnswer = '';

      try {
<<<<<<< HEAD
        console.log('[STREAM] Starting stream response');
        for await (const char of analyzeIntentAndReplyStream(userId, question, history)) {
          fullAnswer += char;
          const data = `data: ${JSON.stringify({ type: 'stream', content: char })}\n\n`;
          res.write(data);
          await new Promise(resolve => res.socket.write('', resolve));
        }

        console.log('[STREAM] Stream complete, sending end');
        const endData = `data: ${JSON.stringify({ type: 'end', content: fullAnswer })}\n\n`;
        res.write(Buffer.from(endData, 'utf-8'));
        res.end();

        if (sessionId) {
          history.push({ question, answer: fullAnswer, timestamp: Date.now() });
          if (history.length > 10) history.shift();
          conversationHistory.set(sessionId, history);
        }

        await executeWithRetry(
=======
<<<<<<< HEAD
        console.log('[STREAM] Starting stream response');
        for await (const char of analyzeIntentAndReplyStream(userId, question, history)) {
          fullAnswer += char;
          res.write(`data: ${JSON.stringify({ type: 'stream', content: char })}\n\n`);
          if (res.flushHeaders) res.flushHeaders();
        }

        console.log('[STREAM] Stream complete, sending end');
        res.write(`data: ${JSON.stringify({ type: 'end', content: fullAnswer })}\n\n`);
        res.end();

        if (sessionId) {
          history.push({ question, answer: fullAnswer });
          if (history.length > 10) history.shift();
=======
        // 流式回答
        for await (const char of analyzeIntentAndReplyStream(userId, question, history)) {
          fullAnswer += char;
          res.write(`data: ${JSON.stringify({ type: 'stream', content: char })}\n\n`);
        }

        // 发送结束信号
        res.write(`data: ${JSON.stringify({ type: 'end', content: fullAnswer })}\n\n`);
        res.end();

        // 更新对话历史
        if (sessionId) {
          history.push({ question, answer: fullAnswer });
          if (history.length > 10) {
            history.shift();
          }
>>>>>>> ac58535bee06e561eeda876df089ccdadedcee65
          conversationHistory.set(sessionId, history);
        }

        await pool.execute(
>>>>>>> a648754d40cbc3e44cd03f0cf82527487e5b6465
          'INSERT INTO agent_interactions (user_id, question, answer) VALUES (?, ?, ?)',
          [userId || null, question, fullAnswer]
        );
      } catch (error) {
        console.error('Stream error:', error);
        res.write(`data: ${JSON.stringify({ type: 'error', content: '服务器内部错误' })}\n\n`);
        res.end();
      }
    } else {
<<<<<<< HEAD
      const result = await analyzeIntentAndReply(userId, question, history);

      if (sessionId) {
        history.push({ question, answer: result.answer, timestamp: Date.now() });
        if (history.length > 10) history.shift();
        conversationHistory.set(sessionId, history);
      }

      await executeWithRetry(
=======
<<<<<<< HEAD
      const result = await analyzeIntentAndReply(userId, question, history);

      if (sessionId) {
        history.push({ question, answer: result.answer });
        if (history.length > 10) history.shift();
=======
      // 普通模式
      const result = await analyzeIntentAndReply(userId, question, history);

      // 更新对话历史（保留最近10条）
      if (sessionId) {
        history.push({ question, answer: result.answer });
        if (history.length > 10) {
          history.shift();
        }
>>>>>>> ac58535bee06e561eeda876df089ccdadedcee65
        conversationHistory.set(sessionId, history);
      }

      await pool.execute(
>>>>>>> a648754d40cbc3e44cd03f0cf82527487e5b6465
        'INSERT INTO agent_interactions (user_id, question, answer) VALUES (?, ?, ?)',
        [userId || null, question, result.answer]
      );

      res.json({ success: true, ...result });
    }
  } catch (error) {
    console.error('Agent ask error:', error);
    res.status(500).json({ success: false, message: '智能体服务暂时不可用' });
  }
});

<<<<<<< HEAD
async function analyzeIntentAndReply(userId, question, history = []) {
  const lowerQuestion = question.toLowerCase();
  
  const pendingAction = await findPendingActionForUser(userId, question);
  if (pendingAction) {
    return await handlePendingActionResponse(userId, question, pendingAction);
  }
  
  if (isGreeting(question)) {
    return {
      answer: '您好！我是信息论坛的智能助手，请问有什么可以帮助您的？\n\n您可以问我：\n- 搜索技术相关内容（如"云计算"、"Vue"）\n- 查看最新发布的内容\n- 查询论坛统计信息\n- 总结文章内容\n- 发布/删除/修改帖子（如"发布一篇关于Vue的帖子"）',
=======
<<<<<<< HEAD
async function analyzeIntentAndReply(userId, question, history = []) {
=======
// 智能意图分析函数
async function analyzeIntentAndReply(userId, question, history = []) {
  // 0. 总结意图优先检测！如果包含"总结"或"概括"关键词，直接走AI路径
>>>>>>> ac58535bee06e561eeda876df089ccdadedcee65
  if (hasSummaryIntent(question)) {
    return await handleWithDoubaoAI(userId, question, history);
  }

<<<<<<< HEAD
  if (isGreeting(question)) {
    return {
      answer: '您好！我是信息论坛的智能助手，请问有什么可以帮助您的？\n\n您可以问我：\n- 搜索技术相关内容（如"云计算"、"Vue"）\n- 查看最新发布的内容\n- 查询论坛统计信息\n- 总结文章内容\n- 发布/删除/修改帖子（如"发布一篇关于Vue的帖子"）',
=======
  // 1. 问候语检测
  if (isGreeting(question)) {
    return {
      answer: '您好！我是信息论坛的智能助手，请问有什么可以帮助您的？\n\n您可以问我：\n- 搜索技术相关内容（如"云计算"、"Vue"）\n- 查看最新发布的内容\n- 查询论坛统计信息\n- 总结文章内容',
>>>>>>> ac58535bee06e561eeda876df089ccdadedcee65
>>>>>>> a648754d40cbc3e44cd03f0cf82527487e5b6465
      type: 'text',
      data: null
    };
  }

<<<<<<< HEAD
=======
<<<<<<< HEAD
=======
  // 2. 感谢语检测
>>>>>>> ac58535bee06e561eeda876df089ccdadedcee65
>>>>>>> a648754d40cbc3e44cd03f0cf82527487e5b6465
  if (isThanks(question)) {
    return {
      answer: '不客气！有问题随时问我。',
      type: 'text',
      data: null
    };
  }

<<<<<<< HEAD
  if (isHelpRequest(question)) {
    return {
      answer: '我可以帮助您：\n\n📊 查询统计信息：\n- 内容数量、浏览量、用户数\n- 各分类内容统计\n\n🔍 搜索内容：\n- 搜索特定内容\n- 查看最新发布的内容\n- 搜索技术相关文章\n\n👤 个人信息：\n- 查询您发布的内容数量\n- 查看您发布的内容列表\n\n📝 操作功能：\n- 发布帖子（如"发布一篇关于Vue的帖子"）\n- 删除帖子（如"删除ID为1的帖子"）\n- 修改帖子（如"修改帖子标题"）\n\n🤖 AI智能问答：\n- 总结文章内容\n- 分析问题\n- 解答各类问题',
=======
<<<<<<< HEAD
  if (isHelpRequest(question)) {
    return {
      answer: '我可以帮助您：\n\n📊 查询统计信息：\n- 内容数量、浏览量、用户数\n- 各分类内容统计\n\n🔍 搜索内容：\n- 搜索特定内容\n- 查看最新发布的内容\n- 搜索技术相关文章\n\n👤 个人信息：\n- 查询您发布的内容数量\n- 查看您发布的内容列表\n\n📝 操作功能：\n- 发布帖子（如"发布一篇关于Vue的帖子"）\n- 删除帖子（如"删除ID为1的帖子"）\n- 修改帖子（如"修改帖子标题"）\n\n🤖 AI智能问答：\n- 总结文章内容\n- 分析问题\n- 解答各类问题',
=======
  // 3. 帮助请求检测
  if (isHelpRequest(question)) {
    return {
      answer: '我可以帮助您：\n\n📊 查询统计信息：\n- 内容数量、浏览量、用户数\n- 各分类内容统计\n\n🔍 搜索内容：\n- 搜索特定内容\n- 查看最新发布的内容\n- 搜索技术相关文章\n\n👤 个人信息：\n- 查询您发布的内容数量\n- 查看您发布的内容列表\n\n🤖 AI智能问答：\n- 总结文章内容\n- 分析问题\n- 解答各类问题',
>>>>>>> ac58535bee06e561eeda876df089ccdadedcee65
>>>>>>> a648754d40cbc3e44cd03f0cf82527487e5b6465
      type: 'text',
      data: null
    };
  }

<<<<<<< HEAD
  const hasActionKeyword = lowerQuestion.includes('发布') || lowerQuestion.includes('发帖') || 
                           lowerQuestion.includes('删除') || lowerQuestion.includes('修改') ||
                           lowerQuestion.includes('编辑') || lowerQuestion.includes('创建');
  
  const hasSummaryKeyword = hasSummaryIntent(question) || hasExplainIntent(question);
  
  if (hasActionKeyword && hasSummaryKeyword) {
    console.log(`[DEBUG] 检测到操作意图与总结意图冲突，优先处理操作意图`);
  }

  const intent = smartIdentifyIntent(question, userId);
  
  console.log(`[DEBUG] 识别到的意图: ${intent.type}`);
  console.log(`[DEBUG] 意图置信度: ${intent.confidence}%`);
  console.log(`[DEBUG] 意图关键词: ${JSON.stringify(intent.keywords)}`);
  
  if (intent.confidence > 0 && intent.confidence < 40) {
    console.log(`[DEBUG] 意图置信度较低(${intent.confidence}%)，准备询问用户确认`);
    
    const actionIntents = ['create_post', 'delete_post', 'update_post'];
    if (actionIntents.includes(intent.type)) {
      return {
        answer: `我不太确定您的意图，您是想${getIntentByType(intent.type)?.description || '执行操作'}吗？\n\n请确认或重新描述您的需求。`,
        type: 'question',
        data: {
          intentType: intent.type,
          confidence: intent.confidence
        }
      };
    }
  }
  
=======
<<<<<<< HEAD
=======
  // 4. 智能意图识别
>>>>>>> ac58535bee06e561eeda876df089ccdadedcee65
  const intent = smartIdentifyIntent(question, userId);
  
  console.log(`[DEBUG] 识别到的意图: ${intent.type}`);
  console.log(`[DEBUG] 意图关键词: ${JSON.stringify(intent.keywords)}`);
  
<<<<<<< HEAD
>>>>>>> a648754d40cbc3e44cd03f0cf82527487e5b6465
  const intentConfigItem = getIntentByType(intent.type);
  
  if (intentConfigItem && intentConfigItem.action) {
    return await handleActionIntent(userId, question, intentConfigItem);
  }
  
  const databaseIntents = ['my_posts_count', 'my_posts_list', 'total_posts', 'total_views', 'total_comments', 'total_users', 'category_stats', 'latest_posts', 'search_posts'];
  
<<<<<<< HEAD
=======
=======
  // 对于需要查询数据库的精确意图，使用本地处理（保证数据准确性）
  const databaseIntents = ['my_posts_count', 'my_posts_list', 'total_posts', 'total_views', 'total_comments', 'total_users', 'category_stats', 'latest_posts', 'search_posts'];
  
  console.log(`[DEBUG] 是否在数据库意图列表中: ${databaseIntents.includes(intent.type)}`);
  
  // 如果是search_posts意图，确保走搜索路径
>>>>>>> ac58535bee06e561eeda876df089ccdadedcee65
>>>>>>> a648754d40cbc3e44cd03f0cf82527487e5b6465
  if (intent.type === 'search_posts' && intent.keywords.length > 0) {
    return await searchPosts(question, intent.keywords);
  }
  
  if (databaseIntents.includes(intent.type)) {
    switch (intent.type) {
      case 'my_posts_count':
        return await getMyPostsCount(userId);
      
      case 'my_posts_list':
        return await getMyPostsList(userId);
      
      case 'total_posts':
        return await getTotalPosts();
      
      case 'total_views':
        return await getTotalViews();
      
      case 'total_comments':
        return await getTotalComments();
      
      case 'total_users':
        return await getTotalUsers();
      
      case 'category_stats':
        return await getCategoryStats();
      
      case 'latest_posts':
        const posts = await getLatestPosts(10);
        return {
          answer: '为您找到最新发布的帖子：',
          type: 'posts',
          data: posts
        };
      
      case 'search_posts':
        return await searchPosts(question, intent.keywords);
    }
  }
  
<<<<<<< HEAD
=======
<<<<<<< HEAD
>>>>>>> a648754d40cbc3e44cd03f0cf82527487e5b6465
  return await handleWithDoubaoAI(userId, question, history);
}

async function handleActionIntent(userId, question, intentConfig) {
  console.log(`[DEBUG] 处理Action意图: ${intentConfig.type}`);
  
  const extractedParams = await extractParamsFromQuestion(userId, question, intentConfig);
  
  console.log(`[DEBUG] 提取的参数: ${JSON.stringify(extractedParams)}`);
  
  const missingParams = intentConfig.requiredParams.filter(p => !extractedParams[p]);
  
  if (missingParams.length > 0) {
    const defaultValues = intentConfig.defaultValues || {};
    const stillMissing = missingParams.filter(p => !defaultValues[p]);
    
    if (stillMissing.length > 0) {
<<<<<<< HEAD
      const actionId = `action_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      pendingActions.set(actionId, {
        userId,
        intentType: intentConfig.type,
        params: extractedParams,
        createdAt: Date.now(),
        status: 'pending_params',
        missingParams: stillMissing
      });
      
      setTimeout(() => {
        pendingActions.delete(actionId);
      }, 300000);
      
=======
>>>>>>> a648754d40cbc3e44cd03f0cf82527487e5b6465
      return {
        answer: `我需要更多信息才能帮您${intentConfig.description}。\n\n请提供以下信息：\n${stillMissing.map(p => `- ${getParamDisplayName(p)}`).join('\n')}`,
        type: 'question',
        data: {
          intentType: intentConfig.type,
          currentParams: extractedParams,
<<<<<<< HEAD
          missingParams: stillMissing,
          actionId
=======
          missingParams: stillMissing
>>>>>>> a648754d40cbc3e44cd03f0cf82527487e5b6465
        }
      };
    }
  }
  
  const params = { ...(intentConfig.defaultValues || {}), ...extractedParams };
  
  if (intentConfig.requiresConfirmation) {
    const actionId = `action_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    pendingActions.set(actionId, {
      userId,
      intentType: intentConfig.type,
      params,
<<<<<<< HEAD
      createdAt: Date.now(),
      status: 'pending_confirmation'
=======
      createdAt: Date.now()
>>>>>>> a648754d40cbc3e44cd03f0cf82527487e5b6465
    });
    
    setTimeout(() => {
      pendingActions.delete(actionId);
    }, 300000);
    
    return {
      answer: `确定要${intentConfig.description}吗？\n\n参数信息：\n${Object.entries(params).map(([key, value]) => `- ${getParamDisplayName(key)}: ${value}`).join('\n')}\n\n请回复"确认"或点击下方确认按钮。`,
      type: 'confirmation',
      data: {
        actionId,
        intentType: intentConfig.type,
        params
      }
    };
  }
  
  return await executeAction(intentConfig.type, userId, params);
}

<<<<<<< HEAD
const MAX_TITLE_LENGTH = 255;
const MAX_CONTENT_LENGTH = 10000;

function validateInput(input, type) {
  if (!input || typeof input !== 'string') {
    return { valid: false, message: '输入不能为空' };
  }
  
  const trimmed = input.trim();
  
  if (trimmed.length === 0) {
    return { valid: false, message: '输入不能为空' };
  }
  
  if (type === 'title') {
    if (trimmed.length > MAX_TITLE_LENGTH) {
      return { valid: false, message: `标题长度不能超过${MAX_TITLE_LENGTH}个字符` };
    }
  }
  
  if (type === 'content') {
    if (trimmed.length > MAX_CONTENT_LENGTH) {
      return { valid: false, message: `内容长度不能超过${MAX_CONTENT_LENGTH}个字符` };
    }
  }
  
  const sqlInjectionPatterns = [
    /('|"|`)/g,
    /(--|\/\*|\*\/)/g,
    /(SELECT|INSERT|UPDATE|DELETE|DROP|UNION)/gi,
    /(OR|AND)\s+1\s*=\s*1/gi,
    /;.*(--|\/*)/g
  ];
  
  for (const pattern of sqlInjectionPatterns) {
    if (pattern.test(input)) {
      return { valid: false, message: '输入包含非法字符' };
    }
  }
  
  const maliciousScripts = [
    /<script[^>]*>[\s\S]*?<\/script>/gi,
    /javascript:/gi,
    /onload\s*=/gi,
    /onclick\s*=/gi
  ];
  
  for (const pattern of maliciousScripts) {
    if (pattern.test(input)) {
      return { valid: false, message: '输入包含危险内容' };
    }
  }
  
  return { valid: true, message: '' };
}

function sanitizeInput(input) {
  if (!input) return input;
  
  let sanitized = input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
  
  return sanitized;
}

async function findPendingActionForUser(userId, question) {
  for (const [actionId, action] of pendingActions.entries()) {
    if (action.userId === userId && action.status === 'pending_params') {
      return { actionId, ...action };
    }
  }
  return null;
}

async function handlePendingActionResponse(userId, question, pendingAction) {
  const { actionId, intentType, params: currentParams, missingParams } = pendingAction;
  
  const intentConfig = getIntentByType(intentType);
  if (!intentConfig) {
    pendingActions.delete(actionId);
    return {
      answer: '抱歉，操作已失效，请重新发起请求。',
      type: 'error',
      data: null
    };
  }
  
  const newParams = await extractParamsFromQuestion(userId, question, intentConfig);
  
  const allParams = { ...currentParams, ...newParams };
  
  const stillMissing = missingParams.filter(p => !allParams[p]);
  
  if (stillMissing.length > 0) {
    pendingActions.set(actionId, {
      ...pendingAction,
      params: allParams,
      missingParams: stillMissing
    });
    
    return {
      answer: `我还需要以下信息：\n${stillMissing.map(p => `- ${getParamDisplayName(p)}`).join('\n')}`,
      type: 'question',
      data: {
        intentType,
        currentParams: allParams,
        missingParams: stillMissing,
        actionId
      }
    };
  }
  
  pendingActions.delete(actionId);
  
  const finalParams = { ...(intentConfig.defaultValues || {}), ...allParams };
  
  if (intentConfig.requiresConfirmation) {
    const newActionId = `action_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    pendingActions.set(newActionId, {
      userId,
      intentType: intentConfig.type,
      params: finalParams,
      createdAt: Date.now(),
      status: 'pending_confirmation'
    });
    
    setTimeout(() => {
      pendingActions.delete(newActionId);
    }, 300000);
    
    return {
      answer: `确定要${intentConfig.description}吗？\n\n参数信息：\n${Object.entries(finalParams).map(([key, value]) => `- ${getParamDisplayName(key)}: ${value}`).join('\n')}\n\n请回复"确认"或点击下方确认按钮。`,
      type: 'confirmation',
      data: {
        actionId: newActionId,
        intentType: intentConfig.type,
        params: finalParams
      }
    };
  }
  
  return await executeAction(intentConfig.type, userId, finalParams);
}

async function extractParamsFromQuestion(userId, question, intentConfig) {
  const params = {};
  const lowerQuestion = question.toLowerCase();
  
  if (intentConfig.type === 'create_post') {
    const categoryMap = { '技术': 'technology', '新闻': 'news', '产品': 'product', '其他': 'other' };
    
    const categoryPatterns = [
      /分类[:：](技术|新闻|产品|其他)/,
      /类型[:：](技术|新闻|产品|其他)/,
      /(技术|新闻|产品|其他)(类|分类|类型)/,
      /(技术|新闻|产品|其他)/
    ];
    
    for (const pattern of categoryPatterns) {
      const match = question.match(pattern);
      if (match && categoryMap[match[1]]) {
        params.category = categoryMap[match[1]];
        break;
      }
    }
    
    const titlePatterns = [
      /标题[:：](.+?)(，|。|内容|分类|$)/,
      /题目[:：](.+?)(，|。|内容|分类|$)/,
      /标题是(.+?)(，|。|内容|分类|$)/,
      /题目是(.+?)(，|。|内容|分类|$)/,
      /关于(.+?)(的帖子|的文章|，|。|$)/,
      /写(.+?)(的帖子|的文章|，|。|$)/
    ];
    
    for (const pattern of titlePatterns) {
      const match = question.match(pattern);
      if (match) {
        const title = match[1].trim();
        if (title && title.length > 0 && title.length < 100) {
          params.title = title;
          break;
        }
      }
    }
    
    const contentPatterns = [
      /内容[:：](.+?)(，|。|分类|$)/,
      /内容是(.+?)(，|。|分类|$)/,
      /内容为(.+?)(，|。|分类|$)/,
      /正文[:：](.+?)(，|。|分类|$)/,
      /写(.+?)(，|。|$)/
    ];
    
    for (const pattern of contentPatterns) {
      const match = question.match(pattern);
      if (match) {
        let content = match[1].trim();
        if (content && content.length > 0) {
          if (pattern === /写(.+?)(，|。|$)/ && params.title) {
            continue;
          }
          params.content = content;
          break;
        }
      }
    }
    
    if (!params.content) {
      const contentMatch = question.match(/(内容是|内容为|正文是)(.+)$/);
      if (contentMatch) {
        params.content = contentMatch[2].trim();
      }
=======
async function extractParamsFromQuestion(userId, question, intentConfig) {
  const params = {};
  
  if (intentConfig.type === 'create_post') {
    const categoryMatch = question.match(/(技术|新闻|产品|其他)/);
    if (categoryMatch) {
      const categoryMap = { '技术': 'technology', '新闻': 'news', '产品': 'product', '其他': 'other' };
      params.category = categoryMap[categoryMatch[1]] || 'technology';
    }
    
    const titleMatch = question.match(/(关于|标题是|题目是)(.+?)(的帖子|的文章|，|。)/);
    if (titleMatch) {
      params.title = titleMatch[2].trim();
    }
    
    const contentMatch = question.match(/(内容是|内容为|写)(.+)$/);
    if (contentMatch) {
      params.content = contentMatch[2].trim();
>>>>>>> a648754d40cbc3e44cd03f0cf82527487e5b6465
    }
    
    if (!params.title) {
      const keywords = intentConfig.commonKeywords || [];
      const foundKeyword = keywords.find(k => question.includes(k));
      if (foundKeyword) {
        params.title = `关于${foundKeyword}的帖子`;
      }
    }
  } else if (intentConfig.type === 'delete_post') {
<<<<<<< HEAD
    const idPatterns = [
      /(ID|编号)[:：]?(\d+)/,
      /(ID|编号)为(\d+)/,
      /帖子(\d+)/,
      /删除(\d+)/
    ];
    
    for (const pattern of idPatterns) {
      const match = question.match(pattern);
      if (match) {
        params.postId = parseInt(match[match.length - 1]);
        if (!isNaN(params.postId)) {
          break;
        }
      }
    }
  } else if (intentConfig.type === 'update_post') {
    const idPatterns = [
      /(ID|编号)[:：]?(\d+)/,
      /(ID|编号)为(\d+)/,
      /帖子(\d+)/
    ];
    
    for (const pattern of idPatterns) {
      const match = question.match(pattern);
      if (match) {
        params.postId = parseInt(match[match.length - 1]);
        if (!isNaN(params.postId)) {
          break;
        }
      }
    }
    
    const titlePatterns = [
      /标题[:：](.+?)(，|。|内容|分类|$)/,
      /标题改为(.+?)(，|。|内容|分类|$)/,
      /新标题[:：](.+?)(，|。|内容|分类|$)/
    ];
    
    for (const pattern of titlePatterns) {
      const match = question.match(pattern);
      if (match) {
        params.title = match[1].trim();
        break;
      }
    }
    
    const contentPatterns = [
      /内容[:：](.+?)(，|。|分类|$)/,
      /内容改为(.+?)(，|。|分类|$)/,
      /新内容[:：](.+?)(，|。|分类|$)/
    ];
    
    for (const pattern of contentPatterns) {
      const match = question.match(pattern);
      if (match) {
        params.content = match[1].trim();
        break;
      }
    }
    
    const categoryMap = { '技术': 'technology', '新闻': 'news', '产品': 'product', '其他': 'other' };
    const categoryPatterns = [
      /分类[:：](技术|新闻|产品|其他)/,
      /分类改为(.+?)(，|。|$)/,
      /新分类[:：](技术|新闻|产品|其他)/
    ];
    
    for (const pattern of categoryPatterns) {
      const match = question.match(pattern);
      if (match && categoryMap[match[1]]) {
        params.category = categoryMap[match[1]];
        break;
      }
=======
    const idMatch = question.match(/(ID为|编号为|帖子)(\d+)/);
    if (idMatch) {
      params.postId = parseInt(idMatch[2]);
    }
  } else if (intentConfig.type === 'update_post') {
    const idMatch = question.match(/(ID为|编号为|帖子)(\d+)/);
    if (idMatch) {
      params.postId = parseInt(idMatch[2]);
    }
    
    const titleMatch = question.match(/(标题改为|标题是)(.+?)(，|。)/);
    if (titleMatch) {
      params.title = titleMatch[2].trim();
    }
    
    const contentMatch = question.match(/(内容改为|内容是)(.+)$/);
    if (contentMatch) {
      params.content = contentMatch[2].trim();
    }
    
    const categoryMatch = question.match(/(分类改为|分类是)(技术|新闻|产品|其他)/);
    if (categoryMatch) {
      const categoryMap = { '技术': 'technology', '新闻': 'news', '产品': 'product', '其他': 'other' };
      params.category = categoryMap[categoryMatch[2]] || 'technology';
>>>>>>> a648754d40cbc3e44cd03f0cf82527487e5b6465
    }
  }
  
  return params;
}

function getParamDisplayName(paramName) {
  const displayNames = {
    title: '帖子标题',
    content: '帖子内容',
    category: '分类',
    postId: '帖子ID',
    keyword: '搜索关键词'
  };
  return displayNames[paramName] || paramName;
}

async function executeAction(intentType, userId, params) {
  try {
    switch (intentType) {
      case 'create_post':
        return await executeCreatePost(userId, params);
      case 'delete_post':
        return await executeDeletePost(userId, params);
      case 'update_post':
        return await executeUpdatePost(userId, params);
      default:
        return {
          answer: '暂不支持该操作',
          type: 'text',
          data: null
        };
    }
  } catch (error) {
    console.error('Action execution error:', error);
    return {
      answer: `操作失败：${error.message}`,
      type: 'error',
      data: null
    };
  }
}

async function executeCreatePost(userId, params) {
  const { title, content, category = 'technology' } = params;
  
  if (!title || !content) {
    return {
      answer: '发布帖子需要标题和内容',
      type: 'error',
      data: null
    };
  }
  
<<<<<<< HEAD
  const titleValidation = validateInput(title, 'title');
  if (!titleValidation.valid) {
    return {
      answer: `标题${titleValidation.message}`,
      type: 'error',
      data: null
    };
  }
  
  const contentValidation = validateInput(content, 'content');
  if (!contentValidation.valid) {
    return {
      answer: `内容${contentValidation.message}`,
      type: 'error',
      data: null
    };
  }
  
  const sanitizedTitle = sanitizeInput(title);
  const sanitizedContent = sanitizeInput(content);
  
  const [result] = await executeWithRetry(
    'INSERT INTO info_items (title, content, category, user_id, is_private, view_count) VALUES (?, ?, ?, ?, ?, ?)',
    [sanitizedTitle, sanitizedContent, category, userId, 0, 0]
=======
  const [result] = await pool.execute(
    'INSERT INTO info_items (title, content, category, user_id, is_private, view_count) VALUES (?, ?, ?, ?, ?, ?)',
    [title, content, category, userId, 0, 0]
>>>>>>> a648754d40cbc3e44cd03f0cf82527487e5b6465
  );
  
  const insertId = result.insertId;
  
  const io = (await import('../server.js')).io;
  if (io) {
    io.emit('infoCreated', { id: insertId, title, category, userId });
  }
  
  return {
<<<<<<< HEAD
    answer: `✅ 帖子发布成功！标题：${title} 分类：${getCategoryDisplayName(category)} ID：${insertId}`,
=======
    answer: `✅ 帖子发布成功！\n\n标题：${title}\n分类：${getCategoryDisplayName(category)}\nID：${insertId}`,
>>>>>>> a648754d40cbc3e44cd03f0cf82527487e5b6465
    type: 'success',
    data: { postId: insertId, title, category }
  };
}

async function executeDeletePost(userId, params) {
  const { postId } = params;
  
  if (!postId) {
    return {
      answer: '删除帖子需要帖子ID',
      type: 'error',
      data: null
    };
  }
  
<<<<<<< HEAD
  const [posts] = await executeWithRetry(
=======
  const [posts] = await pool.execute(
>>>>>>> a648754d40cbc3e44cd03f0cf82527487e5b6465
    'SELECT * FROM info_items WHERE id = ? AND user_id = ?',
    [postId, userId]
  );
  
  if (posts.length === 0) {
    return {
      answer: '您只能删除自己发布的帖子',
      type: 'error',
      data: null
    };
  }
  
<<<<<<< HEAD
  await executeWithRetry('DELETE FROM comments WHERE info_id = ?', [postId]);
  await executeWithRetry('DELETE FROM info_items WHERE id = ?', [postId]);
=======
  await pool.execute('DELETE FROM comments WHERE info_id = ?', [postId]);
  await pool.execute('DELETE FROM info_items WHERE id = ?', [postId]);
>>>>>>> a648754d40cbc3e44cd03f0cf82527487e5b6465
  
  const io = (await import('../server.js')).io;
  if (io) {
    io.emit('infoDeleted', { id: postId });
  }
  
  return {
    answer: `✅ 帖子删除成功！\n\n帖子ID：${postId}`,
    type: 'success',
    data: { postId }
  };
}

async function executeUpdatePost(userId, params) {
  const { postId, title, content, category } = params;
  
  if (!postId) {
    return {
      answer: '修改帖子需要帖子ID',
      type: 'error',
      data: null
    };
  }
  
<<<<<<< HEAD
  const [posts] = await executeWithRetry(
=======
  const [posts] = await pool.execute(
>>>>>>> a648754d40cbc3e44cd03f0cf82527487e5b6465
    'SELECT * FROM info_items WHERE id = ? AND user_id = ?',
    [postId, userId]
  );
  
  if (posts.length === 0) {
    return {
      answer: '您只能修改自己发布的帖子',
      type: 'error',
      data: null
    };
  }
  
  const updateFields = [];
  const updateValues = [];
  
  if (title) {
<<<<<<< HEAD
    const titleValidation = validateInput(title, 'title');
    if (!titleValidation.valid) {
      return {
        answer: `标题${titleValidation.message}`,
        type: 'error',
        data: null
      };
    }
    updateFields.push('title = ?');
    updateValues.push(sanitizeInput(title));
  }
  if (content) {
    const contentValidation = validateInput(content, 'content');
    if (!contentValidation.valid) {
      return {
        answer: `内容${contentValidation.message}`,
        type: 'error',
        data: null
      };
    }
    updateFields.push('content = ?');
    updateValues.push(sanitizeInput(content));
=======
    updateFields.push('title = ?');
    updateValues.push(title);
  }
  if (content) {
    updateFields.push('content = ?');
    updateValues.push(content);
>>>>>>> a648754d40cbc3e44cd03f0cf82527487e5b6465
  }
  if (category) {
    updateFields.push('category = ?');
    updateValues.push(category);
  }
  
  if (updateFields.length === 0) {
    return {
      answer: '请提供要修改的内容（标题、内容或分类）',
      type: 'error',
      data: null
    };
  }
  
  updateValues.push(postId);
  
<<<<<<< HEAD
  await executeWithRetry(
=======
  await pool.execute(
>>>>>>> a648754d40cbc3e44cd03f0cf82527487e5b6465
    `UPDATE info_items SET ${updateFields.join(', ')} WHERE id = ?`,
    updateValues
  );
  
  const io = (await import('../server.js')).io;
  if (io) {
    io.emit('infoUpdated', { id: postId });
  }
  
  return {
    answer: `✅ 帖子修改成功！\n\n帖子ID：${postId}`,
    type: 'success',
    data: { postId }
  };
}

async function executePendingAction(actionId, userId) {
  const pending = pendingActions.get(actionId);
  
  if (!pending) {
    return {
      answer: '操作已过期，请重新发起',
      type: 'error',
      data: null
    };
  }
  
  if (pending.userId !== userId) {
    return {
      answer: '无权执行此操作',
      type: 'error',
      data: null
    };
  }
  
  pendingActions.delete(actionId);
  
  return await executeAction(pending.intentType, userId, pending.params);
}

function getCategoryDisplayName(category) {
  const displayNames = {
    technology: '技术',
    news: '新闻',
    product: '产品',
    other: '其他'
  };
  return displayNames[category] || category;
}

async function* analyzeIntentAndReplyStream(userId, question, history = []) {
  try {
<<<<<<< HEAD
    const result = await analyzeIntentAndReply(userId, question, history);
    
    let answer = result.answer || '抱歉，我暂时无法回答您的问题。';
    
    console.log(`[DEBUG] Generated answer: "${answer}"`);
    console.log(`[DEBUG] Answer length: ${answer.length}`);
    
    answer = answer.replace(/\n\n/g, '\n').replace(/\n/g, ' ');
    
=======
=======
  // 所有其他问题（包括详细解释请求）都使用豆包 AI 进行智能回答
  return await handleWithDoubaoAI(userId, question, history);
}

// 流式版本的意图分析和回答
async function* analyzeIntentAndReplyStream(userId, question, history = []) {
  try {
    // 先获取完整回答
>>>>>>> ac58535bee06e561eeda876df089ccdadedcee65
    const result = await analyzeIntentAndReply(userId, question, history);
    
    const answer = result.answer || '抱歉，我暂时无法回答您的问题。';
    
<<<<<<< HEAD
>>>>>>> a648754d40cbc3e44cd03f0cf82527487e5b6465
    for (let i = 0; i < answer.length; i++) {
      yield answer[i];
      const char = answer[i];
      if (/[\u4e00-\u9fa5]/.test(char)) {
        await new Promise(resolve => setTimeout(resolve, 30));
      } else if (/[a-zA-Z]/.test(char)) {
        await new Promise(resolve => setTimeout(resolve, 20));
      } else if (/[0-9]/.test(char)) {
        await new Promise(resolve => setTimeout(resolve, 15));
      } else {
        await new Promise(resolve => setTimeout(resolve, 40));
<<<<<<< HEAD
=======
=======
    // 逐字输出
    for (let i = 0; i < answer.length; i++) {
      yield answer[i];
      // 根据字符类型调整延迟
      const char = answer[i];
      if (/[\u4e00-\u9fa5]/.test(char)) {
        await new Promise(resolve => setTimeout(resolve, 30)); // 中文字符
      } else if (/[a-zA-Z]/.test(char)) {
        await new Promise(resolve => setTimeout(resolve, 20)); // 英文字母
      } else if (/[0-9]/.test(char)) {
        await new Promise(resolve => setTimeout(resolve, 15)); // 数字
      } else {
        await new Promise(resolve => setTimeout(resolve, 40)); // 标点符号
>>>>>>> ac58535bee06e561eeda876df089ccdadedcee65
>>>>>>> a648754d40cbc3e44cd03f0cf82527487e5b6465
      }
    }
  } catch (error) {
    console.error('Stream intent analysis error:', error);
    yield '抱歉，处理过程中出现错误。';
  }
}

<<<<<<< HEAD
async function handleWithDoubaoAI(userId, question, history = []) {
  try {
=======
<<<<<<< HEAD
async function handleWithDoubaoAI(userId, question, history = []) {
  try {
=======
// 使用豆包 AI 处理问题
async function handleWithDoubaoAI(userId, question, history = []) {
  try {
    // 检查是否是需要登录的请求（如"我的帖子"）
>>>>>>> ac58535bee06e561eeda876df089ccdadedcee65
>>>>>>> a648754d40cbc3e44cd03f0cf82527487e5b6465
    const myPostsPatterns = [
      /我.*(发布|发).*帖子/,
      /(我的|我).*帖子.*(有|数量|多少|列表|哪些)/,
      /^我.*帖子$/,
      /我.*帖子.*有.*哪些/,
      /我.*帖子.*多少/,
      /我发布的帖子/,
      /我发的帖子/
    ];
    const isMyPostsRequest = myPostsPatterns.some(pattern => pattern.test(question));
    if (isMyPostsRequest && !userId) {
      return {
        answer: '请先登录后再查询个人帖子',
        type: 'text',
        data: null
      };
    }
    
<<<<<<< HEAD
    const overview = await getSystemOverview(userId);
    
=======
<<<<<<< HEAD
    const overview = await getSystemOverview(userId);
    
=======
    // 获取系统概览信息作为上下文
    const overview = await getSystemOverview(userId);
    
    // 构建上下文信息
>>>>>>> ac58535bee06e561eeda876df089ccdadedcee65
>>>>>>> a648754d40cbc3e44cd03f0cf82527487e5b6465
    let context = `论坛基本信息：\n`;
    context += `- 总帖子数：${overview.totalPosts}篇\n`;
    context += `- 总浏览量：${overview.totalViews}次\n`;
    context += `- 总用户数：${overview.totalUsers}人\n`;
    context += `- 分类统计：${overview.categories.map(c => `${c.name}: ${c.count}篇`).join('，')}\n`;
    if (userId) {
      context += `当前用户发布了 ${overview.userPosts} 篇帖子。\n`;
    }
    
    context += `\n最近发布的帖子列表：\n`;
    overview.recentPosts.slice(0, 10).forEach((p, index) => {
      context += `${index + 1}.【${p.category}】${p.title} - 浏览量: ${p.viewCount}\n`;
    });
    
<<<<<<< HEAD
=======
<<<<<<< HEAD
>>>>>>> a648754d40cbc3e44cd03f0cf82527487e5b6465
    const summaryPattern = /(总结|概括|概要|摘要|详细描述|描述一下|具体内容|内容是什么|讲一下|介绍一下|内容是|具体说明|说明一下)/;
    const idPattern = /帖子(\d+)|ID(\d+)|编号(\d+)/;
    const hasSummaryIntent = summaryPattern.test(question);
    
    if (hasSummaryIntent) {
      const idMatch = question.match(idPattern);
      if (idMatch) {
        const postId = parseInt(idMatch[1] || idMatch[2] || idMatch[3]);
        const post = await getPostById(postId);
        if (post) {
          context += `\n【需要分析的帖子内容】\n`;
          context += `帖子ID：${post.id}\n`;
          context += `标题：${post.title}\n`;
          context += `分类：${post.category}\n`;
          context += `内容：${post.content}\n`;
          context += `\n请根据用户问题，对以上帖子内容进行分析和回答。`;
        } else {
          return {
            answer: `没有找到ID为 ${postId} 的帖子，请检查帖子ID是否正确。`,
            type: 'text',
            data: null
          };
        }
      } else {
        const cleanQuestion = question.replace(/["'“”‘’]/g, '');
        console.log('[DEBUG] Clean question:', cleanQuestion);
        
        const allPosts = await getPostsByKeyword('', 10);
        console.log('[DEBUG] All posts:', allPosts.map(p => p.title));
        
        let matchedPost = null;
        for (const post of allPosts) {
          if (cleanQuestion.includes(post.title)) {
            matchedPost = post;
            break;
          }
        }
        
        if (!matchedPost && allPosts.length > 0) {
          matchedPost = allPosts[0];
        }
        
        if (matchedPost) {
          console.log('[DEBUG] Matched post:', matchedPost.title);
          context += `\n【需要分析的帖子内容】\n`;
          context += `帖子ID：${matchedPost.id}\n`;
          context += `标题：${matchedPost.title}\n`;
          context += `分类：${matchedPost.category}\n`;
          context += `内容：${matchedPost.content}\n`;
          context += `\n请根据用户问题，对以上帖子内容进行分析和回答。`;
        } else {
          const latestPosts = await getPostsByKeyword('', 3);
          if (latestPosts.length > 0) {
            context += `\n【最近帖子内容】\n`;
            latestPosts.forEach((p, index) => {
              context += `\n帖子${index + 1}：\n`;
              context += `标题：${p.title}\n`;
              context += `分类：${p.category}\n`;
              context += `内容：${p.content}\n`;
            });
            context += `\n请根据用户问题，对以上帖子内容进行分析和回答。`;
          }
        }
      }
    }
    
    const relatedPosts = await searchPosts(question, []);
    if (relatedPosts.data && relatedPosts.data.length > 0 && !hasSummaryIntent) {
<<<<<<< HEAD
=======
=======
    // 如果有相关帖子内容，添加到上下文
    const relatedPosts = await searchPosts(question, []);
    if (relatedPosts.data && relatedPosts.data.length > 0) {
>>>>>>> ac58535bee06e561eeda876df089ccdadedcee65
>>>>>>> a648754d40cbc3e44cd03f0cf82527487e5b6465
      context += `\n相关帖子内容：\n`;
      relatedPosts.data.slice(0, 2).forEach((p, index) => {
        context += `帖子${index + 1}：${p.title}\n`;
      });
    }
    
<<<<<<< HEAD
    let result;
    try {
      result = await doubaoService.ask(question, context);
    } catch (error) {
      console.error('Doubao AI error, falling back to local processing:', error);
      return handleLocalFallback(userId, question, context);
    }
    
    if (!result || !result.answer || result.answer === '没有返回内容') {
      console.warn('AI returned empty result, falling back to local processing');
      return handleLocalFallback(userId, question, context);
    }
=======
<<<<<<< HEAD
=======
    // 调用豆包AI获取回答
>>>>>>> ac58535bee06e561eeda876df089ccdadedcee65
    const result = await doubaoService.ask(question, context);
>>>>>>> a648754d40cbc3e44cd03f0cf82527487e5b6465
    
    return {
      answer: result.answer,
      type: 'text',
      data: null
    };
  } catch (error) {
    console.error('Doubao AI error:', error);
<<<<<<< HEAD
    return handleLocalFallback(userId, question, '');
  }
}

async function handleLocalFallback(userId, question, context) {
  const fallbackResponses = {
    greeting: {
      patterns: [/你好|您好|嗨|哈喽|hi|hello/i],
      response: '您好！我是信息论坛的智能助手。由于AI服务暂时不可用，我将为您提供基础服务。您可以：\n\n- 搜索帖子（如"搜索Vue相关内容"）\n- 查询统计信息（如"论坛有多少帖子"）\n- 查看我的帖子（如"我发布了多少帖子"）\n- 发布/删除/修改帖子'
    },
    thanks: {
      patterns: [/谢谢|感谢|辛苦了|谢谢了/i],
      response: '不客气！有问题随时问我。'
    },
    help: {
      patterns: [/帮助|能做什么|怎么用|功能/i],
      response: '我可以帮助您：\n\n📊 查询统计信息：帖子数量、浏览量、用户数\n🔍 搜索内容：搜索特定关键词的帖子\n👤 个人信息：查询您发布的帖子\n📝 操作功能：发布、删除、修改帖子\n\n由于AI服务暂时不可用，部分智能分析功能受限。'
    },
    stats: {
      patterns: [/多少|数量|统计|总数|概览/i],
      response: '由于AI服务暂时不可用，请直接使用快捷提问按钮或搜索功能获取统计信息。'
    },
    search: {
      patterns: [/搜索|查找|找|相关/i],
      response: '由于AI服务暂时不可用，请在搜索框中输入关键词进行搜索。'
    }
  };
  
  for (const [key, config] of Object.entries(fallbackResponses)) {
    if (config.patterns.some(pattern => pattern.test(question))) {
      return {
        answer: config.response,
        type: 'text',
        data: null
      };
    }
  }
  
  try {
    const relatedPosts = await searchPosts(question, []);
    if (relatedPosts.data && relatedPosts.data.length > 0) {
      let answer = '由于AI服务暂时不可用，我为您找到以下相关帖子：\n\n';
      relatedPosts.data.slice(0, 5).forEach((p, index) => {
        answer += `${index + 1}.【${getCategoryDisplayName(p.category)}】${p.title}\n`;
      });
      answer += '\n您可以点击帖子查看详细内容。';
      return {
        answer,
        type: 'posts',
        data: relatedPosts.data.slice(0, 5)
      };
    }
  } catch (dbError) {
    console.error('Local fallback database error:', dbError);
  }
  
  return {
    answer: '抱歉，AI服务暂时不可用。您可以尝试：\n\n- 重新输入问题\n- 使用页面上的搜索功能\n- 使用快捷提问按钮\n\n服务恢复后将自动恢复完整功能。',
    type: 'text',
    data: null
  };
}

export default router;
=======
    return {
      answer: '抱歉，AI服务暂时不可用，请稍后再试。',
      type: 'text',
      data: null
    };
  }
}

<<<<<<< HEAD
export default router;
=======
export default router;
>>>>>>> ac58535bee06e561eeda876df089ccdadedcee65
>>>>>>> a648754d40cbc3e44cd03f0cf82527487e5b6465
