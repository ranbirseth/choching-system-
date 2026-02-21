const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const jwt = require('jsonwebtoken');
const axios = require('axios');

dotenv.config();

const testAPI = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const admin = await User.findOne({ email: 'admin@example.com' });
        if (!admin) {
            console.log('Admin not found');
            process.exit(1);
        }

        const token = jwt.sign({ id: admin._id }, process.env.ACCESS_TOKEN_SECRET, {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
        });

        const headers = { Authorization: `Bearer ${token}` };

        console.log('Testing /api/assignments/teacher');
        const res1 = await axios.get('http://localhost:5000/api/assignments/teacher', { headers });
        console.log('Assignments:', res1.data);

        console.log('Testing /api/batches');
        const res2 = await axios.get('http://localhost:5000/api/batches', { headers });
        console.log('Batches:', res2.data.length);

        console.log('Testing /api/subjects');
        const res3 = await axios.get('http://localhost:5000/api/subjects', { headers });
        console.log('Subjects:', res3.data.length);

        process.exit(0);
    } catch (error) {
        if (error.response) {
            console.error('API Error:', error.response.status, error.response.data);
        } else {
            console.error('Error:', error.message);
        }
        process.exit(1);
    }
};

testAPI();
