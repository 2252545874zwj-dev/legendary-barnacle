import type { InfoItem, Category } from '../types'

export const mockUsers = [
  {
    id: '1',
    username: 'admin',
    password: 'admin123',
    email: 'admin@example.com',
    name: '管理员'
  },
  {
    id: '2',
    username: 'user',
    password: 'user123',
    email: 'user@example.com',
    name: '普通用户'
  }
]

export const mockCategories: Category[] = [
  { id: 'all', name: '全部', count: 12 },
  { id: 'technology', name: '技术文档', count: 4 },
  { id: 'news', name: '新闻资讯', count: 3 },
  { id: 'product', name: '产品信息', count: 3 },
  { id: 'other', name: '其他', count: 2 }
]

export const mockInfoItems: InfoItem[] = [
  {
    id: '1',
    title: 'Vue 3 组合式 API 入门指南',
    content: 'Vue 3 引入了组合式 API，提供了更灵活的代码组织方式。本文将介绍如何使用 ref、reactive、computed 等核心 API，以及如何构建可复用的组合函数。',
    category: 'technology',
    isPrivate: false,
    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-01-15T10:30:00Z'
  },
  {
    id: '2',
    title: 'TypeScript 高级类型技巧',
    content: '深入了解 TypeScript 的高级类型特性，包括泛型、条件类型、映射类型等，帮助你编写更类型安全的代码。',
    category: 'technology',
    isPrivate: false,
    createdAt: '2024-01-14T09:00:00Z',
    updatedAt: '2024-01-14T09:00:00Z'
  },
  {
    id: '3',
    title: '公司年度产品发布会',
    content: '公司将于下月举办年度产品发布会，届时将发布多款新产品和功能更新。敬请期待！',
    category: 'news',
    isPrivate: false,
    createdAt: '2024-01-13T14:00:00Z',
    updatedAt: '2024-01-13T14:00:00Z'
  },
  {
    id: '4',
    title: 'AI 智能助手功能升级',
    content: '我们的 AI 智能助手已完成重大升级，新增语音识别、智能问答、自动摘要等功能，提升用户体验。',
    category: 'product',
    isPrivate: false,
    createdAt: '2024-01-12T11:30:00Z',
    updatedAt: '2024-01-12T11:30:00Z'
  },
  {
    id: '5',
    title: 'React 18 新特性详解',
    content: 'React 18 带来了并发渲染、自动批处理、Suspense 改进等新特性，本文详细介绍这些功能的使用方法。',
    category: 'technology',
    isPrivate: false,
    createdAt: '2024-01-11T16:00:00Z',
    updatedAt: '2024-01-11T16:00:00Z'
  },
  {
    id: '6',
    title: '云计算市场趋势分析',
    content: '2024年云计算市场持续增长，各大厂商纷纷加大投入。本文分析当前市场趋势和未来发展方向。',
    category: 'news',
    isPrivate: false,
    createdAt: '2024-01-10T10:00:00Z',
    updatedAt: '2024-01-10T10:00:00Z'
  },
  {
    id: '7',
    title: '企业级安全解决方案',
    content: '针对企业客户，我们推出了全方位的安全解决方案，包括数据加密、访问控制、安全审计等功能。',
    category: 'product',
    isPrivate: false,
    createdAt: '2024-01-09T15:30:00Z',
    updatedAt: '2024-01-09T15:30:00Z'
  },
  {
    id: '8',
    title: '团队建设活动通知',
    content: '为增强团队凝聚力，公司计划本周末组织户外团建活动，欢迎全体员工积极参与。',
    category: 'other',
    isPrivate: false,
    createdAt: '2024-01-08T09:00:00Z',
    updatedAt: '2024-01-08T09:00:00Z'
  },
  {
    id: '9',
    title: 'Node.js 性能优化指南',
    content: '本文介绍 Node.js 应用性能优化的最佳实践，包括内存管理、异步处理、缓存策略等方面。',
    category: 'technology',
    isPrivate: false,
    createdAt: '2024-01-07T14:00:00Z',
    updatedAt: '2024-01-07T14:00:00Z'
  },
  {
    id: '10',
    title: '行业峰会邀请函',
    content: '诚邀您参加将于下月举办的行业峰会，届时将有多位行业专家分享前沿技术和趋势。',
    category: 'news',
    isPrivate: false,
    createdAt: '2024-01-06T11:00:00Z',
    updatedAt: '2024-01-06T11:00:00Z'
  },
  {
    id: '11',
    title: '移动端应用更新说明',
    content: '移动端应用已更新至 v2.0 版本，修复了多项已知问题，提升了应用稳定性和性能。',
    category: 'product',
    isPrivate: false,
    createdAt: '2024-01-05T16:30:00Z',
    updatedAt: '2024-01-05T16:30:00Z'
  },
  {
    id: '12',
    title: '员工培训计划',
    content: '公司将在本月开展新员工培训计划，涵盖产品知识、技术技能、企业文化等多个方面。',
    category: 'other',
    isPrivate: false,
    createdAt: '2024-01-04T10:00:00Z',
    updatedAt: '2024-01-04T10:00:00Z'
  }
]
