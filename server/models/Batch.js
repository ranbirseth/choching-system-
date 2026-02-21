const mongoose = require('mongoose');

const batchSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        description: {
            type: String,
        },
        subjects: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Subject',
            },
        ],
        isActive: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
    }
);

const Batch = mongoose.model('Batch', batchSchema);

module.exports = Batch;
