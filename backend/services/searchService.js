/**
 * 搜索服务
 * 负责帖子搜索、匹配度计算、统计查询等功能
 */

import { pool } from '../config/db.js';

/**
 * 计算帖子匹配度分数
 */
function calculateMatchScore(post, keywords) {
  let score = 0;
  const title = post.title || '';
  const content = post.content || '';
  const category = post.category || '';
  
  // 标题匹配分数（权重最高）
  for (const keyword of keywords) {
    if (title.includes(keyword)) {
      score += 15; // 标题匹配加15分
    }
    if (content.includes(keyword)) {
      score += 5; // 内容匹配加5分
    }
    // 分类匹配
    const categoryMap = {
      '技术': 'technology',
      '新闻': 'news',
      '产品': 'product',
      '其他': 'other'
    };
    const normalizedKeyword = categoryMap[keyword] || keyword;
    if (category === normalizedKeyword) {
      score += 10; // 分类匹配加10分
    }
  }
  
  // 热度因子（基于浏览量）
  const viewCount = post.view_count || 0;
  if (viewCount >= 100) {
    score += 8;
  } else if (viewCount >= 50) {
    score += 5;
  } else if (viewCount >= 10) {
    score += 3;
  }
  
  // 时间衰减因子（最近发布的帖子优先）
  const createdTime = new Date(post.created_at);
  const now = new Date();
  const daysOld = Math.floor((now - createdTime) / (1000 * 60 * 60 * 24));
  if (daysOld <= 7) {
    score += 10;
  } else if (daysOld <= 30) {
    score += 5;
  } else if (daysOld <= 90) {
    score += 2;
  }
  
  return score;
}

/**
 * 获取最新帖子
 */
async function getLatestPosts(limit = 10) {
  const safeLimit = Math.min(parseInt(limit) || 10, 50);
  const [latestPosts] = await pool.execute(
    `SELECT id, title, category, view_count, created_at FROM info_items WHERE is_private = 0 ORDER BY created_at DESC LIMIT ${safeLimit}`
  );
  
  return latestPosts.map(p => ({
    id: p.id,
    title: p.title,
    category: p.category === 'technology' ? '技术' : p.category === 'news' ? '新闻' : p.category === 'product' ? '产品' : '其他',
    viewCount: p.view_count,
    createdAt: new Date(p.created_at).toLocaleDateString('zh-CN')
  }));
}

/**
 * 搜索帖子
 */
async function searchPosts(question, keywords) {
  if (!keywords || keywords.length === 0) {
    // 如果没有关键词，返回最新帖子作为推荐
    const posts = await getLatestPosts(10);
    
    return {
      answer: '为您推荐最新发布的帖子：',
      type: 'posts',
      data: posts
    };
  }
  
  console.log(`[DEBUG] 搜索问题: ${question}`);
  console.log(`[DEBUG] 提取的关键词: ${JSON.stringify(keywords)}`);
  
  let foundPosts = [];
  
  // 使用UNION ALL进行多关键词搜索（改进搜索效率）
  const keywordConditions = keywords.slice(0, 5)
    .filter(k => k.length >= 2)
    .map((keyword, index) => {
      let categoryValue = keyword;
      if (keyword === '技术') categoryValue = 'technology';
      else if (keyword === '新闻') categoryValue = 'news';
      else if (keyword === '产品') categoryValue = 'product';
      else if (keyword === '其他') categoryValue = 'other';
      return `(SELECT id, title, content, category, view_count, created_at, ${index + 1} as keyword_rank FROM info_items WHERE is_private = 0 AND (title LIKE ? OR content LIKE ? OR category = ?))`;
    });
  
  if (keywordConditions.length > 0) {
    const query = `${keywordConditions.join(' UNION ALL ')} ORDER BY created_at DESC LIMIT 30`;
    const params = keywords.slice(0, 5)
      .filter(k => k.length >= 2)
      .flatMap(k => {
        let categoryValue = k;
        if (k === '技术') categoryValue = 'technology';
        else if (k === '新闻') categoryValue = 'news';
        else if (k === '产品') categoryValue = 'product';
        else if (k === '其他') categoryValue = 'other';
        return [`%${k}%`, `%${k}%`, categoryValue];
      });
    
    const [posts] = await pool.execute(query, params);
    foundPosts = posts;
  }
  
  console.log(`[DEBUG] 找到 ${foundPosts.length} 篇帖子`);
  
  // 去重并计算匹配度
  const postsWithScore = [];
  const seenIds = new Set();
  
  for (const post of foundPosts) {
    if (!seenIds.has(post.id)) {
      seenIds.add(post.id);
      const score = calculateMatchScore(post, keywords);
      postsWithScore.push({ ...post, score });
    }
  }
  
  // 按匹配度分数排序，分数越高越靠前
  postsWithScore.sort((a, b) => b.score - a.score);
  
  // 取前10篇
  const topPosts = postsWithScore.slice(0, 10);
  
  console.log(`[DEBUG] 排序后帖子（按匹配度）: ${topPosts.map(p => `${p.title} (分数: ${p.score.toFixed(1)})`).join(', ')}`);
  
  if (topPosts.length > 0) {
    const posts = topPosts.map(p => ({
      id: p.id,
      title: p.title,
      category: p.category === 'technology' ? '技术' : p.category === 'news' ? '新闻' : p.category === 'product' ? '产品' : '其他',
      viewCount: p.view_count,
      createdAt: new Date(p.created_at).toLocaleDateString('zh-CN'),
      matchScore: p.score.toFixed(1)
    }));
    
    // 根据匹配度生成不同的回复语
    const avgScore = posts.reduce((sum, p) => sum + parseFloat(p.matchScore), 0) / posts.length;
    let answerPrefix = '';
    if (avgScore >= 25) {
      answerPrefix = `找到了 ${posts.length} 篇与"${question}"高度相关的帖子：`;
    } else if (avgScore >= 15) {
      answerPrefix = `找到 ${posts.length} 篇与"${question}"相关的帖子：`;
    } else {
      answerPrefix = `为您找到 ${posts.length} 篇可能相关的帖子：`;
    }
    
    return {
      answer: answerPrefix,
      type: 'posts',
      data: posts
    };
  } else {
    // 如果没有找到匹配的帖子，返回最新的帖子作为推荐，并提示用户尝试其他关键词
    const posts = await getLatestPosts(10);
    
    return {
      answer: `没有找到与"${question}"相关的帖子。为您推荐最新发布的帖子：\n\n您可以尝试搜索以下热门技术关键词：云计算、Vue、React、人工智能、大数据`,
      type: 'posts',
      data: posts
    };
  }
}

/**
 * 获取我的帖子列表
 */
async function getMyPostsList(userId) {
  const [posts] = await pool.execute(
    'SELECT id, title, category, view_count, created_at FROM info_items WHERE user_id = ? ORDER BY created_at DESC',
    [userId]
  );
  
  const formattedPosts = posts.map(p => ({
    id: p.id,
    title: p.title,
    category: p.category === 'technology' ? '技术' : p.category === 'news' ? '新闻' : p.category === 'product' ? '产品' : '其他',
    viewCount: p.view_count,
    createdAt: new Date(p.created_at).toLocaleDateString('zh-CN')
  }));
  
  if (formattedPosts.length > 0) {
    return {
      answer: `您共发布了 ${formattedPosts.length} 篇帖子：`,
      type: 'posts',
      data: formattedPosts
    };
  } else {
    return {
      answer: '您还没有发布任何帖子。',
      type: 'text',
      data: null
    };
  }
}

/**
 * 获取我的帖子数量
 */
async function getMyPostsCount(userId) {
  const [result] = await pool.execute(
    'SELECT COUNT(*) as count FROM info_items WHERE user_id = ?',
    [userId]
  );
  
  const count = result[0].count;
  return {
    answer: `您共发布了 ${count} 篇帖子`,
    type: 'text',
    data: { count }
  };
}

/**
 * 获取总帖子数
 */
async function getTotalPosts() {
  const [result] = await pool.execute('SELECT COUNT(*) as count FROM info_items WHERE is_private = 0');
  const count = result[0].count;
  return {
    answer: `论坛共有 ${count} 篇帖子`,
    type: 'text',
    data: { count }
  };
}

/**
 * 获取总浏览量
 */
async function getTotalViews() {
  const [result] = await pool.execute('SELECT SUM(view_count) as total FROM info_items WHERE is_private = 0');
  const total = result[0].total || 0;
  return {
    answer: `论坛总浏览量为 ${total} 次`,
    type: 'text',
    data: { total }
  };
}

/**
 * 获取总评论数
 */
async function getTotalComments() {
  const [result] = await pool.execute('SELECT COUNT(*) as count FROM comments');
  const count = result[0].count;
  return {
    answer: `论坛共有 ${count} 条评论`,
    type: 'text',
    data: { count }
  };
}

/**
 * 获取总用户数
 */
async function getTotalUsers() {
  const [result] = await pool.execute('SELECT COUNT(*) as count FROM users');
  const count = result[0].count;
  return {
    answer: `论坛共有${count}名用户`,
    type: 'text',
    data: { count }
  };
}

/**
 * 获取分类统计
 */
async function getCategoryStats() {
  const [rows] = await pool.execute(
    'SELECT category, COUNT(*) as count FROM info_items WHERE is_private = 0 GROUP BY category'
  );
  
  const stats = [];
  let totalCount = 0;
  
  const categoryNames = {
    'technology': '技术',
    'news': '新闻',
    'product': '产品',
    'other': '其他'
  };
  
  for (const row of rows) {
    stats.push({
      category: row.category,
      name: categoryNames[row.category] || row.category,
      count: row.count
    });
    totalCount += row.count;
  }
  
  // 确保所有分类都有数据
  const allCategories = ['technology', 'news', 'product', 'other'];
  for (const cat of allCategories) {
    if (!stats.some(s => s.category === cat)) {
      stats.push({
        category: cat,
        name: categoryNames[cat],
        count: 0
      });
    }
  }
  
  const statText = stats.map(s => `${s.name}: ${s.count}篇`).join('，');
  
  return {
    answer: `论坛各分类内容数量如下：${statText}`,
    type: 'text',
    data: stats
  };
}

/**
 * 获取系统概览信息
 */
async function getSystemOverview(userId = null) {
  const [postsResult] = await pool.execute('SELECT COUNT(*) as count FROM info_items WHERE is_private = 0');
  const [viewsResult] = await pool.execute('SELECT SUM(view_count) as total FROM info_items WHERE is_private = 0');
  const [usersResult] = await pool.execute('SELECT COUNT(*) as count FROM users');
  const [categoryResult] = await pool.execute('SELECT category, COUNT(*) as count FROM info_items WHERE is_private = 0 GROUP BY category');
  
  const totalPosts = postsResult[0].count;
  const totalViews = viewsResult[0].total || 0;
  const totalUsers = usersResult[0].count;
  
  let userPosts = 0;
  if (userId) {
    const [userResult] = await pool.execute('SELECT COUNT(*) as count FROM info_items WHERE user_id = ?', [userId]);
    userPosts = userResult[0].count;
  }
  
  const categories = categoryResult.map(row => ({
    category: row.category,
    name: row.category === 'technology' ? '技术' : row.category === 'news' ? '新闻' : row.category === 'product' ? '产品' : '其他',
    count: row.count
  }));
  
  // 获取最新帖子
  const [latestPosts] = await pool.execute(
    'SELECT id, title, category, view_count, created_at FROM info_items WHERE is_private = 0 ORDER BY created_at DESC LIMIT 10'
  );
  
  const recentPosts = latestPosts.map(p => ({
    id: p.id,
    title: p.title,
    category: p.category === 'technology' ? '技术' : p.category === 'news' ? '新闻' : p.category === 'product' ? '产品' : '其他',
    viewCount: p.view_count,
    createdAt: new Date(p.created_at).toLocaleDateString('zh-CN')
  }));
  
  return {
    totalPosts,
    totalViews,
    totalUsers,
    userPosts,
    categories,
    recentPosts
  };
}

// 导出所有函数
<<<<<<< HEAD
=======
<<<<<<< HEAD
>>>>>>> a648754d40cbc3e44cd03f0cf82527487e5b6465
async function getPostById(postId) {
  const [posts] = await pool.execute(
    'SELECT id, title, content, category, user_id, view_count, created_at FROM info_items WHERE id = ?',
    [postId]
  );
  
  if (posts.length === 0) {
    return null;
  }
  
  const post = posts[0];
  return {
    id: post.id,
    title: post.title,
    content: post.content,
    category: post.category === 'technology' ? '技术' : post.category === 'news' ? '新闻' : post.category === 'product' ? '产品' : '其他',
    userId: post.user_id,
    viewCount: post.view_count,
    createdAt: new Date(post.created_at).toLocaleString('zh-CN')
  };
}

async function getPostsByKeyword(keyword, limit = 5) {
  const safeLimit = Math.min(Math.max(1, Number(limit) || 5), 20);
  const cleanKeyword = (keyword || '').replace(/["'“”‘’]/g, '');
  const [posts] = await pool.execute(
    `SELECT id, title, content, category, view_count, created_at FROM info_items WHERE is_private = 0 AND (title LIKE ? OR content LIKE ?) ORDER BY created_at DESC LIMIT ${safeLimit}`,
    [`%${cleanKeyword}%`, `%${cleanKeyword}%`]
  );
  
  return posts.map(post => ({
    id: post.id,
    title: post.title,
    content: post.content,
    category: post.category === 'technology' ? '技术' : post.category === 'news' ? '新闻' : post.category === 'product' ? '产品' : '其他',
    viewCount: post.view_count,
    createdAt: new Date(post.created_at).toLocaleString('zh-CN')
  }));
}

<<<<<<< HEAD
=======
=======
>>>>>>> ac58535bee06e561eeda876df089ccdadedcee65
>>>>>>> a648754d40cbc3e44cd03f0cf82527487e5b6465
export {
  searchPosts,
  getMyPostsList,
  getMyPostsCount,
  getTotalPosts,
  getTotalViews,
  getTotalComments,
  getTotalUsers,
  getCategoryStats,
  getSystemOverview,
  getLatestPosts,
<<<<<<< HEAD
  calculateMatchScore,
  getPostById,
  getPostsByKeyword
=======
<<<<<<< HEAD
  calculateMatchScore,
  getPostById,
  getPostsByKeyword
=======
  calculateMatchScore
>>>>>>> ac58535bee06e561eeda876df089ccdadedcee65
>>>>>>> a648754d40cbc3e44cd03f0cf82527487e5b6465
};
