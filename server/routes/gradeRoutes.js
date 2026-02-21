const express = require('express');
const router = express.Router();
const { getMyGradesSummary } = require('../controllers/gradeController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/mine', protect, authorize('Student'), getMyGradesSummary);

module.exports = router;
