const Subject = require('../models/Subject');

// @desc    Get all subjects
// @route   GET /api/subjects
// @access  Protected
const getSubjects = async (req, res) => {
    try {
        const subjects = await Subject.find({});
        res.json(subjects);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create a subject
// @route   POST /api/subjects
// @access  Protected (Admin/Teacher)
const createSubject = async (req, res) => {
    try {
        const { name, code, description } = req.body;

        const subjectExists = await Subject.findOne({ code });
        if (subjectExists) {
            return res.status(400).json({ message: 'Subject with this code already exists' });
        }

        const subject = await Subject.create({
            name,
            code,
            description,
        });

        res.status(201).json(subject);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update a subject
// @route   PUT /api/subjects/:id
// @access  Protected (Admin/Teacher)
const updateSubject = async (req, res) => {
    try {
        const { name, code, description } = req.body;

        const subject = await Subject.findById(req.params.id);

        if (subject) {
            subject.name = name || subject.name;
            subject.code = code || subject.code;
            subject.description = description || subject.description;

            const updatedSubject = await subject.save();
            res.json(updatedSubject);
        } else {
            res.status(404).json({ message: 'Subject not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete a subject
// @route   DELETE /api/subjects/:id
// @access  Protected (Admin/Teacher)
const deleteSubject = async (req, res) => {
    try {
        const subject = await Subject.findById(req.params.id);

        if (subject) {
            await Subject.deleteOne({ _id: subject._id });
            res.json({ message: 'Subject removed' });
        } else {
            res.status(404).json({ message: 'Subject not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getSubjects,
    createSubject,
    updateSubject,
    deleteSubject,
};
