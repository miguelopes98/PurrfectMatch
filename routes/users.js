var express = require("express"),
	router = express.Router({mergeParams: true}),
	passport = require("passport"),
	middleware = require("../middleware/index.js"),
	Shelter = require("../models/shelter.js"),
	Dog = require("../models/dog.js"),
	Comment = require("../models/comment.js"),
	Review = require("../models/reviews.js"),
	User = require("../models/user.js");

//SHOW ROUTE - shows user's profile page
router.get("/:userId", function(req, res){
	User.findById(req.params.userId, function(err, foundUser){
		if(err){
			console.log(err);
			req.flash("error", "User not found.");
			return res.redirect("back");
		}
		res.render("users/show.ejs", {user: foundUser});
	})
});

//EDIT ROUTE - shows form to edit user's information
router.get("/:userId/edit", middleware.allUserOwnership, function(req, res){
	User.findById(req.params.userId, function(err, foundUser){
		if(err){
			console.log(err);
			req.flash("error", "User not found.");
			return res.redirect("back");
		}
		return res.render("users/edit.ejs", {user:foundUser});
	});
});

//UPDATE ROUTE - updating to the database
router.post("/:userId", middleware.allUserOwnership, function(req, res){
	if(req.user.role === "shelterUser"){
		Shelter.findOneAndUpdate({name: req.user.name}, req.body.user, function(err, updatedShelter){
			if(err){
				console.log(err);
				req.flash("error", "Wasn't able to find and update user's shelter.");
				return res.redirect("back");
			}
			User.findByIdAndUpdate(req.params.userId, req.body.user, function(err, updatedUser){
				if(err){
					console.log(err);
					req.flash("error", "Wasn't able to find and update user's profile.");
					return res.redirect("back");
				}
				req.flash("success", "User profile and user's shelter updated successfully.");
				return res.redirect("/users/" + req.params.userId);
			});
		});
	}	
});

//DESTROY ROUTE - delete account
router.post("/:userId/delete", middleware.allUserOwnership, function(req, res){
	if(req.user.role === "shelterUser"){
		Shelter.findOneAndRemove({name:req.user.name}).populate("dogs").exec(function(err, foundShelter){
			if(err){
				console.log(err);
				req.flash("error", "Wasn't able to find and remove user's shelter.");
				return res.redirect("back");
			}
			else{
				Dog.find({"_id": {$in: foundShelter.dogs}}, function(err, allDogs){
					if(err){
						console.log(err);
						req.flash("error", "Wasn't able to find and remove the dogs from the user's shelter.");
						return res.redirect("back");
					}
					for(var i = 0; i < allDogs.length; i++){
						Comment.remove({"_id": {$in: allDogs[i].comments}}, function(err){
							if(err){
								console.log(err);
								req.flash("error", "Wasn't able to find and remove the comments of the dogs from the user's shelter.");
								return res.redirect("back");
							}

							Review.remove({"_id": {$in: foundShelter.reviews}}, function (err) {
								if(err){
									console.log(err);
									req.flash("error", "Wasn't able to find and remove reviews from user's shelter.");
									return res.redirect("back");
								}
								else{
									Dog.remove({"_id": {$in: foundShelter.dogs}}, function(err){
										if(err){
											console.log(err);
											req.flash("error", "Wasn't able to find and remove the dogs from the user's shelter.");
											return res.redirect("back");
										}
										else{
											User.remove({"_id": {$in: foundShelter.author.id}}, function(err){
												if(err){
													console.log(err);
													req.flash("error", "Wasn't able to delete account.");
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
					req.flash("error", "Account deleted successfully.");
					return res.redirect("/shelters");
				});
			}
		});
	}
	else{
		User.findByIdAndRemove(req.params.userId, function(err){
			if(err){
				console.log(err);
				req.flash("error", err.message);
				return res.redirect("back");
			}
			req.flash("success", "Account deleted successfully.");
			return res.redirect("/");
		});
	}
});

module.exports = router;