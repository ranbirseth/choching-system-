const express = require('express');
const router = express.Router();
const {
    createTimetableEntry,
    getBatchTimetable,
    deleteTimetableEntry,
    getMyTimetable
} = require('../controllers/timetableController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/', protect, authorize('Admin', 'Teacher'), createTimetableEntry);
router.get('/batch/:batchId', protect, getBatchTimetable);
router.delete('/:id', protect, authorize('Admin', 'Teacher'), deleteTimetableEntry);
router.get('/mine', protect, authorize('Student'), getMyTimetable);

module.exports = router;
