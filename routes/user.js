const express = require('express');
const router = express.Router();
const wrapAsync = require('../utils/wrapAsync.js');
const passport = require("passport");
const { saveRedirectUrl } = require('../middlewares.js');
const userController = require("../controllers/user.js");


router.route("/signup")
.get( userController.renderSignupForm)
.post( wrapAsync(userController.signup));

// router.get("/signup", userController.renderSignupForm);

// // Handle user signup
// router.post("/signup", wrapAsync(userController.signup));

router.route("/login")
.get(userController.renderLoginForm)
.post(saveRedirectUrl,passport.authenticate("local",{failureRedirect:'/users/login',failureFlash:true}), userController.login);

// router.get("/login", userController.renderLoginForm);

// // Handle user login
// router.post("/login",saveRedirectUrl,passport.authenticate("local",{failureRedirect:'/users/login',failureFlash:true}), userController.login);

// Handle user logout
router.get("/logout", userController.logout);

module.exports = router;