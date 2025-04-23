const express = require('express');
const { uploadAvailability } = require('../controllers/adminController');
const { protect } = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/upload-availability', protect, uploadAvailability);

module.exports = router;
