var express = require("express"),
	router = express.Router({mergeParams: true}),
	passport = require("passport"),
	bodyParser = require('body-parser'),
	Shelter = require("../models/shelter.js"),
	Dog = require("../models/dog.js"),
	User = require("../models/user.js");


//INDEX ROUTE
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
router.post("/", function(req, res){
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

//SHOW ROUTE
router.get("/:id", function(req, res){
	res.render("shelters/show.ejs");
});

//EDIT ROUTE
router.get("/shelters/:id/edit", function(req, res){
	res.render("shelters/edit.ejs");
});

//UPDATE ROUTE
router.post("/shelters/:id", function(req, res){
	res.redirect("/" + req.params.id);
});


//DESTROY ROUTE
router.post("/shelters/:id/delete", function(req, res){
	res.redirect("/");
});



module.exports = router;