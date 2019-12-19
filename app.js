var express = require("express"),
	app = express(),
	mongoose = require('mongoose'),
	passport = require("passport"),
	bodyParser = require("body-parser"),
	LocalStrategy = require("passport-local"),
	passportLocalMongoose = require("passport-local-mongoose"),
	Shelter = require("./models/shelter.js"),
	Dog = require("./models/dog.js"),
	User = require("./models/user.js");

mongoose.connect("mongodb://localhost:27017/purrfect_match", {useNewUrlParser: true, useUnifiedTopology:true});
//body-parser set up
app.use(bodyParser.urlencoded({extended:true}));
//
app.set("view engine", ".ejs");
app.use(express.static("public"));

//passport (authentication package) set up
app.use(require("express-session")({
	secret: "This is the secret that passport always wants",
	resave: false,
	saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
//for the regular user account
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//PASSING THE USER INFO TO ALL ROUTES
//all routes run this middleware, that says in the respective templates that currentUser = req.user
//we refer to the user as req.user in backEnd and currentUser in the frontEnd templates
app.use(function(req, res, next){
	res.locals.currentUser = req.user;
	//res.locals.error = req.flash("error");
	//res.locals.success = req.flash("success");
	next();
})

//requiring routes
var indexRoutes = require("./routes/index.js"),
	shelterRoutes = require("./routes/shelters.js"),
	dogsRoutes = require("./routes/dogs.js");





//telling express to use the routes that are in the respective files
app.use("/", indexRoutes); //routes non related with mongoose models
app.use("/shelters", shelterRoutes); //routes related with the shelter model
app.use("/", dogsRoutes); //routes related to the comment model, I can't do ("/dogs", dogsRoutes) since the index route is /dogs and the other routes are /shelter/:id/dogs
//app.use("/campgrounds/:id/reviews", reviewRoutes); //routes related to the review model

app.listen(process.env.PORT || 3000);