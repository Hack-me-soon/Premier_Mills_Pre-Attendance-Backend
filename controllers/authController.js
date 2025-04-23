const { findUserByPhone } = require('../models/userModel');
const jwt = require('jsonwebtoken');

// In-memory temporary OTP store (for now)
const otpStore = {};

const sendOtp = (req, res) => {
    console.log(req.body); // Add this

    const { phone } = req.body;

    if (!phone) return res.status(400).json({ message: 'Phone number is required' });

    findUserByPhone(phone).then(user => {
        if (!user) return res.status(404).json({ message: 'User not registered' });

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        otpStore[phone] = otp;

        console.log(`Generated OTP for ${phone}: ${otp}`);
        return res.json({ message: 'OTP sent (check console)' });
    }).catch(err => {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    });
};

const verifyOtp = (req, res) => {
    const { phone, otp } = req.body;

    if (!otp || !phone) return res.status(400).json({ message: 'Phone and OTP are required' });

    const validOtp = otpStore[phone];
    if (otp !== validOtp) return res.status(401).json({ message: 'Invalid OTP' });

    // Generate JWT token
    const token = jwt.sign({ phone }, process.env.JWT_SECRET, { expiresIn: '1d' });
    delete otpStore[phone]; // OTP should be used only once

    res.json({ message: 'Login successful', token });
};

module.exports = { sendOtp, verifyOtp };
