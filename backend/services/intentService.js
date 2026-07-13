/**
 * 意图识别服务
 * 负责分析用户问题，识别其意图类型
 */

// 意图定义：包含关键词和正则模式
const intents = [
  {
    type: 'my_posts_count',
    keywords: ['我', '发布', '帖子', '多少', '几篇', '数量'],
    patterns: [
      /我.*(发布|发).*帖子.*(多少|几篇|数量)/,
      /(我的|我).*帖子.*(数量|多少)/,
      /我.*发布.*多少.*帖子/,
      /我.*帖子.*多少/,
      /我.*发布了.*多少.*帖子/,
      /我.*发布了.*帖子.*多少/,
      /我.*(发布|发).*多少.*帖子/
    ],
    requiredKeywords: [['我', '帖子', '多少'], ['我', '帖子', '数量'], ['我', '发布', '帖子', '多少']],
    excludeKeywords: ['哪些', '列表', '搜索', '帮我', '帮', '找'],
    requiresUserId: true
  },
  {
    type: 'my_posts_list',
    keywords: ['我', '发布', '帖子', '哪些', '列表', '查看', '发过', '列出'],
    patterns: [
      /我.*(发布|发).*帖子.*(哪些|列表|查看)/,
      /(我的|我).*帖子.*有.*哪些/,
      /查看.*我.*帖子/,
      /列出.*我的.*帖子/,
      /我的帖子列表/,
      /查看我的帖子/,
      /我.*发布.*帖子.*列表/
    ],
    requiredKeywords: [['我', '帖子'], ['我', '发布']],
    excludeKeywords: ['搜索', '帮我', '帮', '找'],
    requiresUserId: true
  },
  {
    type: 'total_posts',
    keywords: ['帖子', '数量', '多少', '共有', '总'],
    patterns: [
      /帖子.*(数量|多少)/,
      /(数量|多少).*帖子/,
      /共有.*帖子/,
      /总.*帖子.*(数|数量)/,
      /论坛.*帖子.*(数量|多少)/,
      /论坛.*(多少|数量).*帖子/
    ],
    excludeKeywords: ['我', '我的', '发布', '分类', '类别']
  },
  {
    type: 'total_views',
    keywords: ['浏览', '访问', '查看', '次数'],
    patterns: [
      /浏览.*(量|次数)/,
      /访问.*(量|次数)/,
      /总.*浏览/
    ],
    excludeKeywords: ['我的', '我']
  },
  {
    type: 'total_comments',
    keywords: ['留言', '评论', '回复'],
    patterns: [
      /留言.*(数量|多少)/,
      /评论.*(数量|多少)/,
      /(留言|评论)数/
    ],
    excludeKeywords: ['我的', '我']
  },
  {
    type: 'total_users',
    keywords: ['用户', '注册', '人数'],
    patterns: [
      /用户.*(数量|多少)/,
      /注册.*用户/,
      /用户数/
    ],
    excludeKeywords: ['我的', '我']
  },
  {
    type: 'category_stats',
    keywords: ['分类', '类别', '版块', '板块'],
    patterns: [
      /分类.*(数量|统计)/,
      /各.*分类/,
      /类别.*(数量|统计)/
    ]
  },
  {
    type: 'latest_posts',
    keywords: ['最新', '最近', '推荐', '新发布', '刚发布', '文章'],
    patterns: [
      /最新.*帖子/,
      /最近.*帖子/,
      /推荐.*帖子/,
      /(新|刚).*发布.*帖子/,
      /最新.*文章/,
      /最近.*文章/,
      /推荐.*文章/
    ]
  }
];

// 常见技术关键词列表
const commonKeywords = [
  '云计算', '云服务', '云存储', '人工智能', 'AI', '机器学习', '深度学习',
  '大数据', '数据分析', '数据挖掘', '区块链', '物联网', 'IoT',
  '前端开发', '后端开发', '全栈开发', 'Vue', 'React', 'Angular',
  'Node.js', 'TypeScript', 'JavaScript', 'Python', 'Java', 'Go', 'Rust',
  '微服务', '容器化', 'Docker', 'Kubernetes', 'DevOps', 'CI/CD',
  '数据库', 'MySQL', 'PostgreSQL', 'MongoDB', 'Redis', '缓存',
  'API', 'REST', 'GraphQL', 'WebSocket', 'HTTP', 'HTTPS',
  '安全', '加密', '认证', '授权', 'OAuth', 'JWT',
  '性能优化', '负载均衡', 'CDN', '边缘计算', 'Serverless',
  '技术', '新闻', '产品', '文章', '教程', '指南'
];

// 详细解释意图关键词
const explainIndicators = ['请详细', '详细介绍', '解释一下', '详细说明', '讲一下', '阐述', '论述'];

/**
 * 判断是否匹配某个意图
 */
function matchesIntent(question, intent) {
  const lowerQuestion = question.toLowerCase();
  
  // 检查排除关键词
  if (intent.excludeKeywords) {
    for (const keyword of intent.excludeKeywords) {
      if (lowerQuestion.includes(keyword.toLowerCase())) {
        return false;
      }
    }
  }

  // 检查正则模式
  if (intent.patterns) {
    for (const pattern of intent.patterns) {
      if (pattern.test(question)) {
        return true;
      }
    }
  }

  // 检查关键词组合
  if (intent.requiredKeywords) {
    for (const keywordGroup of intent.requiredKeywords) {
      let allMatch = true;
      for (const keyword of keywordGroup) {
        if (!lowerQuestion.includes(keyword.toLowerCase())) {
          allMatch = false;
          break;
        }
      }
      if (allMatch) {
        return true;
      }
    }
  }

  // 检查是否包含所有关键词
  if (intent.keywords) {
    const foundKeywords = intent.keywords.filter(k => 
      lowerQuestion.includes(k.toLowerCase())
    );
    if (foundKeywords.length >= Math.ceil(intent.keywords.length / 2)) {
      return true;
    }
  }

  return false;
}

/**
 * 判断是否为问候语
 */
function isGreeting(question) {
  const greetings = ['你好', '您好', 'hi', 'hello', '哈喽', '嗨', '早上好', '下午好', '晚上好'];
  return greetings.some(g => question.includes(g));
}

/**
 * 判断是否为感谢语
 */
function isThanks(question) {
  const thanks = ['谢谢', '谢谢你', '感谢', '辛苦了', '谢谢啦'];
  return thanks.some(t => question.includes(t));
}

/**
 * 判断是否为帮助请求
 */
function isHelpRequest(question) {
  const helpKeywords = ['帮助', '帮忙', '怎么用', '功能', '能做什么', '可以做什么', '使用说明', '帮助中心'];
  return helpKeywords.some(k => question.includes(k));
}

/**
 * 判断是否为总结意图
 */
function hasSummaryIntent(question) {
  return question.includes('总结') || question.includes('概括');
}

/**
 * 判断是否为详细解释意图
 */
function hasExplainIntent(question) {
  return explainIndicators.some(kw => question.includes(kw));
}

/**
 * 智能识别用户意图
 */
function smartIdentifyIntent(question, userId) {
  // 总结意图优先！
  if (hasSummaryIntent(question)) {
    return { type: null, keywords: [] };
  }
  
  // 详细解释意图优先！
  if (hasExplainIntent(question)) {
    return { type: null, keywords: [] };
  }
  
  // 优先检查需要登录的意图（我的帖子相关）
  const myPostsCountIntent = intents.find(i => i.type === 'my_posts_count');
  if (matchesIntent(question, myPostsCountIntent)) {
    if (myPostsCountIntent.requiresUserId && !userId) {
      return { type: null, keywords: [] };
    }
    return { type: 'my_posts_count', keywords: [] };
  }

  // 然后检查"我的帖子列表"
  const myPostsListIntent = intents.find(i => i.type === 'my_posts_list');
  if (matchesIntent(question, myPostsListIntent)) {
    if (myPostsListIntent.requiresUserId && !userId) {
      return { type: null, keywords: [] };
    }
    return { type: 'my_posts_list', keywords: [] };
  }
  
  // 检查其他需要登录的意图
  for (const intent of intents) {
    if (intent.requiresUserId && matchesIntent(question, intent)) {
      if (!userId) {
        return { type: null, keywords: [] };
      }
      return { type: intent.type, keywords: [] };
    }
  }
  
  // 然后检查技术关键词搜索
  const foundTechKeywords = commonKeywords.filter(k => question.includes(k));
  
  if (foundTechKeywords.length > 0) {
    return { type: 'search_posts', keywords: foundTechKeywords };
  }

  // 检查其他意图
  for (const intent of intents) {
    if (intent.type !== 'my_posts_list' && matchesIntent(question, intent)) {
      if (intent.requiresUserId && !userId) {
        continue;
      }
      return { type: intent.type, keywords: [] };
    }
  }
  
  // 如果没有匹配到任何意图，返回默认类型（让它走AI路径）
  return { type: null, keywords: [] };
}

// 导出所有函数
export {
  smartIdentifyIntent,
  isGreeting,
  isThanks,
  isHelpRequest,
  hasSummaryIntent,
  hasExplainIntent,
  matchesIntent,
  commonKeywords
};
