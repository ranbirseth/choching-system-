const express = require('express');
const router = express.Router();
const {
    registerAdmission,
    getPendingAdmissions,
    approveAdmission,
    rejectAdmission,
} = require('../controllers/admissionController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/register', registerAdmission);
router.get('/', protect, authorize('Admin', 'Teacher'), getPendingAdmissions);
router.put('/:id/approve', protect, authorize('Admin', 'Teacher'), approveAdmission);
router.put('/:id/reject', protect, authorize('Admin', 'Teacher'), rejectAdmission);

module.exports = router;
