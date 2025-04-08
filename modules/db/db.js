import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config({ path: './modules/db/.env' });

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '0000',
  database: 'sherlock',
  port: process.env.DB_PORT,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

export default pool;
