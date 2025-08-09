const User = require('../models/user.js');

module.exports.renderSignupForm = (req, res) => {
  res.render("users/signup.ejs");
};
module.exports.signup = async (req, res) => {
    try{
        let { username, email, password } = req.body;
        const newUser = new User({ username, email });
        const registeredUser = await User.register(newUser, password);
        console.log(registeredUser);
        req.login(registeredUser, (err) => {
            if (err) {
                console.error("Login error:", err);
                req.flash("error", "An error occurred while logging in.");
                return res.redirect("/users/signup");
            }
            req.flash("success", "Welcome to GoStay!");
            res.redirect("/listings");
        });
        
    }
    catch(e){
        req.flash("error", e.message);
        res.redirect("/users/signup");
    }
};

module.exports.renderLoginForm = (req, res) => {
    res.render("users/login.ejs");
};

module.exports.login = async(req, res) => {
    req.flash("success", "Welcome back to GoStay, Enjoy Your Stay!");
    res.redirect(res.locals.redirectUrl || "/listings");
};

module.exports.logout = (req, res) => {
    req.logout((err) => {
        if (err) {
            console.error("Logout error:", err);
            req.flash("error", "An error occurred while logging out.");
            return res.redirect("/listings");
        }
        req.flash("success", "Logged out successfully!");
        res.redirect("/listings");
    });
};