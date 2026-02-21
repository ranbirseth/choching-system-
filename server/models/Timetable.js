const mongoose = require('mongoose');

const timetableSchema = new mongoose.Schema(
    {
        batch: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Batch',
            required: true,
        },
        subject: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Subject',
            required: true,
        },
        dayOfWeek: {
            type: String,
            enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
            required: true,
        },
        startTime: {
            type: String, // E.g., "09:00"
            required: true,
        },
        endTime: {
            type: String, // E.g., "10:30"
            required: true,
        },
        teacher: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        }
    },
    {
        timestamps: true,
    }
);

const Timetable = mongoose.model('Timetable', timetableSchema);

module.exports = Timetable;
