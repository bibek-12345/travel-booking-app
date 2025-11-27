const express = require("express");
const router = express.Router();
const Listing = require("../models/listing.js");
const wrapAsync = require("../utils/wrapAsync.js");
const { isLoggedIn, isOwner, validateListing } = require("../middleware.js");


//Index route: to view all the listings
router.get("/", wrapAsync(async (req, res)=>{
    const allListings = await Listing.find({});
    res.render("listings/index.ejs", { allListings });
}));

//New Route: this route gives the form to add the new listing
router.get("/new", isLoggedIn, (req, res)=>{
    res.render("listings/new.ejs");
});

//Show route: to read the data or view the data 
router.get("/:id", wrapAsync(async (req, res) =>{
    let {id} = req.params;
    const listing = await Listing.findById(id)
                            .populate({
                                path: "reviews",
                                populate: {
                                    path: "author",
                                }
                            })
                            .populate("owner");
    if(!listing) {
        req.flash("error", "Listing you requested for does not exist!");
        return res.redirect("/listings");
    }
    res.render("listings/show.ejs",{ listing })
}));

//Create Route or post route: 
router.post("/", isLoggedIn, validateListing, wrapAsync(async (req, res, next)=>{
    let newListing = new Listing(req.body.listing);
    newListing.owner = req.user._id; //store owner username
    await newListing.save();
    req.flash("success", "New Listing Created!");
    res.redirect("/listings");
}));


//Edit Route: it is used to give form to edit in response
router.get("/:id/edit", isLoggedIn, isOwner, wrapAsync(async (req, res)=>{
    let {id} = req.params;
    const listing = await Listing.findById(id);
    if(!listing) {
        req.flash("error", "Listing you requested for does not exist!");
        return res.redirect("/listings");
    }
    res.render("listings/edit.ejs",{ listing });
}));

//Update Route: this takes the data which was submitted through form and update in database
router.put("/:id", isLoggedIn, isOwner, validateListing, wrapAsync(async (req, res)=>{
    let { id } = req.params;
    await Listing.findByIdAndUpdate(id, { ...req.body.listing }); //finds the listing with the given id and updates its all fields with the values from req.body.listing
    req.flash("success", "Listing Updated!");
    res.redirect(`/listings/${id}`);
}));

//Delete Route: this will delete the individual listing
router.delete("/:id", isLoggedIn, isOwner, wrapAsync(async (req, res)=>{
    let { id } = req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    console.log(deletedListing);
    req.flash("success", "Listing Deleted!");
    res.redirect("/listings");
}));

module.exports = router;