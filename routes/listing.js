const express = require("express");
const router = express.Router();
const Listing = require("../models/listing.js");
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const { listingSchema, reviewSchema } = require("../schema.js"); //joi validation schema.js(server side validation)

//function to validate listing 
const validateListing = (req, res, next) => {
    //validation for whole listing and also individual listing using joi
    let { error } = listingSchema.validate(req.body); //is req.body is satisfying the condition of listingSchema
    if(error) {
        let errMsg = error.details.map((el) => el.message).
        join(","); //extract only the useful error messages(el.messages) separated by comma
        throw new ExpressError(400, errMsg)
    } else {
        next(); //if no error continue to the next middleware when there is no error.
    }
}

//Index route: to view all the listings
router.get("/", wrapAsync(async (req, res)=>{
    const allListings = await Listing.find({});
    res.render("listings/index.ejs", { allListings });
}));

//New Route: this route gives the form to add the new listing
router.get("/new",(req, res)=>{
    res.render("listings/new.ejs");
})

//Show route: to read the data or view the data 
router.get("/:id", wrapAsync(async (req, res) =>{
    let {id} = req.params;
    const listing = await Listing.findById(id).populate("reviews");
    res.render("listings/show.ejs",{ listing })
}));

//Create Route or post route: 
router.post("/", validateListing, wrapAsync(async (req, res, next)=>{
    let newListing = new Listing(req.body.listing);
    await newListing.save();
    res.redirect("/listings");
}));

//Edit Route: it is used to give form to edit in response
router.get("/:id/edit", wrapAsync(async (req, res)=>{
    let {id} = req.params;
    const listing = await Listing.findById(id);
    res.render("listings/edit.ejs",{ listing });
}));

//Update Route: this takes the data which was submitted through form and update in database
router.put("/:id", validateListing, wrapAsync(async (req, res)=>{
    let { id } = req.params;
    await Listing.findByIdAndUpdate(id, { ...req.body.listing });
    res.redirect(`/listings/${id}`);
}));

//Delete Route: this will delete the individual listing
router.delete("/:id", wrapAsync(async (req, res)=>{
    let { id } = req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    console.log(deletedListing);
    res.redirect("/listings");
}));

module.exports = router;