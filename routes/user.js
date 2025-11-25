const express = require("express");
const router = express.Router();
const User = require("../models/user.js");
const wrapAsync = require("../utils/wrapAsync");
const passport = require("passport");

//route: just to render the signup form
router.get("/signup", (req, res)=> {
    res.render("users/signup.ejs");
});

//route that takes post request and store data into the database
router.post("/signup", wrapAsync(async (req, res)=> {
    try{
        let { username, email, password } = req.body;
        const newUser = new User({email, username });
        const registeredUser = await User.register(newUser, password);
        console.log(registeredUser);
        req.flash("success", "welcome to travel booking");
        res.redirect("/listings");
    } catch(err) {
        req.flash("error", err.message);
        res.redirect("/signup");
    }

}));

//route: just to render the login form
router.get("/login", (req, res) => {
    res.render("users/login.ejs");
});

//route that takes post request and check the form filled data from the database
router.post("/login", passport.authenticate("local", { failureRedirect: "/login", failureFlash: true }), async (req, res) => {
    req.flash("success", "welcome back to travel booking!")
    res.redirect("/listings");
});

module.exports = router;