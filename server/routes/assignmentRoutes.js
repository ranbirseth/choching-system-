const express = require('express');
const router = express.Router();
const {
    createAssignment,
    getTeacherAssignments,
    getStudentAssignments,
    submitAssignment,
    getSubmissions,
    gradeSubmission,
} = require('../controllers/assignmentController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Teacher/Admin Routes
router.post('/', protect, authorize('Admin', 'Teacher'), createAssignment);
router.get('/teacher', protect, authorize('Admin', 'Teacher'), getTeacherAssignments);
router.get('/:id/submissions', protect, authorize('Admin', 'Teacher'), getSubmissions);
router.put('/submissions/:submissionId/grade', protect, authorize('Admin', 'Teacher'), gradeSubmission);

// Student Routes
router.get('/mine', protect, authorize('Student'), getStudentAssignments);
router.post('/:id/submit', protect, authorize('Student'), submitAssignment);

module.exports = router;
