const mongoose = require('mongoose');

const Schema = mongoose.Schema;
const ContactSchema = new Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    message: {
        type: String,
        required: true,
    }
});

module.exports = mongoose.model('Contact', ContactSchema);