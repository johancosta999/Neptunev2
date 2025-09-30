const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const sellerSchema = new Schema({
    tankId: {
        type: String,
        required: true,
    },

    customerName: {
        type: String,
        required: true,
    },

    address: {
        type: String,
        required: true,
    },

    city: {
        type: String,
        required: true,
    },

    customerEmail: {
        type: String,
        required: true,
    },

    sellDate: {
        type: String,
        required: true,
    },

    nicNumber: {
        type: String,
        required: true,
    },

    contactNumber: {
        type: String,
        required: true,
    },

    capacity: {
        type: String,
        required: true,
    },

    price: {
        type: String,
        required: true,
    },

    warranty: {
        type: String,
        required: true,
    },

    description: {
        type: String,
        required: true,
    },

    invoiceNumber: {
        type: String,
        required: true,
    },

    password: {
        type: String,
        required: true,
    },


});

module.exports = mongoose.model("Seller", sellerSchema);