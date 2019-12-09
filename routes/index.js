var express = require("express"),
	router = express.Router({mergeParams: true}),Shelter = require("./models/shelters.js"),
	Dog = require("./models/dogs.js"),
	User = require("./models/user.js"),
	shelterUser = require("./models/shelterUser.js");


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

//handling user sign up login
router.post("/register/user", function(req, res){
	//fix the redirect url afterwards
	res.redirect(/*"/shelters/:id/dogs/:dogId"*/);
});

//shows form to create a shelter account
router.get("/register/shelter", function(req, res){
	res.render("registerShelter");
});


module.exports = router;