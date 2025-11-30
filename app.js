if(process.env.NODE_ENV != "production") {
    require('dotenv').config();
}

const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError.js");
const session = require("express-session");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");

//require router 
const listingRouter = require("./routes/listing.js");
const reviewRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");



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
    saveUninitialized: true, //saves a new session even if it has no data in it yet.
    cookie: {
        expires: Date.now() + 7 * 24 * 60 * 60 * 1000, //delete the cookie after 7 days
        maxAge: 7 * 24 * 60 * 60 * 1000, //keeps this cookie for 7days from whenever it was created
        httpOnly: true //protect session id. security(helps protect against xss attacks)
    }
};

// //root route
// app.get("/", (req, res)=>{
//     res.send("Hi, I am root");
// });

//express session 
app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize()); //middleware that initialize the passport
app.use(passport.session()); //connects passport with session middleware.(To identify users as they browse from page to page.)
passport.use(new LocalStrategy(User.authenticate())); //User.authenticate is a ready-made function that checks username/email and password

passport.serializeUser(User.serializeUser());//storing user data in session(if user login then we need to serialize the user) 
passport.deserializeUser(User.deserializeUser()); //removing user data from session(if user finish it's session then we need to deserialize the user)

//midleware: variable which are used in ejs template to access data
app.use((req, res, next)=> {
    res.locals.successMsg = req.flash("success");
    res.locals.errorMsg = req.flash("error");
    res.locals.currUser = req.user;
    next();
});

//this is just demo route
//route: here we create new user and store into database
// app.get("/demoUser", async (req, res)=> {
//     let fakeUser = new User({
//         email: "student@gmail.com",
//         username: "delta-student"
//     });
//     let registeredUser = await User.register(fakeUser, "password"); //passport local mongoose handles hashing
//     res.send(registeredUser);
// });

//express middleware mounting
//this below code tells express that for any route that starts with /listings, user the router called listings which is required above from router/listing.js
app.use("/listings", listingRouter);
app.use("/listings/:id/reviews", reviewRouter);
app.use("/", userRouter);

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




