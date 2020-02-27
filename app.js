require('dotenv').config();

var express = require("express"),
	app = express(),
	mongoose = require('mongoose'),
	passport = require("passport"),
	bodyParser = require("body-parser"),
	flash = require("connect-flash"),
	LocalStrategy = require("passport-local"),
	passportLocalMongoose = require("passport-local-mongoose"),
	Shelter = require("./models/shelter.js"),
	Dog = require("./models/dog.js"),
	Comment = require("./models/comment.js"),
	Review = require("./models/reviews.js"),
	Message = require("./models/message.js"),
	User = require("./models/user.js");

mongoose.connect(process.env.DATABASEURL, {useNewUrlParser: true, useUnifiedTopology:true});
//body-parser set up
app.use(bodyParser.urlencoded({extended:true}));
//
app.set("view engine", ".ejs");
app.use(express.static("public"));

//setting up flash messages (still a bit of set up bellow)
app.use(flash());
//moment, so we can delay the time a user has to wait if fail to login and such
app.locals.moment = require("moment");

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
//setting up what the message of req.flash is
app.use(function(req, res, next){
	res.locals.currentUser = req.user;
	res.locals.error = req.flash("error");
	res.locals.success = req.flash("success");
	next();
})

//requiring routes
var indexRoutes = require("./routes/index.js"),
	shelterRoutes = require("./routes/shelters.js"),
	dogsRoutes = require("./routes/dogs.js"),
	reviewRoutes = require("./routes/reviews.js"),
	userRoutes = require("./routes/users.js"),
	messageRoutes = require("./routes/messages.js"),
	commentRoutes = require("./routes/comments.js");





//telling express to use the routes that are in the respective files
app.use("/", indexRoutes); //routes non related with mongoose models
app.use("/shelters", shelterRoutes); //routes related with the shelter model
app.use("/", dogsRoutes); //routes related to the comment model, I can't do ("/dogs", dogsRoutes) since the index route is /dogs and the other routes are /shelter/:id/dogs
app.use("/shelters/:id/dogs/:dogId/comments", commentRoutes); //routes related with the comment model
app.use("/shelters/:id/reviews", reviewRoutes); //routes related to the review model
app.use("/users", userRoutes); //routes related to the user model
app.use("/users/:userId/messages", messageRoutes); //routes related to the message model

app.listen(process.env.PORT || 3000);