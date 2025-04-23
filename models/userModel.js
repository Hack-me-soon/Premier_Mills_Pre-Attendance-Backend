const pool = require('../config/db');

// Create user table if not exists (run once or use migrations in future)
const createUserTable = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      name VARCHAR(100),
      phone VARCHAR(20) UNIQUE NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;
  await pool.query(query);
};

createUserTable();

const addUser = async (name, phone) => {
  const res = await pool.query(
    'INSERT INTO users (name, phone) VALUES ($1, $2) RETURNING *',
    [name, phone]
  );
  return res.rows[0];
};

const findUserByPhone = async (phone) => {
  const res = await pool.query(
    'SELECT * FROM users WHERE phone = $1',
    [phone]
  );
  return res.rows[0];
};

module.exports = {
  addUser,
  findUserByPhone,
};
