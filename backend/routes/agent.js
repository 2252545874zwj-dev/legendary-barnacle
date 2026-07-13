/**
 * 智能助手路由
 * 负责处理用户与智能助手的交互
 */

import express from 'express';
import { pool } from '../config/db.js';
import { doubaoService } from '../services/doubaoService.js';
import { 
  smartIdentifyIntent, 
  isGreeting, 
  isThanks, 
  isHelpRequest,
  hasSummaryIntent,
  hasExplainIntent 
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
  getSystemOverview
} from '../services/searchService.js';

const router = express.Router();

// 存储对话历史（模拟会话管理）
const conversationHistory = new Map();

router.post('/ask', async (req, res) => {
  try {
    const { userId, question, sessionId, stream = false } = req.body;

    console.log('Received question:', question);
    console.log('User ID:', userId);
    console.log('Session ID:', sessionId);
    console.log('Stream mode:', stream);

    if (!question) {
      return res.status(400).json({ message: '问题不能为空' });
    }

    // 获取对话历史
    let history = [];
    if (sessionId && conversationHistory.has(sessionId)) {
      history = conversationHistory.get(sessionId);
    }

    // 检查是否需要流式输出
    if (stream) {
      // 设置SSE响应头
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');
      res.setHeader('Access-Control-Allow-Origin', '*');

      let fullAnswer = '';

      try {
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
          conversationHistory.set(sessionId, history);
        }

        await pool.execute(
          'INSERT INTO agent_interactions (user_id, question, answer) VALUES (?, ?, ?)',
          [userId || null, question, fullAnswer]
        );
      } catch (error) {
        console.error('Stream error:', error);
        res.write(`data: ${JSON.stringify({ type: 'error', content: '服务器内部错误' })}\n\n`);
        res.end();
      }
    } else {
      // 普通模式
      const result = await analyzeIntentAndReply(userId, question, history);

      // 更新对话历史（保留最近10条）
      if (sessionId) {
        history.push({ question, answer: result.answer });
        if (history.length > 10) {
          history.shift();
        }
        conversationHistory.set(sessionId, history);
      }

      await pool.execute(
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

// 智能意图分析函数
async function analyzeIntentAndReply(userId, question, history = []) {
  // 0. 总结意图优先检测！如果包含"总结"或"概括"关键词，直接走AI路径
  if (hasSummaryIntent(question)) {
    return await handleWithDoubaoAI(userId, question, history);
  }

  // 1. 问候语检测
  if (isGreeting(question)) {
    return {
      answer: '您好！我是信息论坛的智能助手，请问有什么可以帮助您的？\n\n您可以问我：\n- 搜索技术相关内容（如"云计算"、"Vue"）\n- 查看最新发布的内容\n- 查询论坛统计信息\n- 总结文章内容',
      type: 'text',
      data: null
    };
  }

  // 2. 感谢语检测
  if (isThanks(question)) {
    return {
      answer: '不客气！有问题随时问我。',
      type: 'text',
      data: null
    };
  }

  // 3. 帮助请求检测
  if (isHelpRequest(question)) {
    return {
      answer: '我可以帮助您：\n\n📊 查询统计信息：\n- 内容数量、浏览量、用户数\n- 各分类内容统计\n\n🔍 搜索内容：\n- 搜索特定内容\n- 查看最新发布的内容\n- 搜索技术相关文章\n\n👤 个人信息：\n- 查询您发布的内容数量\n- 查看您发布的内容列表\n\n🤖 AI智能问答：\n- 总结文章内容\n- 分析问题\n- 解答各类问题',
      type: 'text',
      data: null
    };
  }

  // 4. 智能意图识别
  const intent = smartIdentifyIntent(question, userId);
  
  console.log(`[DEBUG] 识别到的意图: ${intent.type}`);
  console.log(`[DEBUG] 意图关键词: ${JSON.stringify(intent.keywords)}`);
  
  // 对于需要查询数据库的精确意图，使用本地处理（保证数据准确性）
  const databaseIntents = ['my_posts_count', 'my_posts_list', 'total_posts', 'total_views', 'total_comments', 'total_users', 'category_stats', 'latest_posts', 'search_posts'];
  
  console.log(`[DEBUG] 是否在数据库意图列表中: ${databaseIntents.includes(intent.type)}`);
  
  // 如果是search_posts意图，确保走搜索路径
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
  
  // 所有其他问题（包括详细解释请求）都使用豆包 AI 进行智能回答
  return await handleWithDoubaoAI(userId, question, history);
}

// 流式版本的意图分析和回答
async function* analyzeIntentAndReplyStream(userId, question, history = []) {
  try {
    // 先获取完整回答
    const result = await analyzeIntentAndReply(userId, question, history);
    
    const answer = result.answer || '抱歉，我暂时无法回答您的问题。';
    
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
      }
    }
  } catch (error) {
    console.error('Stream intent analysis error:', error);
    yield '抱歉，处理过程中出现错误。';
  }
}

// 使用豆包 AI 处理问题
async function handleWithDoubaoAI(userId, question, history = []) {
  try {
    // 检查是否是需要登录的请求（如"我的帖子"）
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
    
    // 获取系统概览信息作为上下文
    const overview = await getSystemOverview(userId);
    
    // 构建上下文信息
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
    
    // 如果有相关帖子内容，添加到上下文
    const relatedPosts = await searchPosts(question, []);
    if (relatedPosts.data && relatedPosts.data.length > 0) {
      context += `\n相关帖子内容：\n`;
      relatedPosts.data.slice(0, 2).forEach((p, index) => {
        context += `帖子${index + 1}：${p.title}\n`;
      });
    }
    
    // 调用豆包AI获取回答
    const result = await doubaoService.ask(question, context);
    
    return {
      answer: result.answer,
      type: 'text',
      data: null
    };
  } catch (error) {
    console.error('Doubao AI error:', error);
    return {
      answer: '抱歉，AI服务暂时不可用，请稍后再试。',
      type: 'text',
      data: null
    };
  }
}

export default router;
