const path = require('path');
const fs = require('fs');
require('dotenv').config();

let dbInstance = null;
let dbType = process.env.DB_TYPE || 'sqlite';

if (dbType === 'mysql') {
  try {
    const mysql = require('mysql2/promise');
    dbInstance = mysql.createPool({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'our_little_world',
      port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 3306,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    });
    console.log('🔗 Configured MySQL connection pool.');
  } catch (err) {
    console.warn('⚠️ MySQL configuration failed. Falling back to SQLite mode.', err.message);
    dbType = 'sqlite';
  }
}

if (dbType === 'sqlite') {
  const Database = require('better-sqlite3');
  const dbPath = path.join(__dirname, 'our_little_world.sqlite');
  dbInstance = new Database(dbPath);
  dbInstance.pragma('foreign_keys = ON');
  console.log(`📁 Connected to SQLite database at ${dbPath}`);
}

/**
 * Unified database query helper
 * @param {string} sql - SQL query string with ? placeholders
 * @param {Array} params - Query parameters array
 */
async function query(sql, params = []) {
  if (dbType === 'mysql') {
    const [rows, fields] = await dbInstance.execute(sql, params);
    // Standardize result structure for INSERT
    if (rows && typeof rows.insertId !== 'undefined') {
      return { insertId: rows.insertId, affectedRows: rows.affectedRows, rows: [] };
    }
    return Array.isArray(rows) ? rows : [rows];
  } else {
    // SQLite handling
    const trimmed = sql.trim().toUpperCase();
    if (trimmed.startsWith('SELECT') || trimmed.startsWith('PRAGMA') || trimmed.startsWith('WITH')) {
      const stmt = dbInstance.prepare(sql);
      return stmt.all(...params);
    } else {
      const stmt = dbInstance.prepare(sql);
      const info = stmt.run(...params);
      return { insertId: info.lastInsertRowid, affectedRows: info.changes };
    }
  }
}

function getDbType() {
  return dbType;
}

module.exports = {
  query,
  getDbType
};
