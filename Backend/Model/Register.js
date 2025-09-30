const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const regiSchema = new Schema({
    name: {
        type: String,
        required: true,
    },
    gmail: {
        type: String,
        required: true,
    },
    password: {
        type: String,  // ← Changed from Number to String
        required: true,
    },
});

module.exports = mongoose.model("Register", regiSchema);