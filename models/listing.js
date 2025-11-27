const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Review = require("./review.js")

const listingSchema = new Schema({
    title: {
        type: String,
        required: true,
    },
    description: String,
    image: {
        type: String,
        default: "https://images.unsplash.com/photo-1494783367193-149034c05e8f?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        set: (v) => v === "" ? "https://images.unsplash.com/photo-1494783367193-149034c05e8f?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" : v,
    },
    price: Number,
    location: String,
    country: String,
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: "Review"
        },
    ],
    owner: {
        type: Schema.Types.ObjectId,
        ref: "User"
    }
});

//post mongoose middleware to delete the review from database (this middleware run after deletion of listing)
//first receives the deleted listing as listing(listing.title, listing.price, listing.reviews->contain array of review ObjectIDs)
listingSchema.post("findOneAndDelete", async (listing)=> { 
    if(listing) {
        await Review.deleteMany({_id : {$in: listing.reviews}}); //this removes all review documents where _id is inside the listings reviews array.
    }
});

const Listing = mongoose.model("Listing", listingSchema);
module.exports = Listing;

