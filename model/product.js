const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "A name is required..."]
    },
    description: {
        type: String,
        required: [true, "You need to describe your product..."]
    },
    price: {
        type: Number,
        required: [true, "a price for the product is required"]
    },
    file: String,
    productType: {
        type: String,
        enum: ["wigs", "wig collection", "accessories", ""]
    },
    date: Date
})

module.exports = mongoose.model("Product", productSchema);