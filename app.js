const express = require("express");
const app = express();
const mongoose = require("mongoose");
const Listing = require("./models/listing.js");

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
app.get("/testListing", async (req, res)=>{
    let sampleListing = new Listing({
        title: "My New Villa",
        description: "By the beach",
        price: 150,
        location: "Toronto, Ontario",
        country: "Canada",
    });
    await sampleListing.save();
    console.log("sample was saved");
    res.send("Successful Testing");
});

app.listen(8080, (req, res) => {
    console.log("server is listening to port 8080");
});