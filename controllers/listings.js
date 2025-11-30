const Listing = require("../models/listing.js");
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapToken = process.env.MAP_TOKEN;
const geocodingClient = mbxGeocoding({ accessToken: mapToken });

//index route: to view all the listings
module.exports.index = async (req, res)=>{
    const allListings = await Listing.find({});
    res.render("listings/index.ejs", { allListings });
}

//New Route: this route gives the form to add the new listing
module.exports.renderNewForm = (req, res)=>{
    res.render("listings/new.ejs");
}

//Show route: to read the data or view the data 
module.exports.showListing = async (req, res) =>{
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
}

//Create Route or post route: 
module.exports.createListing = async (req, res, next)=>{
    // console.log(`this is from listing, ${req.body.listing}`)
    let response = await geocodingClient.forwardGeocode({
        query: req.body.listing.location,
        limit: 1,
    })
      .send();
    
    let url = req.file.path;
    let filename = req.file.filename;
    let newListing = new Listing(req.body.listing);
    newListing.owner = req.user._id; //store owner username
    newListing.image = { url, filename }; //saves url and filename in image property.
    newListing.geometry = response.body.features[0].geometry; //saves coordinates inside geometry property in listing
    let savedListing = await newListing.save();
    console.log(savedListing);
    req.flash("success", "New Listing Created!");
    res.redirect("/listings");
}

//Edit Route: it is used to give form to edit in response
module.exports.renderEditForm = async (req, res)=>{
    let {id} = req.params;
    const listing = await Listing.findById(id);
    if(!listing) {
        req.flash("error", "Listing you requested for does not exist!");
        return res.redirect("/listings");
    }
    //replace original image url with cloudinary parmeter added url.
    let originalImageUrl = listing.image.url;
    originalImageUrl = originalImageUrl.replace("/upload", "/upload/w_250");
    res.render("listings/edit.ejs",{ listing, originalImageUrl });
}

//Update Route: this takes the data which was submitted through form and update in database
module.exports.updateListing = async (req, res)=>{
    let { id } = req.params;
    let listing = await Listing.findByIdAndUpdate(id, { ...req.body.listing }); //finds the listing with the given id and updates its all fields with the values from req.body.listing
   
    //if typeof req.file is not undefined then only save the image 
    if(typeof req.file != "undefined") {
        let url = req.file.path;
        let filename = req.file.filename;
        listing.image = { url, filename }; //update url and filname in image of listing
        await listing.save(); //save listing
    }

    req.flash("success", "Listing Updated!");
    res.redirect(`/listings/${id}`);
}

//Delete Route: this will delete/destroy the individual listing
module.exports.destroyListing = async (req, res)=>{
    let { id } = req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    console.log(deletedListing);
    req.flash("success", "Listing Deleted!");
    res.redirect("/listings");
}