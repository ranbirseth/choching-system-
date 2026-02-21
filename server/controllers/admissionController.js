const PendingAdmission = require('../models/PendingAdmission');
const User = require('../models/User');

// @desc    Register for admission
// @route   POST /api/admissions/register
// @access  Public
const registerAdmission = async (req, res) => {
    try {
        const { name, email, password, appliedForBatch } = req.body;

        const userExists = await User.findOne({ email });
        const pendingExists = await PendingAdmission.findOne({ email });

        if (userExists || pendingExists) {
            return res.status(400).json({ message: 'Email already registered or admission is pending' });
        }

        const newAdmission = await PendingAdmission.create({
            name,
            email,
            password,
            appliedForBatch,
        });

        res.status(201).json({ message: 'Admission request submitted successfully', data: newAdmission });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all pending admissions
// @route   GET /api/admissions
// @access  Protected (Admin/Teacher)
const getPendingAdmissions = async (req, res) => {
    try {
        const admissions = await PendingAdmission.find({ status: 'Pending' }).populate('appliedForBatch');
        res.json(admissions);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Approve an admission
// @route   PUT /api/admissions/:id/approve
// @access  Protected (Admin/Teacher)
const approveAdmission = async (req, res) => {
    try {
        const admission = await PendingAdmission.findById(req.params.id);

        if (!admission || admission.status !== 'Pending') {
            return res.status(404).json({ message: 'Valid pending admission not found' });
        }

        // Create User record
        const user = await User.create({
            name: admission.name,
            email: admission.email,
            password: admission.password, // This will be hashed by the User model's pre-save middleware
            role: 'Student',
        });

        // We can also add logic here to automatically add the user to the batch,
        // but for now we'll just approve and create the user.

        admission.status = 'Approved';
        await admission.save();

        res.json({ message: 'Admission approved and User created', user });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Reject an admission
// @route   PUT /api/admissions/:id/reject
// @access  Protected (Admin/Teacher)
const rejectAdmission = async (req, res) => {
    try {
        const admission = await PendingAdmission.findById(req.params.id);

        if (!admission || admission.status !== 'Pending') {
            return res.status(404).json({ message: 'Valid pending admission not found' });
        }

        admission.status = 'Rejected';
        await admission.save();

        res.json({ message: 'Admission rejected' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    registerAdmission,
    getPendingAdmissions,
    approveAdmission,
    rejectAdmission,
};
