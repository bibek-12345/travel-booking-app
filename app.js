const express = require("express");
const app = express();
const mongoose = require("mongoose");
const Listing = require("./models/listing.js");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "/views"));
app.use(express.urlencoded({extended:true}));//to parse all the data whichever we are getting from request
app.use(methodOverride('_method')); // override with POST having ?_method=PUT
app.engine("ejs", ejsMate);
app.use(express.static(path.join(__dirname, "/public")));


const MONGO_URL = "mongodb://127.0.0.1:27017/travelDB";
async function main() {
    await mongoose.connect(MONGO_URL);
}
main()
    .then(()=>{
        console.log("connection successful");
    })
    .catch((err)=>{
        console.log(err);
    })

app.get("/", (req, res)=>{
    res.send("Hi, I am root");
});

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

//Index route: to view all the listings
app.get("/listings", async (req, res)=>{
    const allListings = await Listing.find({});
    res.render("listings/index.ejs", { allListings });
});

//New Route: this route gives the form to add the new listing
app.get("/listings/new",(req, res)=>{
    res.render("listings/new.ejs");
})

//Show route: to read the data or view the data 
app.get("/listings/:id", async (req, res) =>{
    let {id} = req.params;
    const listing = await Listing.findById(id);
    res.render("listings/show.ejs",{ listing })
});

//Create Route or post route: 
app.post("/listings", async (req, res)=>{
    let newListing = new Listing(req.body.listing);
    await newListing.save();
    res.redirect("/listings");
});

//Edit Route: it is used to give form to edit in response
app.get("/listings/:id/edit", async (req, res)=>{
    let {id} = req.params;
    const listing = await Listing.findById(id);
    res.render("listings/edit.ejs",{ listing });
});

//Update Route: this takes the data which was submitted through form and update in database
app.put("/listings/:id", async (req, res)=>{
    let { id } = req.params;
    await Listing.findByIdAndUpdate(id, { ...req.body.listing });
    res.redirect(`/listings/${id}`);
});

//Delete Route: this will delete the individual listing
app.delete("/listings/:id", async (req, res)=>{
    let { id } = req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    console.log(deletedListing);
    res.redirect("/listings");
});

app.listen(8080, (req, res) => {
    console.log("server is listening to port 8080");
});