export const intentConfig = {
  greetings: ['你好', '您好', 'hi', 'hello', '哈喽', '嗨', '早上好', '下午好', '晚上好'],

  thanks: ['谢谢', '谢谢你', '感谢', '辛苦了', '谢谢啦'],

  helpKeywords: ['帮助', '帮忙', '怎么用', '怎么使用', '功能', '能做什么', '可以做什么', '使用说明', '帮助中心'],

  summaryIndicators: ['总结', '概括', '概要', '摘要', '详细描述', '描述一下', '具体内容', '内容是什么', '讲一下', '介绍一下', '内容是', '具体说明', '说明一下', '说明'],

  explainIndicators: ['请详细', '详细介绍', '解释一下', '详细说明', '讲一下', '阐述', '论述'],

  commonKeywords: [
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
  ],

  intents: [
    {
      type: 'my_posts_count',
      priority: 100,
      description: '查询用户发布的帖子数量',
      requiresUserId: true,
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
      excludeKeywords: ['哪些', '列表', '搜索', '帮我', '帮', '找']
    },
    {
      type: 'my_posts_list',
      priority: 90,
      description: '查询用户发布的帖子列表',
      requiresUserId: true,
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
      excludeKeywords: ['搜索', '帮我', '帮', '找']
    },
    {
      type: 'total_posts',
      priority: 80,
      description: '查询论坛总帖子数',
      requiresUserId: false,
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
      priority: 75,
      description: '查询论坛总浏览量',
      requiresUserId: false,
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
      priority: 75,
      description: '查询论坛总评论数',
      requiresUserId: false,
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
      priority: 70,
      description: '查询论坛总用户数',
      requiresUserId: false,
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
      priority: 65,
      description: '查询各分类帖子统计',
      requiresUserId: false,
      keywords: ['分类', '类别', '版块', '板块'],
      patterns: [
        /分类.*(数量|统计)/,
        /各.*分类/,
        /类别.*(数量|统计)/
      ]
    },
    {
      type: 'latest_posts',
      priority: 60,
      description: '查询最新发布的帖子',
      requiresUserId: false,
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
    },
    {
      type: 'search_posts',
      priority: 50,
      description: '搜索帖子',
      requiresUserId: false,
      keywords: [],
      patterns: [],
      isDefault: true
    },
    {
      type: 'create_post',
      priority: 45,
      description: '发布新帖子',
      action: true,
      requiresConfirmation: false,
      requiresUserId: true,
      keywords: ['发布', '发帖', '发帖子', '写文章', '创建帖子', '标题', '内容'],
      patterns: [
        /(发布|发|写|创建).*(帖子|文章)/,
        /发.*新.*帖子/,
        /写一篇.*文章/,
        /发布.*关于.*帖子/,
        /我让你.*发布/,
        /发布.*类型.*标题.*内容/,
        /发布.*标题.*内容/
      ],
      requiredParams: ['title', 'content'],
      optionalParams: ['category'],
      defaultValues: { category: 'technology' }
    },
    {
      type: 'delete_post',
      priority: 45,
      description: '删除帖子',
      action: true,
      requiresConfirmation: true,
      requiresUserId: true,
      keywords: ['删除', '删掉', '移除', '取消发布'],
      patterns: [
        /删除.*帖子/,
        /删掉.*帖子/,
        /移除.*帖子/,
        /取消.*发布/
      ],
      requiredParams: ['postId'],
      optionalParams: []
    },
    {
      type: 'update_post',
      priority: 45,
      description: '更新帖子',
      action: true,
      requiresConfirmation: true,
      requiresUserId: true,
      keywords: ['修改', '编辑', '更新', '更改'],
      patterns: [
        /修改.*帖子/,
        /编辑.*帖子/,
        /更新.*帖子/,
        /更改.*帖子内容/
      ],
      requiredParams: ['postId'],
      optionalParams: ['title', 'content', 'category'],
      defaultValues: {}
    },
    {
      type: 'search_and_create',
      priority: 40,
      description: '搜索并创建帖子',
      action: true,
      requiresConfirmation: false,
      requiresUserId: true,
      keywords: ['搜索', '查找', '找', '发帖'],
      patterns: [
        /搜索.*然后.*发布/,
        /先.*搜索.*再.*发帖/,
        /找.*相关.*然后.*写/
      ],
      requiredParams: ['keyword', 'title', 'content'],
      optionalParams: ['category'],
      defaultValues: { category: 'technology' }
    }
  ]
};

export default intentConfig;