const pool = require('../config/db');

// Create the attendance_responses table
const createAttendanceTable = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS attendance_responses (
      id SERIAL PRIMARY KEY,
      for_date DATE NOT NULL,
      phone_number VARCHAR(15) NOT NULL,
      response VARCHAR(20) DEFAULT 'none',
      created_at TIMESTAMP DEFAULT NOW(),
      response_time TIMESTAMP DEFAULT NOW(),
      UNIQUE (for_date, phone_number)
    );
  `;
  await pool.query(query);
};

// Add a response (confirmed/rejected)
const addResponse = async (for_date, phone_number, response) => {
  // 1. Check if already responded
  const existing = await pool.query(
    `SELECT * FROM attendance_responses WHERE for_date = $1 AND phone_number = $2`,
    [for_date, phone_number]
  );

  if (existing.rows.length > 0) {
    throw new Error('User has already responded for this date');
  }

  // 2. Check remaining availability
  const avail = await pool.query(`SELECT remaining FROM availability WHERE date = $1`, [for_date]);
  if (!avail.rows.length) throw new Error('No availability data for this date');

  const remaining = avail.rows[0].remaining;

  if (response === 'confirmed' && remaining <= 0) {
    throw new Error('All available slots are already confirmed');
  }

  // 3. Insert attendance response
  await pool.query(
    `INSERT INTO attendance_responses (for_date, phone_number, response)
     VALUES ($1, $2, $3)`,
    [for_date, phone_number, response]
  );

  // 4. Update availability
  if (response === 'confirmed') {
    await pool.query(
      `UPDATE availability SET remaining = remaining - 1 WHERE date = $1`,
      [for_date]
    );
  }

  return { success: true };
};

module.exports = {
  createAttendanceTable,
  addResponse,
};
