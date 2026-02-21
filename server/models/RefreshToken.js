const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const refreshTokenSchema = new mongoose.Schema(
    {
        token: {
            type: String,
            required: true,
            unique: true,
        },
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        expiryDate: {
            type: Date,
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

refreshTokenSchema.statics.createToken = async function (user) {
    const expiredAt = new Date();
    expiredAt.setDate(expiredAt.getDate() + 7); // 7 days from now

    const _token = uuidv4();

    const refreshToken = new this({
        token: _token,
        user: user._id,
        expiryDate: expiredAt.getTime(),
    });

    const savedToken = await refreshToken.save();
    return savedToken.token;
};

refreshTokenSchema.statics.verifyExpiration = (token) => {
    return token.expiryDate.getTime() < new Date().getTime();
};

const RefreshToken = mongoose.model('RefreshToken', refreshTokenSchema);

module.exports = RefreshToken;
