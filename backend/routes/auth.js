import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { pool } from '../config/db.js';
<<<<<<< HEAD
import { authenticateToken } from '../middleware/auth.js';
=======
<<<<<<< HEAD
import { authenticateToken } from '../middleware/auth.js';
=======
>>>>>>> ac58535bee06e561eeda876df089ccdadedcee65
>>>>>>> a648754d40cbc3e44cd03f0cf82527487e5b6465

const router = express.Router();

router.post('/register', async (req, res) => {
  try {
    const { username, password, email, name } = req.body;

    if (!username || !password || !email || !name) {
      return res.status(400).json({ message: '所有字段都是必填项' });
    }

    // 密码强度校验：至少6个字符
    if (password.length < 6) {
      return res.status(400).json({ message: '密码长度至少为6位' });
    }

    // 邮箱格式校验
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: '邮箱格式不正确' });
    }

    // 用户名长度校验
    if (username.length < 3 || username.length > 20) {
      return res.status(400).json({ message: '用户名长度应在3-20个字符之间' });
    }

    const [existingUser] = await pool.execute(
      'SELECT * FROM users WHERE username = ? OR email = ?',
      [username, email]
    );

    if (existingUser.length > 0) {
      return res.status(400).json({ message: '用户名或邮箱已存在' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const [result] = await pool.execute(
<<<<<<< HEAD
=======
<<<<<<< HEAD
>>>>>>> a648754d40cbc3e44cd03f0cf82527487e5b6465
      'INSERT INTO users (username, password, email, name, role) VALUES (?, ?, ?, ?, ?)',
      [username, hashedPassword, email, name, 'user']
    );

    const token = jwt.sign(
      { userId: result.insertId, username, role: 'user' },
<<<<<<< HEAD
=======
=======
      'INSERT INTO users (username, password, email, name) VALUES (?, ?, ?, ?)',
      [username, hashedPassword, email, name]
    );

    const token = jwt.sign(
      { userId: result.insertId, username },
>>>>>>> ac58535bee06e561eeda876df089ccdadedcee65
>>>>>>> a648754d40cbc3e44cd03f0cf82527487e5b6465
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    res.status(201).json({
      message: '注册成功',
      token,
      user: {
        id: result.insertId,
        username,
        email,
<<<<<<< HEAD
        name,
        role: 'user'
=======
<<<<<<< HEAD
        name,
        role: 'user'
=======
        name
>>>>>>> ac58535bee06e561eeda876df089ccdadedcee65
>>>>>>> a648754d40cbc3e44cd03f0cf82527487e5b6465
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: '服务器内部错误' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: '用户名和密码都是必填项' });
    }

    const [users] = await pool.execute(
      'SELECT * FROM users WHERE username = ?',
      [username]
    );

    if (users.length === 0) {
      return res.status(401).json({ message: '用户名或密码错误' });
    }

    const user = users[0];
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ message: '用户名或密码错误' });
    }

    const token = jwt.sign(
<<<<<<< HEAD
      { userId: user.id, username: user.username, role: user.role },
=======
<<<<<<< HEAD
      { userId: user.id, username: user.username, role: user.role },
=======
      { userId: user.id, username: user.username },
>>>>>>> ac58535bee06e561eeda876df089ccdadedcee65
>>>>>>> a648754d40cbc3e44cd03f0cf82527487e5b6465
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    res.json({
      message: '登录成功',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
<<<<<<< HEAD
        name: user.name,
        role: user.role
=======
<<<<<<< HEAD
        name: user.name,
        role: user.role
=======
        name: user.name
>>>>>>> ac58535bee06e561eeda876df089ccdadedcee65
>>>>>>> a648754d40cbc3e44cd03f0cf82527487e5b6465
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: '服务器内部错误' });
  }
});

<<<<<<< HEAD
=======
<<<<<<< HEAD
>>>>>>> a648754d40cbc3e44cd03f0cf82527487e5b6465
router.put('/profile', authenticateToken, async (req, res) => {
  try {
    const { email, name, password } = req.body;
    const userId = req.user.id;

    const updateFields = [];
    const params = [];

    if (email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ message: '邮箱格式不正确' });
      }

      const [existingUser] = await pool.execute(
        'SELECT * FROM users WHERE email = ? AND id != ?',
        [email, userId]
      );

      if (existingUser.length > 0) {
        return res.status(400).json({ message: '邮箱已被使用' });
      }

      updateFields.push('email = ?');
      params.push(email);
    }

    if (name) {
      updateFields.push('name = ?');
      params.push(name);
    }

    if (password) {
      if (password.length < 6) {
        return res.status(400).json({ message: '密码长度至少为6位' });
      }
      const hashedPassword = await bcrypt.hash(password, 10);
      updateFields.push('password = ?');
      params.push(hashedPassword);
    }

    if (updateFields.length === 0) {
      return res.status(400).json({ message: '至少需要更新一个字段' });
    }

    params.push(userId);

    await pool.execute(
      `UPDATE users SET ${updateFields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      params
    );

    const [users] = await pool.execute(
      'SELECT id, username, email, name, role FROM users WHERE id = ?',
      [userId]
    );

    const user = users[0];
    const newToken = jwt.sign(
      { userId: user.id, username: user.username, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    res.json({
      message: '信息更新成功',
      token: newToken,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        name: user.name,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: '服务器内部错误' });
  }
});

<<<<<<< HEAD
=======
=======
>>>>>>> ac58535bee06e561eeda876df089ccdadedcee65
>>>>>>> a648754d40cbc3e44cd03f0cf82527487e5b6465
export default router;
