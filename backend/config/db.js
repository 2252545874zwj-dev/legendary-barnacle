import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';
<<<<<<< HEAD
=======
<<<<<<< HEAD
>>>>>>> a648754d40cbc3e44cd03f0cf82527487e5b6465
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const envPath = path.join(__dirname, '../.env');
<<<<<<< HEAD
=======
=======

const envPath = path.join(path.dirname(new URL(import.meta.url).pathname).replace(/^\/([A-Za-z]:)/, '$1'), '../../.env');
>>>>>>> ac58535bee06e561eeda876df089ccdadedcee65
>>>>>>> a648754d40cbc3e44cd03f0cf82527487e5b6465
console.log('Trying to load .env from:', envPath);
dotenv.config({ path: envPath });

console.log('DB_HOST:', process.env.DB_HOST);
console.log('DB_USER:', process.env.DB_USER);
console.log('DB_PASSWORD:', process.env.DB_PASSWORD ? '***' : 'not set');

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'info_system',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

const initDatabase = async () => {
  try {
    const dbPassword = process.env.DB_PASSWORD || '';
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '3306'),
      user: process.env.DB_USER || 'root',
      password: dbPassword
    });

    await connection.execute(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME || 'info_system'}`);
    await connection.end();

    await pool.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(50) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        email VARCHAR(100) NOT NULL UNIQUE,
        name VARCHAR(100) NOT NULL,
<<<<<<< HEAD
        role VARCHAR(20) DEFAULT 'user',
=======
<<<<<<< HEAD
        role VARCHAR(20) DEFAULT 'user',
=======
>>>>>>> ac58535bee06e561eeda876df089ccdadedcee65
>>>>>>> a648754d40cbc3e44cd03f0cf82527487e5b6465
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

<<<<<<< HEAD
=======
<<<<<<< HEAD
>>>>>>> a648754d40cbc3e44cd03f0cf82527487e5b6465
    const [userColumns] = await pool.execute(`DESCRIBE users`);
    const userColumnNames = userColumns.map(col => col.Field);

    if (!userColumnNames.includes('role')) {
      await pool.execute(`ALTER TABLE users ADD COLUMN role VARCHAR(20) DEFAULT 'user' AFTER name`);
    }

<<<<<<< HEAD
=======
=======
>>>>>>> ac58535bee06e561eeda876df089ccdadedcee65
>>>>>>> a648754d40cbc3e44cd03f0cf82527487e5b6465
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS info_items (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        category VARCHAR(50) NOT NULL,
        user_id INT NULL,
        is_private TINYINT(1) DEFAULT 0,
        view_count INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    const [columns] = await pool.execute(`DESCRIBE info_items`);
    const columnNames = columns.map(col => col.Field);

    if (!columnNames.includes('user_id')) {
      await pool.execute(`ALTER TABLE info_items ADD COLUMN user_id INT NULL AFTER category`);
    }

    if (!columnNames.includes('is_private')) {
      await pool.execute(`ALTER TABLE info_items ADD COLUMN is_private TINYINT(1) DEFAULT 0 AFTER user_id`);
    }

    if (!columnNames.includes('view_count')) {
      await pool.execute(`ALTER TABLE info_items ADD COLUMN view_count INT DEFAULT 0 AFTER is_private`);
    }

    await pool.execute(`
      CREATE TABLE IF NOT EXISTS comments (
        id INT AUTO_INCREMENT PRIMARY KEY,
        info_id INT NOT NULL,
        user_id INT NULL,
        user_name VARCHAR(100) NOT NULL,
        content TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (info_id) REFERENCES info_items(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    await pool.execute(`
      CREATE TABLE IF NOT EXISTS agent_interactions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NULL,
        question TEXT NOT NULL,
        answer TEXT,
        context TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    const [countResult] = await pool.execute('SELECT COUNT(*) as count FROM info_items');
    if (countResult[0].count === 0) {
      const infoItems = [
        { title: 'Vue 3 组合式 API 入门指南', content: 'Vue 3 引入了组合式 API，提供了更灵活的代码组织方式。', category: 'technology', is_private: 0 },
        { title: 'TypeScript 高级类型技巧', content: '深入了解 TypeScript 的高级类型特性，包括泛型、条件类型等。', category: 'technology', is_private: 0 },
        { title: '公司年度产品发布会', content: '公司将于下月举办年度产品发布会，敬请期待！', category: 'news', is_private: 0 },
        { title: 'AI 智能助手功能升级', content: 'AI智能助手已完成重大升级，新增语音识别等功能。', category: 'product', is_private: 0 },
        { title: 'React 18 新特性详解', content: 'React 18带来了并发渲染、自动批处理等新特性。', category: 'technology', is_private: 0 },
        { title: '云计算市场趋势分析', content: '2024年云计算市场持续增长，各大厂商纷纷加大投入。', category: 'news', is_private: 0 },
        { title: '企业级安全解决方案', content: '针对企业客户，推出全方位的安全解决方案。', category: 'product', is_private: 0 },
        { title: '团队建设活动通知', content: '公司计划本周末组织户外团建活动。', category: 'other', is_private: 0 },
        { title: 'Node.js 性能优化指南', content: 'Node.js应用性能优化的最佳实践。', category: 'technology', is_private: 0 },
        { title: '行业峰会邀请函', content: '诚邀参加下月举办的行业峰会。', category: 'news', is_private: 0 },
        { title: '移动端应用更新说明', content: '移动端应用已更新至v2.0版本。', category: 'product', is_private: 0 },
        { title: '员工培训计划', content: '公司将开展新员工培训计划。', category: 'other', is_private: 0 }
      ];

      for (const item of infoItems) {
        await pool.execute(
          'INSERT INTO info_items (title, content, category, is_private) VALUES (?, ?, ?, ?)',
          [item.title, item.content, item.category, item.is_private]
        );
      }
    }

<<<<<<< HEAD
=======
<<<<<<< HEAD
>>>>>>> a648754d40cbc3e44cd03f0cf82527487e5b6465
    const [adminResult] = await pool.execute('SELECT COUNT(*) as count FROM users WHERE username = ?', ['admin']);
    if (adminResult[0].count === 0) {
      const adminPassword = await bcrypt.hash('admin123', 10);
      await pool.execute(
        'INSERT INTO users (username, password, email, name, role) VALUES (?, ?, ?, ?, ?)',
        ['admin', adminPassword, 'admin@example.com', '管理员', 'admin']
      );
      console.log('Default admin account created: username=admin, password=admin123');
    }

<<<<<<< HEAD
=======
=======
>>>>>>> ac58535bee06e561eeda876df089ccdadedcee65
>>>>>>> a648754d40cbc3e44cd03f0cf82527487e5b6465
    console.log('Database and tables initialized successfully');
  } catch (error) {
    console.error('Database initialization failed:', error);
    process.exit(1);
  }
};

<<<<<<< HEAD
const DB_RETRY_COUNT = 3;
const DB_RETRY_DELAY = 1000;

async function executeWithRetry(sql, params = []) {
  let lastError = null;
  
  for (let attempt = 1; attempt <= DB_RETRY_COUNT; attempt++) {
    try {
      const [result] = await pool.execute(sql, params);
      return [result];
    } catch (error) {
      lastError = error;
      console.error(`Database query failed (attempt ${attempt}/${DB_RETRY_COUNT}):`, error.message);
      
      if (error.code === 'ER_ACCESS_DENIED_ERROR' || 
          error.code === 'ER_BAD_DB_ERROR' ||
          error.code === 'PROTOCOL_CONNECTION_LOST') {
        console.error('Database connection error, cannot retry:', error.code);
        throw error;
      }
      
      if (attempt < DB_RETRY_COUNT) {
        const delay = DB_RETRY_DELAY * attempt;
        console.log(`Retrying database query in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  throw lastError;
}

async function checkDatabaseConnection() {
  try {
    await pool.getConnection();
    return true;
  } catch (error) {
    console.error('Database connection check failed:', error.message);
    return false;
  }
}

export { pool, initDatabase, executeWithRetry, checkDatabaseConnection };
=======
export { pool, initDatabase };
>>>>>>> a648754d40cbc3e44cd03f0cf82527487e5b6465
