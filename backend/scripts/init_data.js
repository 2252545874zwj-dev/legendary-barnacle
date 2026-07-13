import { pool } from '../config/db.js';

const infoItems = [
  {
    title: 'Vue 3 组合式 API 入门指南',
    content: 'Vue 3 引入了组合式 API，提供了更灵活的代码组织方式。本文将介绍如何使用 ref、reactive、computed 等核心 API，以及如何构建可复用的组合函数。',
    category: 'technology'
  },
  {
    title: 'TypeScript 高级类型技巧',
    content: '深入了解 TypeScript 的高级类型特性，包括泛型、条件类型、映射类型等，帮助你编写更类型安全的代码。',
    category: 'technology'
  },
  {
    title: '公司年度产品发布会',
    content: '公司将于下月举办年度产品发布会，届时将发布多款新产品和功能更新。敬请期待！',
    category: 'news'
  },
  {
    title: 'AI 智能助手功能升级',
    content: '我们的 AI 智能助手已完成重大升级，新增语音识别、智能问答、自动摘要等功能，提升用户体验。',
    category: 'product'
  },
  {
    title: 'React 18 新特性详解',
    content: 'React 18 带来了并发渲染、自动批处理、Suspense 改进等新特性，本文详细介绍这些功能的使用方法。',
    category: 'technology'
  },
  {
    title: '云计算市场趋势分析',
    content: '2024年云计算市场持续增长，各大厂商纷纷加大投入。本文分析当前市场趋势和未来发展方向。',
    category: 'news'
  },
  {
    title: '企业级安全解决方案',
    content: '针对企业客户，我们推出了全方位的安全解决方案，包括数据加密、访问控制、安全审计等功能。',
    category: 'product'
  },
  {
    title: '团队建设活动通知',
    content: '为增强团队凝聚力，公司计划本周末组织户外团建活动，欢迎全体员工积极参与。',
    category: 'other'
  },
  {
    title: 'Node.js 性能优化指南',
    content: '本文介绍 Node.js 应用性能优化的最佳实践，包括内存管理、异步处理、缓存策略等方面。',
    category: 'technology'
  },
  {
    title: '行业峰会邀请函',
    content: '诚邀您参加将于下月举办的行业峰会，届时将有多位行业专家分享前沿技术和趋势。',
    category: 'news'
  },
  {
    title: '移动端应用更新说明',
    content: '移动端应用已更新至 v2.0 版本，修复了多项已知问题，提升了应用稳定性和性能。',
    category: 'product'
  },
  {
    title: '员工培训计划',
    content: '公司将在本月开展新员工培训计划，涵盖产品知识、技术技能、企业文化等多个方面。',
    category: 'other'
  }
];

const initData = async () => {
  try {
    for (const item of infoItems) {
      await pool.execute(
        'INSERT IGNORE INTO info_items (title, content, category) VALUES (?, ?, ?)',
        [item.title, item.content, item.category]
      );
    }
    console.log('Initial data inserted successfully');
    process.exit(0);
  } catch (error) {
    console.error('Failed to insert initial data:', error);
    process.exit(1);
  }
};

initData();
