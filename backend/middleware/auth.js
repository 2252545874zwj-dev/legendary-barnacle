import jwt from 'jsonwebtoken';
import { pool } from '../config/db.js';

const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: '未授权' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const [users] = await pool.execute('SELECT id, username, role FROM users WHERE id = ?', [decoded.userId]);
    
    if (users.length === 0) {
      return res.status(401).json({ message: '用户不存在' });
    }

    req.user = {
      id: users[0].id,
      username: users[0].username,
      role: users[0].role
    };
    next();
  } catch (error) {
    return res.status(403).json({ message: 'Token无效' });
  }
};

const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ message: '需要管理员权限' });
  }
  next();
};

export { authenticateToken, requireAdmin };