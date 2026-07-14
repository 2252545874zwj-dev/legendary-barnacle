import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const envPath = path.join(__dirname, '../.env');
dotenv.config({ path: envPath });

const main = async () => {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME
    });

    console.log('==========================================');
    console.log('数据库连接成功！');
    console.log(`数据库: ${process.env.DB_NAME}`);
    console.log('==========================================\n');

    const [tables] = await connection.execute(
      "SHOW TABLES"
    );
    
    console.log('表列表:');
    const tableNames = tables.map(row => Object.values(row)[0]);
    tableNames.forEach((table, index) => {
      console.log(`  ${index + 1}. ${table}`);
    });
    console.log('');

    for (const tableName of tableNames) {
      console.log(`\n【${tableName} 表结构】`);
      const [columns] = await connection.execute(`DESCRIBE ${tableName}`);
      console.table(columns);

      console.log(`\n【${tableName} 数据】`);
      const [rows] = await connection.execute(`SELECT * FROM ${tableName} LIMIT 10`);
      if (rows.length > 0) {
        console.table(rows);
      } else {
        console.log('  (空表)');
      }
      console.log('');
    }

    await connection.end();
    console.log('==========================================');
    console.log('查询完成！');
    console.log('==========================================');
  } catch (error) {
    console.error('数据库连接失败:', error);
    process.exit(1);
  }
};

main();