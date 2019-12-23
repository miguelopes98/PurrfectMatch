var express = require("express"),
	router = express.Router({mergeParams: true}),
	passport = require("passport"),
	bodyParser = require('body-parser'),
	Shelter = require("../models/shelter.js"),
	Dog = require("../models/dog.js"),
	Comment = require("../models/comment.js"),
	Review = require("../models/reviews.js"),
	User = require("../models/user.js");

//INDEX ROUTE - shows reviews for a specific shelter
router.get("/", function(req, res){
	res.render("reviews/index.ejs");
});

//NEW ROUTE - shows form to create new review
router.get("/new", function(req, res){
	Shelter.findById(req.params.id, function(err, foundShelter){
		if(err){
			console.log(err);
			return res.redirect("back");
		}
		res.render("reviews/new.ejs", {shelter: foundShelter});
	});
});

//CREATE ROUTE - creates a new review
router.post("/", function(req, res){
	Shelter.findById(req.params.id, function(err,foundShelter){
		if(err){
			console.log(err);
			return res.redirect("back");
		}
		Review.create(req.body.review, function(err, newReview){
			newReview.author.id = req.user._id;
			newReview.author.username = req.user.username;
			newReview.shelter = foundShelter._id;
			newReview.save();
			foundShelter.reviews.push(newReview);
			foundShelter.save();
			res.redirect("/shelters/" + req.params.id);
		});
	});
});

//EDIT ROUTE - shows form to edit a review
router.get("/:reviewId/edit", function(req, res){
	res.render("reviews/edit.ejs");
});

//UPDATE ROUTE - updates a review
router.post("/:reviewId", function(req, res){
	res.redirect("/shelters/" + req.params.id);
});

//DESTROY ROUTE - deletes a review
router.post("/:reviewId/delete", function(req, res){
	res.redirect("/shelters/" + req.params.id);
});


module.exports = router;