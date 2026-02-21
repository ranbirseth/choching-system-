const Assignment = require('../models/Assignment');
const Submission = require('../models/Submission');

// @desc    Create a new assignment
// @route   POST /api/assignments
// @access  Protected (Admin/Teacher)
const createAssignment = async (req, res) => {
    try {
        const { title, description, batch, subject, dueDate } = req.body;

        const assignment = await Assignment.create({
            title,
            description,
            batch,
            subject,
            dueDate,
            createdBy: req.user._id,
        });

        res.status(201).json(assignment);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all assignments created by the teacher (or all for admin)
// @route   GET /api/assignments/teacher
// @access  Protected (Admin/Teacher)
const getTeacherAssignments = async (req, res) => {
    try {
        const filter = req.user.role === 'Admin' ? {} : { createdBy: req.user._id };

        const assignments = await Assignment.find(filter)
            .populate('batch', 'name')
            .populate('subject', 'name')
            .sort('-createdAt');

        res.json(assignments);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all assignments for a student's batches
// @route   GET /api/assignments/mine
// @access  Protected (Student)
const getStudentAssignments = async (req, res) => {
    try {
        const { batchId } = req.query;
        const filter = {};
        if (batchId) filter.batch = batchId;

        const assignments = await Assignment.find(filter)
            .populate('batch', 'name')
            .populate('subject', 'name')
            .sort('dueDate');

        // Also fetch their submissions so the UI knows what they have submitted
        const submissions = await Submission.find({ student: req.user._id });

        // Combine the data
        const results = assignments.map(assignment => {
            const sub = submissions.find(s => s.assignment.toString() === assignment._id.toString());
            return {
                ...assignment.toObject(),
                submission: sub || null
            };
        });

        res.json(results);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Submit an assignment
// @route   POST /api/assignments/:id/submit
// @access  Protected (Student)
const submitAssignment = async (req, res) => {
    try {
        const { content } = req.body;
        const assignmentId = req.params.id;

        // Check if assignment exists
        const assignment = await Assignment.findById(assignmentId);
        if (!assignment) {
            return res.status(404).json({ message: 'Assignment not found' });
        }

        // Check if already submitted
        const existing = await Submission.findOne({ assignment: assignmentId, student: req.user._id });
        if (existing) {
            return res.status(400).json({ message: 'Assignment already submitted' });
        }

        const submission = await Submission.create({
            assignment: assignmentId,
            student: req.user._id,
            content,
        });

        res.status(201).json({ message: 'Submitted successfully', submission });
    } catch (error) {
        // If it violates the unique index or has other validation issues
        if (error.code === 11000) {
            return res.status(400).json({ message: 'Assignment already submitted' });
        }
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all submissions for an assignment
// @route   GET /api/assignments/:id/submissions
// @access  Protected (Admin/Teacher)
const getSubmissions = async (req, res) => {
    try {
        const submissions = await Submission.find({ assignment: req.params.id })
            .populate('student', 'name email createdAt'); // 'createdAt' just so we have some fallback info if needed
        res.json(submissions);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Grade a submission
// @route   PUT /api/assignments/submissions/:submissionId/grade
// @access  Protected (Admin/Teacher)
const gradeSubmission = async (req, res) => {
    try {
        const { grade, feedback } = req.body;

        const submission = await Submission.findByIdAndUpdate(
            req.params.submissionId,
            { grade, feedback, status: 'Graded' },
            { new: true }
        );

        if (!submission) {
            return res.status(404).json({ message: 'Submission not found' });
        }

        res.json({ message: 'Graded successfully', submission });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    createAssignment,
    getTeacherAssignments,
    getStudentAssignments,
    submitAssignment,
    getSubmissions,
    gradeSubmission,
};
