const pool = require('../config/db');

// Confirm or Reject Attendance
const handleAttendanceResponse = async (req, res) => {
    const { date, response } = req.body;
    const phone = req.user.phone;
  
    if (!date || !response || !["confirmed", "rejected"].includes(response)) {
      return res.status(400).json({ message: "Invalid data" });
    }
  
    try {
      // Step 1: Check previous response (if any)
      const prevRes = await pool.query(
        `SELECT response FROM attendance_responses WHERE phone_number = $1 AND for_date = $2`,
        [phone, date]
      );
      const previous = prevRes.rows[0]?.response || null;
  
      // Step 2: If confirming now, check remaining first
      if (response === 'confirmed' && previous !== 'confirmed') {
        const remainingCheck = await pool.query(
          `SELECT remaining FROM availability WHERE date = $1`,
          [date]
        );
        if (!remainingCheck.rows.length) {
          return res.status(400).json({ message: "Availability not set for this date" });
        }
        const remaining = remainingCheck.rows[0].remaining;
        if (remaining <= 0) {
          return res.status(400).json({ message: "No slots remaining for confirmation" });
        }
      }
  
      // Step 3: Update attendance response (UPSERT)
      await pool.query(
        `INSERT INTO attendance_responses (phone_number, for_date, response)
         VALUES ($1, $2, $3)
         ON CONFLICT (phone_number, for_date)
         DO UPDATE SET response = $3, response_time = NOW()`,
        [phone, date, response]
      );
  
      // Step 4: Adjust availability
      if (previous === 'confirmed' && response === 'rejected') {
        // Increment if confirmed → rejected
        await pool.query(`UPDATE availability SET remaining = remaining + 1 WHERE date = $1`, [date]);
      } else if (previous !== 'confirmed' && response === 'confirmed') {
        // Decrement if rejected/none → confirmed
        await pool.query(`UPDATE availability SET remaining = remaining - 1 WHERE date = $1`, [date]);
      }
  
      res.json({ message: `Attendance ${response}` });
    } catch (err) {
      console.error("❌ Attendance update error:", err.message);
      res.status(500).json({ message: "Server error" });
    }
  };
  

// Fetch current user's attendance response
const getMyResponse = async (req, res) => {
    const phone = req.user.phone;
    const { date } = req.query;

    if (!date) {
        return res.status(400).json({ message: "Date required" });
    }

    try {
        const result = await pool.query(
            "SELECT response FROM attendance_responses WHERE phone_number = $1 AND for_date = $2",
            [phone, date]
        );

        if (result.rows.length === 0) {
            return res.json({ message: "No response yet" });
        }

        res.json({ response: result.rows[0].response });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: "Server error" });
    }
};

module.exports = { handleAttendanceResponse, getMyResponse };
