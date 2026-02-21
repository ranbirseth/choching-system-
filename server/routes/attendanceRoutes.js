const express = require('express');
const router = express.Router();
const {
    markAttendance,
    getMyAttendance,
    getBatchAttendance,
    confirmAttendance,
    overrideAttendance,
} = require('../controllers/attendanceController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Student actions
router.post('/mark', protect, authorize('Student'), markAttendance);
router.get('/mine', protect, authorize('Student'), getMyAttendance);

// Teacher/Admin actions
router.get('/batch/:batchId', protect, authorize('Admin', 'Teacher'), getBatchAttendance);
router.put('/confirm/:id', protect, authorize('Admin', 'Teacher'), confirmAttendance);
router.post('/override', protect, authorize('Admin', 'Teacher'), overrideAttendance);

module.exports = router;
