const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const listingSchema = new Schema({
    title: {
        type: String,
        required: true,
    },
    description: String,
    image: {
        type: String,
        default: "https://unsplash.com/photos/lone-road-going-to-mountains-A-NVHPka9Rk",
        set: (v) => v === "" ? "https://unsplash.com/photos/lone-road-going-to-mountains-A-NVHPka9Rk" : v,
    },
    price: Number,
    location: String,
    country: String,
});

const Listing = mongoose.model("Listing", listingSchema);
module.exports = Listing;

