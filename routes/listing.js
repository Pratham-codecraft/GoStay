const express = require('express');
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const {isLoggedIn,isOwner,validateListing} = require("../middlewares.js");
const listingController = require("../controllers/listing.js");
const multer = require('multer');
const {storage} = require('../cloudConfig.js');
const upload = multer({storage});

router.route("/")
.get(wrapAsync(listingController.index)
)
.post(isLoggedIn,upload.single('listing[image]'), wrapAsync(listingController.createListing));

//New Route
router.get("/new",isLoggedIn,listingController.rendernewform );

// CHANGE
router.get("/filter/:id", wrapAsync(listingController.filter));
router.get("/search", listingController.search);
// CHANGE END

router.route("/:id")
.get(wrapAsync(listingController.showListing))
.put(isLoggedIn,isOwner,upload.single('listing[image]'),validateListing,  wrapAsync(listingController.updateListing))
.delete(isLoggedIn,isOwner, wrapAsync(listingController.deleteListing));

// //Index Route
// router.get("/",  wrapAsync(listingController.index)
// );



//Show Route
// router.get("/:id",  wrapAsync(listingController.showListing));

//Create Route
// router.post("/",validateListing, wrapAsync(listingController.createListing));

//Edit Route
router.get("/:id/edit",isLoggedIn,isOwner,upload.single('listing[image]'),  wrapAsync(listingController.editListing));

//Update Route
// router.put("/:id",isLoggedIn,isOwner,validateListing,  wrapAsync(listingController.updateListing));

//Delete Route
// router.delete("/:id",isLoggedIn,isOwner, wrapAsync(listingController.deleteListing));



//CHANGE
router.get(
  "/:id/reservelisting",
  isLoggedIn,
  wrapAsync(listingController.reserveListing)
);
//CHANGE END


module.exports = router;