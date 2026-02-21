const Attendance = require('../models/Attendance');
const User = require('../models/User');

// Helper to get today's date in 'YYYY-MM-DD' format
const getTodayString = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
};

// @desc    Student marks their own attendance for today
// @route   POST /api/attendance/mark
// @access  Protected (Student)
const markAttendance = async (req, res) => {
    try {
        const { batchId } = req.body;
        const studentId = req.user._id;
        const dateStr = getTodayString();

        const existingRecord = await Attendance.findOne({
            student: studentId,
            batch: batchId,
            date: dateStr,
        });

        if (existingRecord) {
            return res.status(400).json({ message: 'Attendance already marked for today in this batch.' });
        }

        const attendance = await Attendance.create({
            student: studentId,
            batch: batchId,
            date: dateStr,
            status: 'Present',
        });

        res.status(201).json({ message: 'Attendance marked successfully', attendance });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get student's own attendance history & percentage
// @route   GET /api/attendance/mine
// @access  Protected (Student)
const getMyAttendance = async (req, res) => {
    try {
        // We expect a batchId query param. If none, maybe fetch all. For simplicity, we fetch all for this user and calculate per batch later if needed, but let's assume they want a specific batch mostly.
        const { batchId } = req.query;
        const filter = { student: req.user._id };

        if (batchId) {
            filter.batch = batchId;
        }

        const records = await Attendance.find(filter).populate('batch', 'name').sort({ date: -1 });

        // Calculate Attendance Percentage:
        // Attendance % = (Total Present Days / Total Working Days) × 100
        // Total Working Days = total records for this student. (In a real system, you might count batch working days regardless of student presence, but here we count days the student has any record of, or we can assume absent days are manual).

        // For realistic calculation: Let's assume the teacher marks them absent if they don't show up.
        const totalDays = records.length;
        let presentDays = 0;

        records.forEach(r => {
            if (r.status === 'Present' || r.status === 'Late') {
                presentDays++;
            }
        });

        const percentage = totalDays === 0 ? 0 : Math.round((presentDays / totalDays) * 100);

        res.json({ records, stats: { totalDays, presentDays, percentage } });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get attendance records for a specific batch and date
// @route   GET /api/attendance/batch/:batchId
// @access  Protected (Admin/Teacher)
const getBatchAttendance = async (req, res) => {
    try {
        const { batchId } = req.params;
        const date = req.query.date || getTodayString();

        const records = await Attendance.find({ batch: batchId, date })
            .populate('student', 'name email');

        res.json(records);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Teacher confirms an attendance record
// @route   PUT /api/attendance/confirm/:id
// @access  Protected (Admin/Teacher)
const confirmAttendance = async (req, res) => {
    try {
        const attendance = await Attendance.findById(req.params.id);

        if (!attendance) {
            return res.status(404).json({ message: 'Record not found' });
        }

        attendance.isConfirmed = true;
        await attendance.save();

        res.json({ message: 'Attendance confirmed', attendance });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Teacher overrides or manually creates an attendance record
// @route   POST /api/attendance/override
// @access  Protected (Admin/Teacher)
const overrideAttendance = async (req, res) => {
    try {
        // Using upsert logic: if record exists, update it. If not, create it.
        const { studentId, batchId, date, status } = req.body;

        const record = await Attendance.findOneAndUpdate(
            { student: studentId, batch: batchId, date },
            { $set: { status, isConfirmed: true } },
            { new: true, upsert: true } // Create if doesn't exist
        );

        res.json({ message: 'Attendance updated successfully', record });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    markAttendance,
    getMyAttendance,
    getBatchAttendance,
    confirmAttendance,
    overrideAttendance,
};
