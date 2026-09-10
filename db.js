const mysql = require('mysql2/promise');
require('dotenv').config();

let pool = null;
let isConnected = false;

// Attempt connecting to MySQL Database
async function initDb() {
  try {
    pool = mysql.createPool({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'greengardens_db',
      port: Number(process.env.DB_PORT) || 3306,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      enableKeepAlive: true,
      keepAliveInitialDelay: 0
    });

    const connection = await pool.getConnection();
    await connection.ping();
    connection.release();
    isConnected = true;
    console.log('✅ [MySQL Database] Connected successfully to MySQL (greengardens_db).');
    return pool;
  } catch (err) {
    isConnected = false;
    console.warn(`⚠️ [MySQL Database] Warning: Could not connect to local MySQL (${err.code || err.message}).`);
    console.warn('ℹ️ Running in resilient fallback mode with embedded dataset until MySQL is activated.');
    return null;
  }
}

// Universal Query Helper
async function query(sql, params = []) {
  if (pool && isConnected) {
    try {
      const [results] = await pool.query(sql, params);
      return results;
    } catch (err) {
      console.error('MySQL Query Error:', err.message);
      throw err;
    }
  }
  return null;
}

module.exports = {
  initDb,
  query,
  getPool: () => pool,
  isDbConnected: () => isConnected
};
