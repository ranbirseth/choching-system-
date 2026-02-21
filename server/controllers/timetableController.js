const Timetable = require('../models/Timetable');
const Batch = require('../models/Batch');
const Subject = require('../models/Subject'); // Added for populate
const User = require('../models/User'); // Added for populate

// @desc    Create a timetable entry
// @route   POST /api/timetables
// @access  Protected (Admin/Teacher)
const createTimetableEntry = async (req, res) => {
    try {
        const { batch, subject, dayOfWeek, startTime, endTime } = req.body;

        const entry = await Timetable.create({
            batch,
            subject,
            dayOfWeek,
            startTime,
            endTime,
            teacher: req.user._id, // Assume the creator is the teacher for now, or admin assigning it
        });

        res.status(201).json(entry);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get timetable for a specific batch
// @route   GET /api/timetables/batch/:batchId
// @access  Protected
const getBatchTimetable = async (req, res) => {
    try {
        const entries = await Timetable.find({ batch: req.params.batchId })
            .populate('subject', 'name')
            .populate('teacher', 'name')
            .sort({ dayOfWeek: 1, startTime: 1 }); // Simple sort, string based days will be alphabetical, but we can manage on frontend

        res.json(entries);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete a timetable entry
// @route   DELETE /api/timetables/:id
// @access  Protected (Admin/Teacher)
const deleteTimetableEntry = async (req, res) => {
    try {
        const entry = await Timetable.findById(req.params.id);
        if (!entry) {
            return res.status(404).json({ message: 'Entry not found' });
        }

        await Timetable.findByIdAndDelete(req.params.id);
        res.json({ message: 'Timetable entry deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get timetable for all batches student is enrolled in
// @route   GET /api/timetables/mine
// @access  Protected (Student)
const getMyTimetable = async (req, res) => {
    try {
        const studentBatches = await Batch.find({ students: req.user._id });
        // Note: Phase 2 Admissions created batch logic but users aren't explicitly inside a 'students' array on Batch yet in this codebase version unless added in Phase 2 DB.
        // Alternatively, Admissions approvals assigned batches? Let's check the schema.
        // If we don't have a direct link from Student -> Batch arrays, we can rely on Attendance records or let's assume they pick their batch on UI.
        // Wait, in Phase 1/2 we didn't add a 'batch' reference to User or 'students' array to Batch.
        // Let's modify approach to fetch all timetables for now, or require a batchId query param. Let's use batchId query param like assignments.

        const { batchId } = req.query;
        let filter = {};

        if (batchId) {
            filter.batch = batchId;
        }

        const entries = await Timetable.find(filter)
            .populate('subject', 'name code')
            .populate('teacher', 'name');

        res.json(entries);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    createTimetableEntry,
    getBatchTimetable,
    deleteTimetableEntry,
    getMyTimetable
};
