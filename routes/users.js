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
			return res.redirect("back");
		}
		res.render("users/show.ejs", {user: foundUser});
	})
});

//EDIT ROUTE - shows form to edit user's information
router.get("/:userId/edit", middleware.userOwnership, function(req, res){
	User.findById(req.params.userId, function(err, foundUser){
		if(err){
			console.log(err);
			return res.redirect("back");
		}
		return res.render("users/edit.ejs", {user:foundUser});
	});
});

//UPDATE ROUTE - updating to the database
router.post("/:userId", middleware.userOwnership, function(req, res){
	User.findByIdAndUpdate(req.params.userId, req.body.user, function(err, updatedUser){
		if(err){
			console.log(err);
			return res.redirect("back");
		}
		return res.redirect("/users/" + req.params.userId);
	});
});

//DESTROY ROUTE - delete account
router.post("/:userId/delete", middleware.userOwnership, function(req, res){
	User.findByIdAndRemove(req.params.userId, function(err){
		if(err){
			console.log(err);
			return res.redirect("back");
		}
		return res.redirect("/");
	});
});

module.exports = router;