const express = require("express");
const router = express.Router({ mergeParams: true });
const Listing = require("../models/listing.js");
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const { reviewSchema } = require("../schema.js");  //joi validation schema.js(server side validation)
const Review = require("../models/review.js");

//function to validate review
const validateReview = (req, res, next) => {
    let { error } = reviewSchema.validate(req.body); //is req.body is satisfying the condition of listingSchema
    if(error) {
        let errMsg = error.details.map((el) => el.message).
        join(","); //extract only the useful error messages(el.messages) separated by comma
        throw new ExpressError(400, errMsg)
    } else {
        next(); //if no error continue to the next middleware when there is no error.
    }
}

//post Review Route
router.post("/", validateReview, wrapAsync(async(req, res)=> {
    let listing = await Listing.findById(req.params.id);
    let newReview = new Review(req.body.review);
  
    listing.reviews.push(newReview);

    await newReview.save();
    await listing.save();
    req.flash("success", "New Review Created!");
    res.redirect(`/listings/${listing._id}`)
}));

//Delete Review Route
router.delete("/:reviewId", wrapAsync(async (req, res)=> {
    let { id, reviewId } = req.params;
    await Listing.findByIdAndUpdate(id, {$pull: {reviews: reviewId}}); //pull means remove data from an array, remove the reviewsId whichever matched with reviews inside array
    await Review.findByIdAndDelete(reviewId);
    req.flash("success", "Review Deleted!");
    res.redirect(`/listings/${id}`);
}));

module.exports = router;