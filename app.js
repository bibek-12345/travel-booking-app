const express = require("express");
const app = express();
const mongoose = require("mongoose");
const Listing = require("./models/listing.js");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const wrapAsync = require("./utils/wrapAsync.js");
const ExpressError = require("./utils/ExpressError.js");
const { listingSchema, reviewSchema } = require("./schema.js");
const Review = require("./models/review.js");


const MONGO_URL = "mongodb://127.0.0.1:27017/travelDB";

main()
    .then(()=>{
        console.log("connection successful");
    })
    .catch((err)=>{
        console.log(err);
    })

async function main() {
    await mongoose.connect(MONGO_URL);
}


app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "/views"));
app.use(express.urlencoded({extended:true}));//to parse all the data whichever we are getting from request
app.use(methodOverride('_method')); // override with POST having ?_method=PUT

app.engine("ejs", ejsMate);
app.use(express.static(path.join(__dirname, "/public")));



//route for samplelisting where we only added our document into the collection
// app.get("/testListing", async (req, res)=>{
//     let sampleListing = new Listing({
//         title: "My New Villa",
//         description: "By the beach",
//         price: 150,
//         location: "Toronto, Ontario",
//         country: "Canada",
//     });
//     await sampleListing.save();
//     console.log("sample was saved");
//     res.send("Successful Testing");
// });

app.get("/", (req, res)=>{
    res.send("Hi, I am root");
});

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


//Index route: to view all the listings
app.get("/listings", wrapAsync(async (req, res)=>{
    const allListings = await Listing.find({});
    res.render("listings/index.ejs", { allListings });
}));

//New Route: this route gives the form to add the new listing
app.get("/listings/new",(req, res)=>{
    res.render("listings/new.ejs");
})

//Show route: to read the data or view the data 
app.get("/listings/:id", wrapAsync(async (req, res) =>{
    let {id} = req.params;
    const listing = await Listing.findById(id).populate("reviews");
    res.render("listings/show.ejs",{ listing })
}));

//Create Route or post route: 
app.post("/listings", validateListing, wrapAsync(async (req, res, next)=>{
    let newListing = new Listing(req.body.listing);
    await newListing.save();
    res.redirect("/listings");
}));

//Edit Route: it is used to give form to edit in response
app.get("/listings/:id/edit", wrapAsync(async (req, res)=>{
    let {id} = req.params;
    const listing = await Listing.findById(id);
    res.render("listings/edit.ejs",{ listing });
}));

//Update Route: this takes the data which was submitted through form and update in database
app.put("/listings/:id", validateListing, wrapAsync(async (req, res)=>{
    let { id } = req.params;
    await Listing.findByIdAndUpdate(id, { ...req.body.listing });
    res.redirect(`/listings/${id}`);
}));

//Delete Route: this will delete the individual listing
app.delete("/listings/:id", wrapAsync(async (req, res)=>{
    let { id } = req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    console.log(deletedListing);
    res.redirect("/listings");
}));

//Reviews
//post Route
app.post("/listings/:id/reviews", validateReview, wrapAsync(async(req, res)=> {
    let listing = await Listing.findById(req.params.id);
    let newReview = new Review(req.body.review);
  
    listing.reviews.push(newReview);

    await newReview.save();
    await listing.save();

    res.redirect(`/listings/${listing._id}`)
}));

//404 Handler(catch any route that didn't match above)
//if above path doesn't match then show page not found (means wrong path given)
app.use((req, res, next) => {
    next(new ExpressError(404, "Page Not Found"));
});

//Final Error Handler(this handles all errors forwared using next(err))
app.use((err, req, res, next)=> {
    let { statusCode=500, message="something wen wrong" } = err;
    res.status(statusCode).render("error.ejs", { message });
});

app.listen(8080, (req, res) => {
    console.log("server is listening to port 8080");
});




