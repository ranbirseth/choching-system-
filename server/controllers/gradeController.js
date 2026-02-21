const Submission = require('../models/Submission');
const Attendance = require('../models/Attendance');
const Assignment = require('../models/Assignment'); // Added to ensure model is registered for populate

// @desc    Get student's overall grades summary
// @route   GET /api/grades/mine
// @access  Protected (Student)
const getMyGradesSummary = async (req, res) => {
    try {
        const studentId = req.user._id;

        // 1. Get all graded submissions
        const submissions = await Submission.find({ student: studentId, status: 'Graded' })
            .populate('assignment', 'title dueDate')
            .sort('-updatedAt'); // latest graded first

        let totalGradePoints = 0;
        submissions.forEach(sub => {
            totalGradePoints += (sub.grade || 0);
        });

        const averageGrade = submissions.length > 0 ? Math.round(totalGradePoints / submissions.length) : 0;

        // 2. Get attendance percentage
        const allAttendance = await Attendance.find({ student: studentId });
        const totalDays = allAttendance.length;
        let presentDays = 0;
        allAttendance.forEach(r => {
            if (r.status === 'Present' || r.status === 'Late') presentDays++;
        });
        const attendancePercentage = totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 0;

        res.json({
            averageGrade,
            totalGradedAssignments: submissions.length,
            attendancePercentage,
            recentGrades: submissions
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getMyGradesSummary
};
