const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync");
const passport = require("passport");
const { saveRedirectUrl } = require("../middleware.js");
const userController = require("../controllers/users.js");

router.route("/signup")
    .get(userController.renderSignupForm) //route: just to render the signup form
    .post(wrapAsync(userController.signup)); //route that takes post request and store data into the database, signup


router.route("/login")
    .get(userController.renderLoginForm)  //login route: just to render the login form
    .post(saveRedirectUrl, passport.authenticate("local", { failureRedirect: "/login", failureFlash: true }), userController.login); //login route that takes post request and check the form filled data from the database

//logout route
router.get("/logout", userController.logout);

module.exports = router;