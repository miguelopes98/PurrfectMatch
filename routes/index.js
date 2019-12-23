var express = require("express"),
	router = express.Router({mergeParams: true}),
	passport = require("passport"),
	Shelter = require("../models/shelter.js"),
	Dog = require("../models/dog.js"),
	Comment = require("../models/comment.js"),
	Review = require("../models/reviews.js"),
	User = require("../models/user.js");


//root route
router.get("/", function(req, res){
	res.render("landing.ejs");
});

//Asks the user what type of account he wants to create, normal or shelter account
router.get("/register", function(req, res){
	res.render("registerQuestion.ejs");
});

//shows form to create a user account
router.get("/register/user", function(req, res){
	res.render("registerUser");
});

//handling user sign up logic
router.post("/register/user", function(req, res){
	var newUser = new User(
	{
		username: req.body.username,
		firstName: req.body.firstName,
		lastName: req.body.lastName,
		avatar: req.body.avatar,
		description: req.body.description,
		email: req.body.email,
		role: "user"
	});
	User.register(newUser, req.body.password, function(err, user){
		if(err){
			console.log(err)
			return res.redirect("/resgister/user");
		}
		//if we successfully register the user, we log them in automatically and send them to /dogs
		passport.authenticate("local")(req, res, function(){
			res.redirect("/dogs");
		});
	});
});

//shows form to create a shelter account
router.get("/register/shelter", function(req, res){
	res.render("registerShelter");
});

//properly handle shelter account registering
router.post("/register/shelter", function(req, res){
	//we create the shelter's account and straight after that, we create the shelter's object to add to the index page
	var newShelterUser = new User(
	{
		username: req.body.username,
		name: req.body.name,
		address: req.body.address,
		avatar: req.body.avatar,
		description: req.body.description,
		email: req.body.email,
		phoneNumber: req.body.phoneNumber,
		schedule: req.body.schedule,
		websiteUrl: req.body.websiteUrl,
		role: "shelterUser"
	});
	
	User.register(newShelterUser, req.body.password, function(err, user){
		if(err){
			console.log(err)
			return res.redirect("/resgister/shelter");
		}
		//if we successfully register the shelter account, we log them in automatically, then we redirect them to create the respective shelter object and send a post request to /shelters so the shelter object is created with the information we already have
		passport.authenticate("local")(req, res, function(){
			// the first param is to send a post request instead of a get
			res.redirect(307, "/shelters");
		});
	});
});

//shows login form
router.get("/login", function(req, res){
	res.render("login.ejs");
});

//handling login logic
router.post("/login", passport.authenticate("local", {
		successRedirect: "/shelters",
		failureRedirect: "/login"
	}), function(req, res){
});

//logout route
router.get("/logout", function(req, res){
	req.logout();
	res.redirect("/");
});

module.exports = router;