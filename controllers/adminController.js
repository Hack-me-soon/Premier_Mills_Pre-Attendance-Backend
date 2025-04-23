const { setAvailability } = require('../models/availabilityModel');

const uploadAvailability = async (req, res) => {
  const { date, required_members } = req.body;

  if (!date || !required_members) {
    return res.status(400).json({ message: 'Date and required_members are required' });
  }

  try {
    await setAvailability(date, required_members);
    res.json({ message: 'Availability uploaded/updated successfully' });
  } catch (error) {
    console.error('Error uploading availability:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { uploadAvailability };
