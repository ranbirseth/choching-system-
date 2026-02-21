const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema(
    {
        assignment: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Assignment',
            required: true,
        },
        student: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        content: {
            type: String,
            required: true, // Can be actual text response or a link to a Google Drive file/PDF
        },
        status: {
            type: String,
            enum: ['Submitted', 'Graded'],
            default: 'Submitted',
        },
        grade: {
            type: Number,
            min: 0,
            max: 100,
        },
        feedback: {
            type: String,
        },
    },
    {
        timestamps: true,
    }
);

// Prevent a student from submitting multiple times for the same assignment (unless we want to allow re-submissions, but let's keep it simple)
submissionSchema.index({ assignment: 1, student: 1 }, { unique: true });

const Submission = mongoose.model('Submission', submissionSchema);

module.exports = Submission;
