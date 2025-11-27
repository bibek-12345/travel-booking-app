const Listing = require("../models/listing.js");
const Review = require("../models/review.js");

//post Review Route: create new review
module.exports.createReview = async(req, res)=> {
    let listing = await Listing.findById(req.params.id);
    let newReview = new Review(req.body.review);
    newReview.author = req.user._id; //storing loggedin user to author property of newReview
    listing.reviews.push(newReview);
    await newReview.save();
    await listing.save();
    req.flash("success", "New Review Created!");
    res.redirect(`/listings/${listing._id}`)
}

//Delete/destroy Review Route: delete/destroy the review
module.exports.destroyReview = async (req, res)=> {
    let { id, reviewId } = req.params;
    await Listing.findByIdAndUpdate(id, {$pull: {reviews: reviewId}}); //pull means remove data from an array, remove the reviewsId whichever matched with reviews inside array
    await Review.findByIdAndDelete(reviewId);
    req.flash("success", "Review Deleted!");
    res.redirect(`/listings/${id}`);
}