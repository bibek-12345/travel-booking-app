const express = require("express");
const router = express.Router();
const User = require("../models/user.js");
const wrapAsync = require("../utils/wrapAsync");

//route: just to render the form
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

module.exports = router;