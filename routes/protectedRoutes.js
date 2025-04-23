const express = require("express");
const router = express.Router();
const { protect } = require("../middlewares/authMiddleware");

router.get("/dashboard", protect, (req, res) => {
    res.json({ message: `Welcome user ${req.user.phone}` });
});

module.exports = router;
