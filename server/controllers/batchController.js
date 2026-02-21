const Batch = require('../models/Batch');

// @desc    Get all batches
// @route   GET /api/batches
// @access  Protected
const getBatches = async (req, res) => {
    try {
        const batches = await Batch.find({ isActive: true }).populate('subjects');
        res.json(batches);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create a batch
// @route   POST /api/batches
// @access  Protected (Admin/Teacher)
const createBatch = async (req, res) => {
    try {
        const { name, description, subjects } = req.body;

        const batch = await Batch.create({
            name,
            description,
            subjects, // Expects an array of subject IDs
        });

        res.status(201).json(await batch.populate('subjects'));
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update a batch
// @route   PUT /api/batches/:id
// @access  Protected (Admin/Teacher)
const updateBatch = async (req, res) => {
    try {
        const { name, description, subjects, isActive } = req.body;

        const batch = await Batch.findById(req.params.id);

        if (batch) {
            batch.name = name || batch.name;
            batch.description = description !== undefined ? description : batch.description;
            batch.subjects = subjects || batch.subjects;
            if (isActive !== undefined) {
                batch.isActive = isActive;
            }

            const updatedBatch = await batch.save();
            res.json(await updatedBatch.populate('subjects'));
        } else {
            res.status(404).json({ message: 'Batch not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete a batch (Soft Delete)
// @route   DELETE /api/batches/:id
// @access  Protected (Admin/Teacher)
const deleteBatch = async (req, res) => {
    try {
        const batch = await Batch.findById(req.params.id);

        if (batch) {
            batch.isActive = false; // Soft delete
            await batch.save();
            res.json({ message: 'Batch marked as inactive (soft deleted)' });
        } else {
            res.status(404).json({ message: 'Batch not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getBatches,
    createBatch,
    updateBatch,
    deleteBatch,
};
