const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

const connectDB = require('./config/db');

dotenv.config();

// (The local connectDB function is removed as we now use the one from config/db.js)

const seedAdmin = async () => {
    try {
        await connectDB();

        const adminExists = await User.findOne({ email: 'admin@example.com' });

        if (!adminExists) {
            await User.create({
                name: 'Admin User',
                email: 'admin@example.com',
                password: 'password123',
                role: 'Admin',
            });
            console.log('Admin user successfully created!');
        } else {
            console.log('Admin user already exists.');
        }

        process.exit();
    } catch (error) {
        console.error(`Error seeding admin: ${error.message}`);
        process.exit(1);
    }
};

seedAdmin();
