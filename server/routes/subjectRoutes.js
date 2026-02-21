const express = require('express');
const router = express.Router();
const {
    getSubjects,
    createSubject,
    updateSubject,
    deleteSubject,
} = require('../controllers/subjectController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.route('/')
    .get(protect, getSubjects)
    .post(protect, authorize('Admin', 'Teacher'), createSubject);

router.route('/:id')
    .put(protect, authorize('Admin', 'Teacher'), updateSubject)
    .delete(protect, authorize('Admin', 'Teacher'), deleteSubject);

module.exports = router;
