const User = require('../models/User');
const RefreshToken = require('../models/RefreshToken');
const jwt = require('jsonwebtoken');

const generateAccessToken = (id) => {
    return jwt.sign({ id }, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: process.env.ACCESS_TOKEN_EXPIRY || '15m',
    });
};

// @desc    Register a new user (Pending Admissions logic can be applied here later, for now just register)
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        const userExists = await User.findOne({ email });

        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const user = await User.create({
            name,
            email,
            password,
            role: role || 'Student',
        });

        if (user) {
            res.status(201).json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
            });
        } else {
            res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Auth user & get tokens
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        console.log(`Login attempt for email: ${email}`);

        const user = await User.findOne({ email });
        console.log(`User query result for ${email}: ${user ? 'Found' : 'NOT FOUND'}`);

        if (user) {
            const isMatch = await user.matchPassword(password);
            console.log(`Password match result for ${email}: ${isMatch}`);

            if (isMatch) {
                const accessToken = generateAccessToken(user._id);
                const refreshToken = await RefreshToken.createToken(user);

                return res.json({
                    _id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    accessToken,
                    refreshToken,
                });
            }
        }

        console.log(`Login failed for ${email}: Returning 401`);
        res.status(401).json({ message: 'Invalid email or password' });
    } catch (error) {
        console.error(`Login error: ${error.message}`);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Refresh access token
// @route   POST /api/auth/refresh
// @access  Public
const refreshToken = async (req, res) => {
    const { refreshToken: requestToken } = req.body;

    if (requestToken == null) {
        return res.status(403).json({ message: 'Refresh Token is required!' });
    }

    try {
        const rfToken = await RefreshToken.findOne({ token: requestToken }).populate('user');

        if (!rfToken) {
            return res.status(403).json({ message: 'Refresh token is not in database!' });
        }

        if (RefreshToken.verifyExpiration(rfToken)) {
            await RefreshToken.findByIdAndDelete(rfToken._id);
            return res.status(403).json({
                message: 'Refresh token was expired. Please make a new signin request',
            });
        }

        const newAccessToken = generateAccessToken(rfToken.user._id);

        res.status(200).json({
            accessToken: newAccessToken,
            refreshToken: rfToken.token,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Logout user / clear tokens
// @route   POST /api/auth/logout
// @access  Protected
const logoutUser = async (req, res) => {
    try {
        const { refreshToken: requestToken } = req.body;
        if (requestToken) {
            await RefreshToken.findOneAndDelete({ token: requestToken });
        }
        res.status(200).json({ message: 'Logged out successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    registerUser,
    loginUser,
    refreshToken,
    logoutUser,
};
