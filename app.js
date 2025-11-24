const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError.js");
const session = require("express-session");

const listings = require("./routes/listing.js");
const reviews = require("./routes/review.js");


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

//defining the session options
const sessionOptions = {
    secret: "mysupersecretstring", //signs cookie to prevent tempering.
    resave: false, //save only if session data changed
    saveUninitialized: true //saves a new session even if it has no data in it yet.
};

//express session middleware
app.use(session(sessionOptions));


//root route
app.get("/", (req, res)=>{
    res.send("Hi, I am root");
});

//express middleware mounting
//this below code tells express that for any route that starts with /listings, user the router called listings which is required above from router/listing.js
app.use("/listings", listings);
app.use("/listings/:id/reviews", reviews);


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




