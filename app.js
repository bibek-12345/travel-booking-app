const express = require("express");
const app = express();
const mongoose = require("mongoose");
const Listing = require("./models/listing.js");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const wrapAsync = require("./utils/wrapAsync.js");
const ExpressError = require("./utils/ExpressError.js");
const { listingSchema, reviewSchema } = require("./schema.js");  //joi validation schema.js(server side validation)
const Review = require("./models/review.js");
const listings = require("./routes/listing.js");


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

//root route
app.get("/", (req, res)=>{
    res.send("Hi, I am root");
});

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

//express middleware mounting
//this below code tells express that for any route that starts with /listings, user the router called listings which is required above from router/listing.js
app.use("/listings", listings);

//post Review Route
app.post("/listings/:id/reviews", validateReview, wrapAsync(async(req, res)=> {
    let listing = await Listing.findById(req.params.id);
    let newReview = new Review(req.body.review);
  
    listing.reviews.push(newReview);

    await newReview.save();
    await listing.save();

    res.redirect(`/listings/${listing._id}`)
}));

//Delete Review Route
app.delete("/listings/:id/reviews/:reviewId", wrapAsync(async (req, res)=> {
    let { id, reviewId } = req.params;
    await Listing.findByIdAndUpdate(id, {$pull: {reviews: reviewId}}); //pull means remove data from an array, remove the reviewsId whichever matched with reviews inside array
    await Review.findByIdAndDelete(reviewId);
    res.redirect(`/listings/${id}`);
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




