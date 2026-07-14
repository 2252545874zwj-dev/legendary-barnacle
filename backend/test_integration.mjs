import assert from 'assert';
import express from 'express';
import request from 'supertest';
import { pool, initDatabase } from './config/db.js';
import authRouter from './routes/auth.js';
import infoRouter from './routes/info.js';
import agentRouter from './routes/agent.js';

const app = express();
app.use(express.json());
app.use('/api/auth', authRouter);
app.use('/api/info', infoRouter);
app.use('/api/agent', agentRouter);

let testUserId = null;
let testToken = null;

describe('=== 集成测试套件 - 端到端业务流程测试 ===', function() {
  this.timeout(60000);

  before(async () => {
    await initDatabase();
  });

  after(async () => {
    if (testUserId) {
      await pool.execute('DELETE FROM info_items WHERE user_id = ?', [testUserId]);
      await pool.execute('DELETE FROM comments WHERE user_id = ?', [testUserId]);
      await pool.execute('DELETE FROM users WHERE username = ?', ['integration_test_user']);
    }
    await pool.end();
  });

  // ==================== 场景 1: 完整用户注册到发布内容流程 ====================
  describe('集成场景 1: 用户注册 -> 登录 -> 发布内容 -> 查看评论', () => {
    let itemId = null;

    it('[IT001] 步骤 1: 新用户注册', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'integration_test_user',
          password: 'IntegrationTest123',
          email: 'integration@test.com',
          name: '集成测试用户'
        });
      
      assert.strictEqual(res.status, 201);
      assert(res.body.token);
      assert(res.body.user);
      testUserId = res.body.user.id;
      testToken = res.body.token;
    });

    it('[IT002] 步骤 2: 使用凭证登录', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'integration_test_user',
          password: 'IntegrationTest123'
        });
      
      assert.strictEqual(res.status, 200);
      assert(res.body.token);
      assert.strictEqual(res.body.user.id, testUserId);
    });

    it('[IT003] 步骤 3: 发布第一篇公开文章', async () => {
      const res = await request(app)
        .post('/api/info')
        .send({
          title: '集成测试文章',
          content: '这是集成测试的内容，包含详细的技术说明。',
          category: 'technology',
          userId: testUserId,
          isPrivate: false
        });
      
      assert.strictEqual(res.status, 201);
      assert(res.body.id);
      itemId = res.body.id;
    });

    it('[IT004] 步骤 4: 查看刚发布的文章', async () => {
      const res = await request(app).get(`/api/info/${itemId}?userId=${testUserId}`);
      
      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.body.title, '集成测试文章');
      assert.strictEqual(res.body.userId, testUserId);
    });

    it('[IT005] 步骤 5: 为文章添加评论', async () => {
      const res = await request(app)
        .post(`/api/info/${itemId}/comments`)
        .send({
          content: '第一篇评论，测试集成流程',
          userId: testUserId,
          userName: '集成测试用户'
        });
      
      assert.strictEqual(res.status, 201);
      assert(res.body.id);
    });

    it('[IT006] 步骤 6: 查看评论列表', async () => {
      const res = await request(app).get(`/api/info/${itemId}/comments`);
      
      assert.strictEqual(res.status, 200);
      assert(Array.isArray(res.body));
      assert(res.body.length >= 1);
    });

    it('[IT007] 步骤 7: 搜索包含关键词的文章', async () => {
      const res = await request(app).get('/api/info/search?keyword=集成测试&privacy=public');
      
      assert.strictEqual(res.status, 200);
      assert(Array.isArray(res.body.items));
      // 搜索公开文章，应该能找到刚发布的
      assert(res.body.items.length > 0);
    });

    it('[IT008] 步骤 8: 更新文章内容', async () => {
      const res = await request(app)
        .put(`/api/info/${itemId}`)
        .send({
          title: '集成测试文章 - 已更新',
          content: '这是更新后的内容',
          category: 'technology',
          userId: testUserId,
          isPrivate: false
        });
      
      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.body.message, '信息更新成功');
    });

    it('[IT009] 步骤 9: 验证更新后的内容', async () => {
      const res = await request(app).get(`/api/info/${itemId}`);
      
      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.body.title, '集成测试文章 - 已更新');
      assert.strictEqual(res.body.content, '这是更新后的内容');
    });

    it('[IT010] 步骤 10: 删除文章', async () => {
      const res = await request(app)
        .delete(`/api/info/${itemId}?userId=${testUserId}`);
      
      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.body.message, '信息删除成功');
    });

    it('[IT011] 步骤 11: 验证文章已被删除', async () => {
      const res = await request(app).get(`/api/info/${itemId}`);
      
      assert.strictEqual(res.status, 404);
    });
  });

  // ==================== 场景 2: 智能助手完整交互流程 ====================
  describe('集成场景 2: 智能助手交互流程', () => {
    before(async () => {
      // 创建一些测试数据
      const createRes = await request(app)
        .post('/api/info')
        .send({
          title: 'Vue 3 入门指南',
          content: 'Vue 3 是一个渐进式 JavaScript 框架，用于构建用户界面。',
          category: 'technology',
          userId: testUserId,
          isPrivate: false
        });
      
      await request(app)
        .post('/api/info')
        .send({
          title: '公司新闻发布',
          content: '公司今天发布了新产品',
          category: 'news',
          userId: testUserId,
          isPrivate: false
        });
    });

    it('[IT012] 步骤 1: 问候智能助手', async () => {
      const res = await request(app)
        .post('/api/agent/ask')
        .send({
          userId: testUserId,
          question: '你好'
        });
      
      assert.strictEqual(res.status, 200);
      assert(res.body.success);
    });

    it('[IT013] 步骤 2: 询问论坛统计信息', async () => {
      const res = await request(app)
        .post('/api/agent/ask')
        .send({
          userId: testUserId,
          question: '论坛有多少帖子'
        });
      
      assert.strictEqual(res.status, 200);
      assert(res.body.success);
    });

    it('[IT014] 步骤 3: 搜索特定主题', async () => {
      const res = await request(app)
        .post('/api/agent/ask')
        .send({
          userId: testUserId,
          question: '搜索关于 Vue 的帖子'
        });
      
      assert.strictEqual(res.status, 200);
      assert(res.body.success);
    });

    it('[IT015] 步骤 4: 查看我的帖子', async () => {
      const res = await request(app)
        .post('/api/agent/ask')
        .send({
          userId: testUserId,
          question: '我发布了多少帖子'
        });
      
      assert.strictEqual(res.status, 200);
      assert(res.body.success);
    });

    it('[IT016] 步骤 5: 请求帮助', async () => {
      const res = await request(app)
        .post('/api/agent/ask')
        .send({
          userId: testUserId,
          question: '你能做什么'
        });
      
      assert.strictEqual(res.status, 200);
      assert(res.body.success);
    });

    it('[IT017] 步骤 6: 感谢智能助手', async () => {
      const res = await request(app)
        .post('/api/agent/ask')
        .send({
          userId: testUserId,
          question: '谢谢'
        });
      
      assert.strictEqual(res.status, 200);
      assert(res.body.success);
    });
  });

  // ==================== 场景 3: 多用户并发操作 ====================
  describe('集成场景 3: 多用户并发操作', () => {
    let user2Id = null;
    let user2Token = null;
    let sharedItemId = null;

    it('[IT018] 步骤 1: 创建第二个用户', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'integration_user2',
          password: 'User2Pass123',
          email: 'user2@test.com',
          name: '用户 2'
        });
      
      if (res.status === 201) {
        user2Id = res.body.user.id;
        user2Token = res.body.token;
      } else {
        // 如果用户已存在，尝试登录
        const loginRes = await request(app)
          .post('/api/auth/login')
          .send({
            username: 'integration_user2',
            password: 'User2Pass123'
          });
        
        user2Id = loginRes.body.user.id;
        user2Token = loginRes.body.token;
      }
    });

    it('[IT019] 步骤 2: 用户 1 发布文章', async () => {
      const res = await request(app)
        .post('/api/info')
        .send({
          title: '共享文章',
          content: '这是用户 1 发布的文章',
          category: 'technology',
          userId: testUserId,
          isPrivate: false
        });
      
      assert.strictEqual(res.status, 201);
      sharedItemId = res.body.id;
    });

    it('[IT020] 步骤 3: 用户 2 尝试修改用户 1 的文章（应失败）', async () => {
      const res = await request(app)
        .put(`/api/info/${sharedItemId}`)
        .send({
          title: '被篡改的标题',
          content: '被篡改的内容',
          category: 'technology',
          userId: user2Id,
          isPrivate: false
        });
      
      assert.strictEqual(res.status, 403);
      assert.strictEqual(res.body.message, '无权限修改此信息');
    });

    it('[IT021] 步骤 4: 用户 2 查看文章（应成功）', async () => {
      const res = await request(app).get(`/api/info/${sharedItemId}`);
      
      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.body.title, '共享文章');
    });

    it('[IT022] 步骤 5: 用户 2 评论用户 1 的文章', async () => {
      const res = await request(app)
        .post(`/api/info/${sharedItemId}/comments`)
        .send({
          content: '用户 2 的评论',
          userId: user2Id,
          userName: '用户 2'
        });
      
      assert.strictEqual(res.status, 201);
    });

    it('[IT023] 步骤 6: 用户 1 删除自己的文章', async () => {
      const res = await request(app)
        .delete(`/api/info/${sharedItemId}?userId=${testUserId}`);
      
      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.body.message, '信息删除成功');
    });
  });

  // ==================== 场景 4: 数据一致性和完整性 ====================
  describe('集成场景 4: 数据一致性和完整性', () => {
    it('[IT024] 步骤 1: 获取分类统计', async () => {
      const res = await request(app).get('/api/info/categories');
      
      assert.strictEqual(res.status, 200);
      assert(Array.isArray(res.body));
      assert(res.body.length > 0);
    });

    it('[IT025] 步骤 2: 分页查询所有文章', async () => {
      const res = await request(app)
        .get('/api/info/search?page=1&pageSize=5');
      
      assert.strictEqual(res.status, 200);
      assert(res.body.items);
      assert(res.body.total !== undefined);
      assert.strictEqual(res.body.page, 1);
      assert.strictEqual(res.body.pageSize, 5);
    });

    it('[IT026] 步骤 3: 获取用户文章列表', async () => {
      const res = await request(app).get(`/api/info/user/${testUserId}`);
      
      assert.strictEqual(res.status, 200);
      assert(res.body.items);
      assert(res.body.total !== undefined);
    });

    it('[IT027] 步骤 4: 智能助手获取系统概览', async () => {
      const res = await request(app)
        .post('/api/agent/ask')
        .send({
          userId: testUserId,
          question: '论坛总浏览量是多少'
        });
      
      assert.strictEqual(res.status, 200);
      assert(res.body.success);
    });
  });

  // ==================== 场景 5: 边界条件和异常处理 ====================
  describe('集成场景 5: 边界条件和异常处理', () => {
    it('[IT028] 步骤 1: 访问不存在的文章', async () => {
      const res = await request(app).get('/api/info/999999');
      
      assert.strictEqual(res.status, 404);
    });

    it('[IT029] 步骤 2: 使用无效 token 访问（如果有鉴权）', async () => {
      // 当前实现可能不需要 token
      const res = await request(app)
        .get('/api/info/search')
        .set('Authorization', 'Bearer invalid_token');
      
      // 应该返回 200 或 401，取决于实现
      assert([200, 401].includes(res.status));
    });

    it('[IT030] 步骤 3: 发送空问题给智能助手', async () => {
      const res = await request(app)
        .post('/api/agent/ask')
        .send({
          userId: testUserId,
          question: ''
        });
      
      assert.strictEqual(res.status, 400);
    });

    it('[IT031] 步骤 4: 发送缺少必填字段的注册请求', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'incomplete_user'
          // 缺少 password, email, name
        });
      
      assert.strictEqual(res.status, 400);
      assert.strictEqual(res.body.message, '所有字段都是必填项');
    });

    it('[IT032] 步骤 5: 发送缺少必填字段的创建文章请求', async () => {
      const res = await request(app)
        .post('/api/info')
        .send({
          title: '不完整的文章'
          // 缺少 content, category, userId
        });
      
      assert.strictEqual(res.status, 400);
      assert.strictEqual(res.body.message, '标题、内容、分类和用户 ID 都是必填项');
    });
  });
});
