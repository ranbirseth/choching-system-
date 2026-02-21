const mongoose = require('mongoose');

const pendingAdmissionSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
        },
        password: {
            type: String,
            required: true,
        },
        appliedForBatch: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Batch',
            required: true,
        },
        status: {
            type: String,
            enum: ['Pending', 'Approved', 'Rejected'],
            default: 'Pending',
        },
    },
    {
        timestamps: true,
    }
);

const PendingAdmission = mongoose.model('PendingAdmission', pendingAdmissionSchema);

module.exports = PendingAdmission;
