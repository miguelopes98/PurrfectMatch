var express = require("express"),
	router = express.Router({mergeParams: true}),
	passport = require("passport"),
	bodyParser = require('body-parser'),
	middleware = require("../middleware/index.js"),
	Shelter = require("../models/shelter.js"),
	Dog = require("../models/dog.js"),
	Comment = require("../models/comment.js"),
	Review = require("../models/reviews.js"),
	User = require("../models/user.js");


//INDEX ROUTE - shows all existing shelters and fuzzy search
router.get("/", function(req,res){
	Shelter.find({}, function(err, allShelters){
		if(err){
			console.log(err);
			return res.redirect("back");
		}
		res.render("../views/shelters/index.ejs", {shelters: allShelters});
	});
});

//NEW ROUTE - we have none, when a shelter's account is created, we ask for the informations of the shelter and the shelter gets created automatically and added to the shelters index page. the form that asks for the info to create de account sends a post request to /shelters

//CREATE ROUTE - once a shelters account is created, we automatically create a shelter and add it to the shelters index page, the 'create account' button redirects here
//needs to be logged in on a shelterUser type account
router.post("/", middleware.isLoggedIn, middleware.shelterUser, function(req, res){
	//once the user creates the shelter account with all the information necessary, we redirect as a post to this route so we can create the respective shelter object automatically
	var newShelter = new Shelter({
			author: {
				id: req.user._id,
				username: req.user.username
			},
			name: req.user.name,
			address: req.user.address,
			avatar: req.user.avatar,
			description: req.user.description,
			email: req.user.email,
			phoneNumber: req.user.phoneNumber,
			schedule: req.user.schedule,
			websiteUrl: req.user.websiteUrl
	});
	Shelter.create(newShelter, function(err, shelter){
		if(err){
			console.log(err);
			return res.redirect("/resgister/shelter");
		}
		res.redirect("/shelters/" + shelter.id);
	});
});

//SHOW ROUTE - shows more information about one shelter
router.get("/:id", function(req, res){
	Shelter.findById(req.params.id).populate("dogs reviews").exec(function(err, foundShelter){
		if(err){
			console.log(err);
			return res.redirect("/shelters");
		}
		res.render("shelters/show.ejs", {shelter: foundShelter});
	});
});

//EDIT ROUTE - shows form to edit an existing shelter
//needs a isloggedIn and a check Shelter ownership middleware
router.get("/:id/edit", middleware.isLoggedIn, middleware.checkShelterOwnership, function(req, res){
	Shelter.findById(req.params.id, function(err, foundShelter){
		if(err){
			console.log(err);
			return res.redirect("back");
		}
		res.render("shelters/edit.ejs", {shelter: foundShelter});
	});
});

//UPDATE ROUTE - handles the update of the shelter in database
//needs a isloggedIn and a check Shelter ownership middleware
router.post("/:id", middleware.isLoggedIn, middleware.checkShelterOwnership, function(req, res){
	Shelter.findByIdAndUpdate(req.params.id, req.body.shelter, function(err, updatedShelter){
		if(err){
			console.log(err);
			return res.redirect("back");
		}
		res.redirect("/shelters/" + req.params.id);
	});
});


//DESTROY ROUTE - deletes the shelter account, the shelter object, and all associated dogs, comments and reviews.
//needs a isloggedIn and a checkShelterOwnership middleware
router.post("/:id/delete", middleware.isLoggedIn, middleware.checkShelterOwnership, function(req, res){
	//gotta delete user account, respective shelter, associated dogs, associated comments to dogs, associated reviews to shelter and cloudinary images
	res.redirect("/shelters/");
});



module.exports = router;