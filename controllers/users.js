const User = require("../models/user.js");

//route: just to render the signup form
module.exports.renderSignupForm = (req, res)=> {
    res.render("users/signup.ejs");
}

//route that takes post request and store data into the database: signup
module.exports.signup = async (req, res)=> {
    try{
        let { username, email, password } = req.body;
        const newUser = new User({email, username });
        const registeredUser = await User.register(newUser, password);
        console.log(registeredUser);
        req.login(registeredUser, (err) => {
            if(err) {
                return next(err);
            }
            req.flash("success", "welcome to travel booking");
            res.redirect("/listings");
        });
    } catch(err) {
        req.flash("error", err.message);
        res.redirect("/signup");
    }

}

//login route: just to render the login form
module.exports.renderLoginForm = (req, res) => {
    res.render("users/login.ejs");
}

//login route that takes post request and check the form filled data from the database
module.exports.login = async (req, res) => {
    req.flash("success", "welcome back to travel booking!")
    let redirectUrl = res.locals.redirectUrl || "/listings";
    res.redirect(redirectUrl)
}

//logout route
module.exports.logout = (req, res) => {
    req.logout((err) => {
        if(err) {
            return next(err);
        }
        req.flash("success", "logged you out!");
        res.redirect("/listings");
    });
}