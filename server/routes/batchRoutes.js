const express = require('express');
const router = express.Router();
const {
    getBatches,
    createBatch,
    updateBatch,
    deleteBatch,
} = require('../controllers/batchController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.route('/')
    .get(protect, getBatches)
    .post(protect, authorize('Admin', 'Teacher'), createBatch);

router.route('/:id')
    .put(protect, authorize('Admin', 'Teacher'), updateBatch)
    .delete(protect, authorize('Admin', 'Teacher'), deleteBatch);

module.exports = router;
