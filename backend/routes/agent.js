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
  hasExplainIntent,
  getIntentByType,
  intentConfig
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
  getSystemOverview,
  getPostById,
  getPostsByKeyword
} from '../services/searchService.js';

const router = express.Router();

const conversationHistory = new Map();
const pendingActions = new Map();

router.post('/ask', async (req, res) => {
  try {
    const { userId, question, sessionId, stream = false, actionId, confirm = false } = req.body;

    console.log('Received question:', question);
    console.log('User ID:', userId);
    console.log('Session ID:', sessionId);
    console.log('Stream mode:', stream);
    console.log('Action ID:', actionId);
    console.log('Confirm:', confirm);

    if (!question && !actionId) {
      return res.status(400).json({ message: '问题不能为空' });
    }

    let history = [];
    if (sessionId && conversationHistory.has(sessionId)) {
      history = conversationHistory.get(sessionId);
    }

    if (actionId && confirm) {
      const result = await executePendingAction(actionId, userId);
      if (sessionId) {
        history.push({ question: `确认执行: ${actionId}`, answer: result.answer });
        if (history.length > 10) history.shift();
        conversationHistory.set(sessionId, history);
      }
      return res.json({ success: true, ...result });
    }

    if (stream) {
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');
      res.setHeader('Access-Control-Allow-Origin', '*');

      let fullAnswer = '';

      try {
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
      const result = await analyzeIntentAndReply(userId, question, history);

      if (sessionId) {
        history.push({ question, answer: result.answer });
        if (history.length > 10) history.shift();
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

async function analyzeIntentAndReply(userId, question, history = []) {
  if (hasSummaryIntent(question)) {
    return await handleWithDoubaoAI(userId, question, history);
  }

  if (isGreeting(question)) {
    return {
      answer: '您好！我是信息论坛的智能助手，请问有什么可以帮助您的？\n\n您可以问我：\n- 搜索技术相关内容（如"云计算"、"Vue"）\n- 查看最新发布的内容\n- 查询论坛统计信息\n- 总结文章内容\n- 发布/删除/修改帖子（如"发布一篇关于Vue的帖子"）',
      type: 'text',
      data: null
    };
  }

  if (isThanks(question)) {
    return {
      answer: '不客气！有问题随时问我。',
      type: 'text',
      data: null
    };
  }

  if (isHelpRequest(question)) {
    return {
      answer: '我可以帮助您：\n\n📊 查询统计信息：\n- 内容数量、浏览量、用户数\n- 各分类内容统计\n\n🔍 搜索内容：\n- 搜索特定内容\n- 查看最新发布的内容\n- 搜索技术相关文章\n\n👤 个人信息：\n- 查询您发布的内容数量\n- 查看您发布的内容列表\n\n📝 操作功能：\n- 发布帖子（如"发布一篇关于Vue的帖子"）\n- 删除帖子（如"删除ID为1的帖子"）\n- 修改帖子（如"修改帖子标题"）\n\n🤖 AI智能问答：\n- 总结文章内容\n- 分析问题\n- 解答各类问题',
      type: 'text',
      data: null
    };
  }

  const intent = smartIdentifyIntent(question, userId);
  
  console.log(`[DEBUG] 识别到的意图: ${intent.type}`);
  console.log(`[DEBUG] 意图关键词: ${JSON.stringify(intent.keywords)}`);
  
  const intentConfigItem = getIntentByType(intent.type);
  
  if (intentConfigItem && intentConfigItem.action) {
    return await handleActionIntent(userId, question, intentConfigItem);
  }
  
  const databaseIntents = ['my_posts_count', 'my_posts_list', 'total_posts', 'total_views', 'total_comments', 'total_users', 'category_stats', 'latest_posts', 'search_posts'];
  
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
      return {
        answer: `我需要更多信息才能帮您${intentConfig.description}。\n\n请提供以下信息：\n${stillMissing.map(p => `- ${getParamDisplayName(p)}`).join('\n')}`,
        type: 'question',
        data: {
          intentType: intentConfig.type,
          currentParams: extractedParams,
          missingParams: stillMissing
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
      createdAt: Date.now()
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
    }
    
    if (!params.title) {
      const keywords = intentConfig.commonKeywords || [];
      const foundKeyword = keywords.find(k => question.includes(k));
      if (foundKeyword) {
        params.title = `关于${foundKeyword}的帖子`;
      }
    }
  } else if (intentConfig.type === 'delete_post') {
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
  
  const [result] = await pool.execute(
    'INSERT INTO info_items (title, content, category, user_id, is_private, view_count) VALUES (?, ?, ?, ?, ?, ?)',
    [title, content, category, userId, 0, 0]
  );
  
  const insertId = result.insertId;
  
  const io = (await import('../server.js')).io;
  if (io) {
    io.emit('infoCreated', { id: insertId, title, category, userId });
  }
  
  return {
    answer: `✅ 帖子发布成功！\n\n标题：${title}\n分类：${getCategoryDisplayName(category)}\nID：${insertId}`,
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
  
  const [posts] = await pool.execute(
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
  
  await pool.execute('DELETE FROM comments WHERE info_id = ?', [postId]);
  await pool.execute('DELETE FROM info_items WHERE id = ?', [postId]);
  
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
  
  const [posts] = await pool.execute(
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
    updateFields.push('title = ?');
    updateValues.push(title);
  }
  if (content) {
    updateFields.push('content = ?');
    updateValues.push(content);
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
  
  await pool.execute(
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
    const result = await analyzeIntentAndReply(userId, question, history);
    
    const answer = result.answer || '抱歉，我暂时无法回答您的问题。';
    
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
      }
    }
  } catch (error) {
    console.error('Stream intent analysis error:', error);
    yield '抱歉，处理过程中出现错误。';
  }
}

async function handleWithDoubaoAI(userId, question, history = []) {
  try {
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
    
    const overview = await getSystemOverview(userId);
    
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
      context += `\n相关帖子内容：\n`;
      relatedPosts.data.slice(0, 2).forEach((p, index) => {
        context += `帖子${index + 1}：${p.title}\n`;
      });
    }
    
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