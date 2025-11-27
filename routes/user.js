const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync");
const passport = require("passport");
const { saveRedirectUrl } = require("../middleware.js");
const userController = require("../controllers/users.js");

//route: just to render the signup form
router.get("/signup", userController.renderSignupForm);

//route that takes post request and store data into the database, signup
router.post("/signup", wrapAsync(userController.signup));

//login route: just to render the login form
router.get("/login", userController.renderLoginForm);

//login route that takes post request and check the form filled data from the database
router.post("/login", saveRedirectUrl, passport.authenticate("local", { failureRedirect: "/login", failureFlash: true }), userController.login);

//logout route
router.get("/logout", userController.logout);

module.exports = router;