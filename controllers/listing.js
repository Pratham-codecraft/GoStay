const Listing = require("../models/listing");
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapToken = process.env.MAP_TOKEN;
const geoCodingClient = mbxGeocoding({ accessToken: mapToken });


module.exports.index=(async (req, res) => {
  const allListings = await Listing.find({});
  res.render("listings/index.ejs", { allListings });
});

module.exports.rendernewform=(req, res) => {
  if(!req.isAuthenticated()) {
    req.flash("error", "You must be logged in to create a listing!");
    return res.redirect("/users/login");
  }
  res.render("listings/new.ejs");
};

module.exports.showListing=async (req, res) => {

  let { id } = req.params;
  const listing = await Listing.findById(id).populate({path:"reviews",
    populate:{path:"author"}
  }).populate("owner");
  if(!listing) {
    req.flash("error", "Listing you requested does not exist!");
    res.redirect("/listings");
  }
  res.render("listings/show.ejs", { listing });
};

module.exports.createListing = async (req, res, next) => {
  let response = await geoCodingClient
    .forwardGeocode({
      query: req.body.listing.location,
      limit: 1,
    })
    .send();

  let url = req.file.path;
  let filename = req.file.filename;

  const newListing = new Listing(req.body.listing);
  newListing.owner = req.user._id;
  newListing.image = { filename, url };
  newListing.geometry = response.body.features[0].geometry;
  await newListing.save();
  req.flash("success", "New listing created!");
  res.redirect("/listings");
};

module.exports.editListing=async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id);
  if(!listing) {
    req.flash("error", "Listing you requested does not exist!");
    res.redirect("/listings");
  }

  let originalImageUrl=listing.image.url;
  originalImageUrl=originalImageUrl.replace("/upload", "/upload/h_300,w_300");

  res.render("listings/edit.ejs", { listing,originalImageUrl });
};

module.exports.updateListing = async (req, res, next) => {
  let { id } = req.params;
  let response = await geoCodingClient
    .forwardGeocode({
      query: ` ${req.body.listing.location},${req.body.listing.country}`,
      limit: 1,
    })
    .send();

  req.body.listing.geometry = response.body.features[0].geometry;
  let updatedListing = await Listing.findByIdAndUpdate(id, {
    ...req.body.listing,
  });

  if (typeof req.file !== "undefined") {
    let url = req.file.path;
    let filename = req.file.filename;
    updatedListing.image = { url, filename };
    await updatedListing.save();
  }
  req.flash("success", "Listing updated!");
  res.redirect(`/listings/${id}`);
};

//CHANGE
module.exports.filter = async (req, res, next) => {
  try {
    const { id } = req.params;
    // If category is an array, use $in instead of direct equality
    const allListings = await Listing.find({ category: id });
    if (allListings.length > 0) {
      res.locals.success = `Listings Filtered by ${id}!`;
      return res.render("listings/index.ejs", { allListings });
    }
    req.flash("error", `There are no listings for category "${id}"!`);
    return res.redirect("/listings");
  } catch (err) {
    next(err);
  }
};

module.exports.search = async (req, res, next) => {
  try {
    let input = req.query.q;
    if (!input || input.trim() === "") {
      req.flash("error", "Please enter a search query!");
      return res.redirect("/listings");
    }
    const element = input.trim(); // no capitalization needed, regex is case-insensitive

    // Search in title
    let allListings = await Listing.find({
      title: { $regex: element, $options: "i" },
    });

    if (allListings.length > 0) {
      res.locals.success = "Listings searched by Title!";
      return res.render("listings/index.ejs", { allListings });
    }

    // Search in category
    allListings = await Listing.find({
      category: { $regex: element, $options: "i" },
    }).sort({ _id: -1 });
    if (allListings.length > 0) {
      res.locals.success = "Listings searched by Category!";
      return res.render("listings/index.ejs", { allListings });
    }

    // Search in country
    allListings = await Listing.find({
      country: { $regex: element, $options: "i" },
    }).sort({ _id: -1 });
    if (allListings.length > 0) {
      res.locals.success = "Listings searched by Country!";
      return res.render("listings/index.ejs", { allListings });
    }

    // Search in location
    allListings = await Listing.find({
      location: { $regex: element, $options: "i" },
    }).sort({ _id: -1 });
    if (allListings.length > 0) {
      res.locals.success = "Listings searched by Location!";
      return res.render("listings/index.ejs", { allListings });
    }

    // Search by price if input is integer
    const intValue = parseInt(element, 10);
    if (!isNaN(intValue)) {
      allListings = await Listing.find({ price: { $lte: intValue } }).sort({
        price: 1,
      });
      if (allListings.length > 0) {
        res.locals.success = `Listings with price less than or equal to Rs ${intValue}!`;
        return res.render("listings/index.ejs", { allListings });
      }
    }

    req.flash("error", "No listings found based on your search!");
    return res.redirect("/listings");
  } catch (err) {
    next(err);
  }
};


//CHANGE END

module.exports.deleteListing=async (req, res) => {
  let { id } = req.params;
  let deletedListing = await Listing.findByIdAndDelete(id);
  console.log(deletedListing);
  req.flash("Sucess", "New listing Deleted successfully!");
  res.redirect("/listings");
};

//CHANGE
module.exports.reserveListing = async (req, res) => {
  let { id } = req.params;
  req.flash("success", "Reservation Details sent to your Email!");
  res.redirect(`/listings/${id}`);
};
//CHANGE END