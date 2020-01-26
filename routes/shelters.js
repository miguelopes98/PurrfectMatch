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

//INDEX - show all shelters
router.get("/", function(req, res){
	var perPage = 8;
    var pageQuery = parseInt(req.query.page);
    var pageNumber = pageQuery ? pageQuery : 1;
    var noMatch = null;
    if(req.query.search) {
        const regex = new RegExp(escapeRegex(req.query.search), 'gi');
        // Get the shelters that match the search from DB
        Shelter.find({name: regex}).skip((perPage * pageNumber) - perPage).limit(perPage).exec(function(err, allShelters){
			Shelter.count({name: regex}).exec(function(err, count){
				if(err){
				   console.log(err);
				   req.flash("error", "Shelter/Shelters not found.");
			   } else {
				  if(allShelters.length < 1) {
					  noMatch = "No shelters match that search, please try again.";
				  }
				  res.render("shelters/index",{
					shelters:allShelters,
					noMatch: noMatch,
					current: pageNumber,
					pages: Math.ceil(count / perPage),
					search: req.query.search
				  });
			   }
			}) 
        });
    } 
	else
	{
        //Get all shelters from DB
		//Shelter.find() vai correr e tudo o que encontrar vai guardar em allShelters
		Shelter.find({}).skip((perPage * pageNumber) - perPage).limit(perPage).exec(function (err, allShelters) {
			Shelter.count().exec(function (err, count) {
				if (err) {
					console.log(err);
					req.flash("error", "Shelter/Shelters not found.");
					res.redirect("back");
				} else {
					res.render("shelters/index", {
						shelters: allShelters,
						current: pageNumber,
						pages: Math.ceil(count / perPage),
						noMatch: noMatch,
						search: req.query.search
					});
				}
			});
		});
    }
});

//NEW ROUTE - we have none, when a shelter's account is created, we ask for the informations of the shelter and the shelter gets created automatically and added to the shelters index page. the form that asks for the info to create de account sends a post request to /shelters

//CREATE ROUTE - once a shelters account is created, we automatically create a shelter and add it to the shelters index page, the 'create account' button redirects here
//needs to be logged in on a shelterUser type account
router.post("/", middleware.isLoggedIn, middleware.shelterUser, function(req, res){
	//once the user creates the shelter account with all the information necessary, we redirect as a post to this route so we can create the respective shelter object automatically
	var newShelter = new Shelter({
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
			req.flash("error", "Wasn't able to create shelter.");
			return res.redirect("/resgister/shelter");
		}
		shelter.author.id = req.user._id;
		shelter.author.username = req.user.username;
		shelter.save();
		req.flash("success", "Account and shelter created successfully.");
		res.redirect("/shelters/" + shelter.id);
	});
});

//SHOW ROUTE - shows more information about one shelter
router.get("/:id", function(req, res){
	Shelter.findById(req.params.id).populate("dogs reviews").exec(function(err, foundShelter){
		if(err){
			console.log(err);
			req.flash("error", "Shelter not found.");
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
			req.flash("error", "Shelter not found.");
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
			req.flash("error", "Shelter not found.");
			return res.redirect("back");
		}
		User.findByIdAndUpdate(updatedShelter.author.id, req.body.shelter, function(err, updatedUser){
			if(err){
				console.log(err);
				req.flash("error", "Wasn't able to update your account profile.");
				return res.redirect("back");
			}
			req.flash("success", "Shelter updated successfully.");
			return res.redirect("/shelters/" + req.params.id);
		});
	});
});


//DESTROY ROUTE - deletes the shelter account, the shelter object, and all associated dogs, comments and reviews.
//needs a isloggedIn and a checkShelterOwnership middleware
router.post("/:id/delete", middleware.isLoggedIn, middleware.checkShelterOwnership, function(req, res){
	//gotta delete user account, respective shelter, associated dogs, associated comments to dogs, associated reviews to shelter and cloudinary images
	Shelter.findByIdAndRemove(req.params.id).populate("dogs").exec(function(err, foundShelter){
		if(err){
			console.log(err);
			req.flash("error", "Shelter not found.");
			return res.redirect("back");
		}
		else{
			Dog.find({"_id": {$in: foundShelter.dogs}}, function(err, allDogs){
				if(err){
					console.log(err);
					req.flash("error", "Wasn't able to find and delete shelter's dogs.");
					return res.redirect("back");
				}
				for(var i = 0; i < allDogs.length; i++){
					Comment.remove({"_id": {$in: allDogs[i].comments}}, function(err){
						if(err){
							console.log(err);
							req.flash("error", "Wasn't able to delete the comments of a shelter's dog(s).");
							return res.redirect("back");
						}

						Review.remove({"_id": {$in: foundShelter.reviews}}, function (err) {
							if(err){
								console.log(err);
								req.flash("error", "Wasn't able to delete shelter's reviews.");
								return res.redirect("back");
							}
							else{
								Dog.remove({"_id": {$in: foundShelter.dogs}}, function(err){
									if(err){
										console.log(err);
										req.flash("error", "Wasn't able to delete shelter's dogs.");
										return res.redirect("back");
									}
									else{
										User.remove({"_id": {$in: foundShelter.author.id}}, function(err){
											if(err){
												console.log(err);
												req.flash("error", "Wasn't able to delete your account.");
												return res.redirect("back");
											}
										});
									}
								});
							}
						});
					});
				}
				foundShelter.remove();
				req.flash("success", "Account deleted successfully.");
				return res.redirect("/shelters");
			});
		}
	});
});

//function that we're going to call on the index route to do the fuzzy search
function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};

module.exports = router;