const pool = require('../config/db');

// Create the availability table with remaining column
const createAvailabilityTable = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS availability (
      id SERIAL PRIMARY KEY,
      date DATE UNIQUE NOT NULL,
      required_members INTEGER NOT NULL,
      remaining INTEGER NOT NULL
    );
  `;
  await pool.query(query);
};

// Set availability for a date
const setAvailability = async (date, required_members) => {
  const query = `
    INSERT INTO availability (date, required_members, remaining)
    VALUES ($1, $2, $2)
    ON CONFLICT (date)
    DO UPDATE SET required_members = EXCLUDED.required_members,
                  remaining = EXCLUDED.required_members;
  `;
  await pool.query(query, [date, required_members]);
};

// Get availability for a date
const getAvailability = async (date) => {
  const result = await pool.query(`SELECT * FROM availability WHERE date = $1`, [date]);
  return result.rows[0];
};

module.exports = {
  createAvailabilityTable,
  setAvailability,
  getAvailability,
};
