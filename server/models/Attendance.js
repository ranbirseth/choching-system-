const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema(
    {
        student: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        batch: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Batch',
            required: true,
        },
        date: {
            type: String, // Stored as 'YYYY-MM-DD' for easy querying
            required: true,
        },
        status: {
            type: String,
            enum: ['Present', 'Absent', 'Late'],
            default: 'Present',
        },
        isConfirmed: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
    }
);

// Prevent duplicate attendance records for the same student, batch, and date
attendanceSchema.index({ student: 1, batch: 1, date: 1 }, { unique: true });

const Attendance = mongoose.model('Attendance', attendanceSchema);

module.exports = Attendance;
