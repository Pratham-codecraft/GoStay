if(process.env.NODE_ENV != "production") {
  require("dotenv").config();
}

const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
// const MONGO_URL = "mongodb://127.0.0.1:27017/GoStay";
const dbUrl=process.env.ATLASDB_URL;

const session = require("express-session");
const MongoStore = require('connect-mongo');
const flash = require("connect-flash");
const cors = require('cors');
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");


const listings= require("./routes/listing.js");
const reviews = require("./routes/review.js");
const user = require("./routes/user.js");


main()
  .then(() => {
    console.log("connected to DB");
  })
  .catch((err) => {
    console.log(err);
  });

async function main() {
  await mongoose.connect(dbUrl);
}

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);
app.use(express.static(path.join(__dirname, "/public")));
app.use(cors()); // Allow all origins


const store= MongoStore.create({
  mongoUrl:dbUrl,
  crypto:{
    secret:process.env.SECRET,
  },
  touchAfter:24*3600,
});

store.on("error",()=>{
  console.log("ERROR in MONGO SESSION STORE",err);
})

const sessionOptions = {
  store,
  secret:process.env.SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: {
    expires: Date.now() + 1000 * 60 * 60 * 24*7, // 7 day
    maxAge: 1000 * 60 * 60 * 24*7, // 7 day
    httpOnly: true, // Helps prevent XSS attacks
  },
};




app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.currUser = req.user;
  next();
});


app.get("/", (req, res) => {
  res.render("listings/home.ejs");
});

app.use("/listings", listings);
//REviews
app.use("/listings/:id/reviews", reviews);
app.use("/users", user);

// app.get("/testListing", async (req, res) => {
//   let sampleListing = new Listing({
//     title: "My New Villa",
//     description: "By the beach",
//     price: 1200,
//     location: "Calangute, Goa",
//     country: "India",
//   });

//   await sampleListing.save();
//   console.log("sample was saved");
//   res.send("successful testing");
// });
// app.all("*", (req, res,next) => {
//   next(new ExpressError("Page Not Found", 404));  
// });
app.use((err, req, res, next) => {
  let {message="something went wrong",statusCode=500} = err;
  res.render("error.ejs", {message, statusCode});
});


app.listen(8080, () => {
  console.log("server is listening to port 8080");
});