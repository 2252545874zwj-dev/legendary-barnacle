import express from 'express';
import { pool } from '../config/db.js';
<<<<<<< HEAD
=======
<<<<<<< HEAD
>>>>>>> a648754d40cbc3e44cd03f0cf82527487e5b6465
import { io } from '../server.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.get('/search', authenticateToken, async (req, res) => {
  try {
    const { keyword = '', category = 'all', page = 1, pageSize = 10, userId = null, privacy = 'all' } = req.query;

<<<<<<< HEAD
=======
=======

const router = express.Router();

router.get('/search', async (req, res) => {
  try {
    const { keyword = '', category = 'all', page = 1, pageSize = 10, userId = null, privacy = 'all' } = req.query;

    // 安全校验：限制分页参数范围（防止 SQL 注入）
>>>>>>> ac58535bee06e561eeda876df089ccdadedcee65
>>>>>>> a648754d40cbc3e44cd03f0cf82527487e5b6465
    const pageNum = Math.max(1, parseInt(page) || 1);
    const sizeNum = Math.min(50, Math.max(1, parseInt(pageSize) || 10));
    const parsedUserId = userId ? parseInt(userId) : null;

    let query = 'SELECT * FROM info_items WHERE ';
    const params = [];

<<<<<<< HEAD
=======
<<<<<<< HEAD
>>>>>>> a648754d40cbc3e44cd03f0cf82527487e5b6465
    if (req.user.role === 'admin') {
      if (privacy === 'public') {
        query += 'is_private = 0';
      } else if (privacy === 'private') {
        query += 'is_private = 1';
      } else {
        query += '1 = 1';
      }
    } else if (privacy === 'public') {
<<<<<<< HEAD
=======
=======
    if (privacy === 'public') {
>>>>>>> ac58535bee06e561eeda876df089ccdadedcee65
>>>>>>> a648754d40cbc3e44cd03f0cf82527487e5b6465
      query += 'is_private = 0';
    } else if (privacy === 'private') {
      if (parsedUserId && parsedUserId > 0) {
        query += 'is_private = 1 AND user_id = ?';
        params.push(parsedUserId);
      } else {
        query += '1 = 0';
      }
    } else {
      query += '(is_private = 0';
      if (parsedUserId && parsedUserId > 0) {
        query += ' OR user_id = ?)';
        params.push(parsedUserId);
      } else {
        query += ')';
      }
    }

    if (keyword && keyword.trim()) {
      query += ' AND (title LIKE ? OR content LIKE ?)';
      params.push(`%${keyword}%`, `%${keyword}%`);
    }

    if (category !== 'all') {
      query += ' AND category = ?';
      params.push(category);
    }

    const countParams = [...params];
    const countQuery = query;

    // 注意：MySQL 的 LIMIT/OFFSET 不能使用参数化查询
    // 由于已经做了严格的数字校验，可以安全地使用字符串拼接
    query += ` ORDER BY created_at DESC LIMIT ${sizeNum} OFFSET ${(pageNum - 1) * sizeNum}`;

    console.log('Search query:', query);
    console.log('Search params:', params);

    const [rows] = await pool.execute(query, params);

    console.log('Count query:', countQuery);
    console.log('Count params:', countParams);

    const [countRows] = await pool.execute('SELECT COUNT(*) as total FROM info_items WHERE ' + countQuery.substring(countQuery.indexOf('WHERE') + 6), countParams);

    // 将数据库字段转换为驼峰命名
    const formattedItems = rows.map(row => ({
      id: row.id.toString(),
      title: row.title,
      content: row.content,
      category: row.category,
      userId: row.user_id,
      isPrivate: row.is_private === 1,
      viewCount: row.view_count,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    }));

    res.json({
      items: formattedItems,
      total: countRows[0].total,
      page: pageNum,
      pageSize: sizeNum
    });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ message: '服务器内部错误' });
  }
});

router.get('/categories', async (req, res) => {
  try {
    const [rows] = await pool.execute(
      'SELECT category, COUNT(*) as count FROM info_items WHERE is_private = 0 GROUP BY category'
    );

    const categories = rows.map((row) => ({
      id: row.category,
      name: row.category === 'technology' ? '技术' : row.category === 'news' ? '新闻' : row.category === 'product' ? '产品' : '其他',
      count: row.count
    }));

    res.json(categories);
  } catch (error) {
    console.error('Categories error:', error);
    res.status(500).json({ message: '服务器内部错误' });
  }
});

router.get('/:id/comments', async (req, res) => {
  try {
    const [comments] = await pool.execute(
      'SELECT * FROM comments WHERE info_id = ? ORDER BY created_at DESC',
      [req.params.id]
    );

    const formattedComments = comments.map(comment => ({
      id: comment.id,
      infoId: comment.info_id,
      userId: comment.user_id,
      userName: comment.user_name,
      content: comment.content,
      createdAt: comment.created_at,
      updatedAt: comment.updated_at
    }));

    res.json(formattedComments);
  } catch (error) {
    console.error('Get comments error:', error);
    res.status(500).json({ message: '服务器内部错误' });
  }
});

<<<<<<< HEAD
router.get('/:id', authenticateToken, async (req, res) => {
=======
<<<<<<< HEAD
router.get('/:id', authenticateToken, async (req, res) => {
=======
router.get('/:id', async (req, res) => {
>>>>>>> ac58535bee06e561eeda876df089ccdadedcee65
>>>>>>> a648754d40cbc3e44cd03f0cf82527487e5b6465
  try {
    const { userId } = req.query;
    const parsedUserId = userId ? parseInt(userId) : null;

<<<<<<< HEAD
=======
<<<<<<< HEAD
>>>>>>> a648754d40cbc3e44cd03f0cf82527487e5b6465
    let query = 'SELECT * FROM info_items WHERE id = ?';
    const params = [req.params.id];

    if (req.user.role === 'admin') {
      query += ' AND 1 = 1';
    } else {
      query += ' AND (is_private = 0 OR user_id = ?)';
      params.push(parsedUserId || null);
    }

    const [items] = await pool.execute(query, params);
<<<<<<< HEAD
=======
=======
    const [items] = await pool.execute(
      'SELECT * FROM info_items WHERE id = ? AND (is_private = 0 OR user_id = ?)',
      [req.params.id, parsedUserId || null]
    );
>>>>>>> ac58535bee06e561eeda876df089ccdadedcee65
>>>>>>> a648754d40cbc3e44cd03f0cf82527487e5b6465

    if (items.length === 0) {
      return res.status(404).json({ message: '信息不存在或无权限访问' });
    }

    await pool.execute(
      'UPDATE info_items SET view_count = view_count + 1 WHERE id = ?',
      [req.params.id]
    );

    const item = items[0];
    const formattedItem = {
      id: item.id.toString(),
      title: item.title,
      content: item.content,
      category: item.category,
      userId: item.user_id,
      isPrivate: item.is_private === 1,
      viewCount: item.view_count + 1,
      createdAt: item.created_at,
      updatedAt: item.updated_at,
      view_count: item.view_count + 1
    };

    res.json(formattedItem);
  } catch (error) {
    console.error('Get info error:', error);
    res.status(500).json({ message: '服务器内部错误' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { title, content, category, userId, isPrivate } = req.body;

    if (!title || !content || !category || !userId) {
      return res.status(400).json({ message: '标题、内容、分类和用户 ID 都是必填项' });
    }

    const [result] = await pool.execute(
      'INSERT INTO info_items (title, content, category, user_id, is_private) VALUES (?, ?, ?, ?, ?)',
      [title, content, category, userId, isPrivate ? 1 : 0]
    );

    res.status(201).json({
      message: '信息添加成功',
      id: result.insertId
    });
<<<<<<< HEAD
=======
<<<<<<< HEAD
>>>>>>> a648754d40cbc3e44cd03f0cf82527487e5b6465

    io.emit('infoCreated', {
      id: result.insertId,
      title,
      content,
      category,
      userId,
      isPrivate: isPrivate ? 1 : 0
    });
<<<<<<< HEAD
=======
=======
>>>>>>> ac58535bee06e561eeda876df089ccdadedcee65
>>>>>>> a648754d40cbc3e44cd03f0cf82527487e5b6465
  } catch (error) {
    console.error('Add info error:', error);
    res.status(500).json({ message: '服务器内部错误' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { title, content, category, userId, isPrivate } = req.body;

    const [items] = await pool.execute(
      'SELECT * FROM info_items WHERE id = ? AND user_id = ?',
      [req.params.id, userId]
    );

    if (items.length === 0) {
      return res.status(403).json({ message: '无权限修改此信息' });
    }

    await pool.execute(
      'UPDATE info_items SET title = ?, content = ?, category = ?, is_private = ? WHERE id = ?',
      [title, content, category, isPrivate ? 1 : 0, req.params.id]
    );

    res.json({ message: '信息更新成功' });
<<<<<<< HEAD
=======
<<<<<<< HEAD
>>>>>>> a648754d40cbc3e44cd03f0cf82527487e5b6465

    io.emit('infoUpdated', {
      id: parseInt(req.params.id),
      title,
      content,
      category,
      isPrivate: isPrivate ? 1 : 0
    });
<<<<<<< HEAD
=======
=======
>>>>>>> ac58535bee06e561eeda876df089ccdadedcee65
>>>>>>> a648754d40cbc3e44cd03f0cf82527487e5b6465
  } catch (error) {
    console.error('Update info error:', error);
    res.status(500).json({ message: '服务器内部错误' });
  }
});

<<<<<<< HEAD
router.delete('/:id', authenticateToken, async (req, res) => {
=======
<<<<<<< HEAD
router.delete('/:id', authenticateToken, async (req, res) => {
=======
router.delete('/:id', async (req, res) => {
>>>>>>> ac58535bee06e561eeda876df089ccdadedcee65
>>>>>>> a648754d40cbc3e44cd03f0cf82527487e5b6465
  try {
    const { userId } = req.query;
    const parsedUserId = userId ? parseInt(userId) : null;

    if (!parsedUserId) {
      return res.status(400).json({ message: '用户 ID 是必填项' });
    }

    const [items] = await pool.execute(
<<<<<<< HEAD
=======
<<<<<<< HEAD
>>>>>>> a648754d40cbc3e44cd03f0cf82527487e5b6465
      'SELECT * FROM info_items WHERE id = ?',
      [req.params.id]
    );

    if (items.length === 0) {
      return res.status(404).json({ message: '信息不存在' });
    }

    const item = items[0];
    if (req.user.role !== 'admin' && item.user_id !== parsedUserId) {
<<<<<<< HEAD
=======
=======
      'SELECT * FROM info_items WHERE id = ? AND user_id = ?',
      [req.params.id, parsedUserId]
    );

    if (items.length === 0) {
>>>>>>> ac58535bee06e561eeda876df089ccdadedcee65
>>>>>>> a648754d40cbc3e44cd03f0cf82527487e5b6465
      return res.status(403).json({ message: '无权限删除此信息' });
    }

    await pool.execute('DELETE FROM comments WHERE info_id = ?', [req.params.id]);
    await pool.execute('DELETE FROM info_items WHERE id = ?', [req.params.id]);

    res.json({ message: '信息删除成功' });
<<<<<<< HEAD
=======
<<<<<<< HEAD
>>>>>>> a648754d40cbc3e44cd03f0cf82527487e5b6465

    io.emit('infoDeleted', {
      id: parseInt(req.params.id)
    });
<<<<<<< HEAD
=======
=======
>>>>>>> ac58535bee06e561eeda876df089ccdadedcee65
>>>>>>> a648754d40cbc3e44cd03f0cf82527487e5b6465
  } catch (error) {
    console.error('Delete info error:', error);
    res.status(500).json({ message: '服务器内部错误' });
  }
});

router.post('/:id/comments', async (req, res) => {
  try {
    const { content, userId, userName } = req.body;

    if (!content || !userName) {
      return res.status(400).json({ message: '留言内容和用户名是必填项' });
    }

    const [result] = await pool.execute(
      'INSERT INTO comments (info_id, user_id, user_name, content) VALUES (?, ?, ?, ?)',
      [req.params.id, userId || null, userName, content]
    );

    res.status(201).json({
      message: '留言成功',
      id: result.insertId
    });
<<<<<<< HEAD
=======
<<<<<<< HEAD
>>>>>>> a648754d40cbc3e44cd03f0cf82527487e5b6465

    io.emit('commentAdded', {
      id: result.insertId,
      infoId: parseInt(req.params.id),
      userId,
      userName,
      content
    });
<<<<<<< HEAD
=======
=======
>>>>>>> ac58535bee06e561eeda876df089ccdadedcee65
>>>>>>> a648754d40cbc3e44cd03f0cf82527487e5b6465
  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({ message: '服务器内部错误' });
  }
});

router.delete('/comments/:id', async (req, res) => {
  try {
    const { userId } = req.query;
    const parsedUserId = userId ? parseInt(userId) : null;

    if (!parsedUserId) {
      return res.status(400).json({ message: '用户 ID 是必填项' });
    }

    const [comments] = await pool.execute(
      'SELECT * FROM comments WHERE id = ? AND user_id = ?',
      [req.params.id, parsedUserId]
    );

    if (comments.length === 0) {
      return res.status(403).json({ message: '无权限删除此留言' });
    }

    await pool.execute('DELETE FROM comments WHERE id = ?', [req.params.id]);

    res.json({ message: '留言删除成功' });
<<<<<<< HEAD
=======
<<<<<<< HEAD
>>>>>>> a648754d40cbc3e44cd03f0cf82527487e5b6465

    io.emit('commentDeleted', {
      id: parseInt(req.params.id)
    });
<<<<<<< HEAD
=======
=======
>>>>>>> ac58535bee06e561eeda876df089ccdadedcee65
>>>>>>> a648754d40cbc3e44cd03f0cf82527487e5b6465
  } catch (error) {
    console.error('Delete comment error:', error);
    res.status(500).json({ message: '服务器内部错误' });
  }
});

router.get('/user/:userId', async (req, res) => {
  try {
    const { page = 1, pageSize = 10 } = req.query;
    
    // 安全校验：限制分页参数范围（防止 SQL 注入）
    const pageNum = Math.max(1, parseInt(page) || 1);
    const sizeNum = Math.min(50, Math.max(1, parseInt(pageSize) || 10));
    const userId = parseInt(req.params.userId);

    if (isNaN(userId) || userId <= 0) {
      return res.status(400).json({ message: '无效的用户 ID' });
    }

    // 注意：MySQL 的 LIMIT/OFFSET 不能使用参数化查询
    // 由于已经做了严格的数字校验，可以安全地使用字符串拼接
    const [rows] = await pool.execute(
      `SELECT * FROM info_items WHERE user_id = ? ORDER BY created_at DESC LIMIT ${sizeNum} OFFSET ${(pageNum - 1) * sizeNum}`,
      [userId]
    );

    const [countRows] = await pool.execute(
      'SELECT COUNT(*) as total FROM info_items WHERE user_id = ?',
      [userId]
    );

    const formattedItems = rows.map(row => ({
      id: row.id.toString(),
      title: row.title,
      content: row.content,
      category: row.category,
      userId: row.user_id,
      isPrivate: row.is_private === 1,
      viewCount: row.view_count,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    }));

    res.json({
      items: formattedItems,
      total: countRows[0].total,
      page: pageNum,
      pageSize: sizeNum
    });
  } catch (error) {
    console.error('Get user info error:', error);
    res.status(500).json({ message: '服务器内部错误' });
  }
});

export default router;
