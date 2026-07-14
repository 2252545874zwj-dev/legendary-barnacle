import express from 'express';
import { pool } from '../config/db.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticateToken);
router.use(requireAdmin);

router.get('/users', async (req, res) => {
  try {
    const [users] = await pool.execute(
      'SELECT id, username, email, name, role, created_at FROM users ORDER BY created_at DESC'
    );
    res.json(users);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: '服务器内部错误' });
  }
});

router.get('/users/:userId/posts', async (req, res) => {
  try {
    const { userId } = req.params;
    const [posts] = await pool.execute(
      'SELECT * FROM info_items WHERE user_id = ? ORDER BY created_at DESC',
      [userId]
    );
    
    const formattedPosts = posts.map(row => ({
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
    
    res.send(formattedPosts);
  } catch (error) {
    console.error('Get user posts error:', error);
    res.status(500).json({ message: '服务器内部错误' });
  }
});

router.delete('/users/:userId/posts/:postId', async (req, res) => {
  try {
    const { postId } = req.params;
    await pool.execute('DELETE FROM comments WHERE info_id = ?', [postId]);
    await pool.execute('DELETE FROM info_items WHERE id = ?', [postId]);
    res.json({ message: '帖子删除成功' });
  } catch (error) {
    console.error('Delete post error:', error);
    res.status(500).json({ message: '服务器内部错误' });
  }
});

router.put('/users/:userId/role', async (req, res) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;

    if (role !== 'user' && role !== 'admin') {
      return res.status(400).json({ message: '无效的角色类型' });
    }

    await pool.execute('UPDATE users SET role = ? WHERE id = ?', [role, userId]);
    res.json({ message: '角色更新成功' });
  } catch (error) {
    console.error('Update user role error:', error);
    res.status(500).json({ message: '服务器内部错误' });
  }
});

export default router;