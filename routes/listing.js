const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const { isLoggedIn, isOwner, validateListing } = require("../middleware.js");

const listingController = require("../controllers/listings.js")

//Index route: to view all the listings
router.get("/", wrapAsync(listingController.index));

//New Route: this route gives the form to add the new listing
router.get("/new", isLoggedIn, listingController.renderNewForm);

//Show route: to read the data or view the data 
router.get("/:id", wrapAsync(listingController.showListing));

//Create Route or post route: 
router.post("/", isLoggedIn, validateListing, wrapAsync(listingController.createListing));


//Edit Route: it is used to give form to edit in response
router.get("/:id/edit", isLoggedIn, isOwner, wrapAsync(listingController.renderEditForm));

//Update Route: this takes the data which was submitted through form and update in database
router.put("/:id", isLoggedIn, isOwner, validateListing, wrapAsync(listingController.updateListing));

//Delete Route: this will delete/destroy the individual listing
router.delete("/:id", isLoggedIn, isOwner, wrapAsync(listingController.destroyListing));

module.exports = router;