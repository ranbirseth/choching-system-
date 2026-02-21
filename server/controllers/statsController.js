const User = require('../models/User');
const Batch = require('../models/Batch');
const Subject = require('../models/Subject');
const PendingAdmission = require('../models/PendingAdmission');

// @desc    Get dashboard statistics
// @route   GET /api/stats
// @access  Protected (Admin/Teacher)
const getStats = async (req, res) => {
    try {
        const totalStudents = await User.countDocuments({ role: 'Student' });
        const totalTeachers = await User.countDocuments({ role: 'Teacher' });
        const totalBatches = await Batch.countDocuments({ isActive: true });
        const totalSubjects = await Subject.countDocuments();
        const pendingAdmissionsCount = await PendingAdmission.countDocuments({ status: 'Pending' });

        res.json({
            totalStudents,
            totalTeachers,
            totalBatches,
            totalSubjects,
            pendingAdmissionsCount,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getStats,
};
