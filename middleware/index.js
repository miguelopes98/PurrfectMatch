var Shelter = require("../models/shelter.js"),
	Dog = require("../models/dog.js"),
	User = require("../models/user.js"),
	Comment = require("../models/comment.js"),
	Review = require("../models/reviews.js");

//EXPRESS BRUTE SET UP
const ExpressBrute = require("express-brute");
const MongooseStore = require("express-brute-mongoose");
const BruteForceSchema = require("express-brute-mongoose/dist/schema");
const mongoose = require("mongoose");
var moment = require('moment');

var model = mongoose.model("bruteforce", new mongoose.Schema(BruteForceSchema));
var store = new MongooseStore(model);

//we're creating a middleware object to add a bunch of methods and export that object to the routes files
var middleware = {};

//WRITING THE BRUCE FORCE PREVENTION MIDDLEWARE...
var failCallback = function (req, res, next, nextValidRequestDate) {
    req.flash('error', "You've made too many failed attempts in a short period of time, please try again " + moment(nextValidRequestDate).fromNow());
    res.redirect('/login'); // brute force protection triggered, send them back to the login page
};

var handleStoreError = function (error) {
    log.error(error); // log this error so we can figure out what went wrong
    // cause node to exit, hopefully restarting the process fixes the problem
    throw {
        message: error.message,
        parent: error.parent
    };
}

// Start slowing requests after 5 failed attempts to do something for the same user
middleware.userBruteforce = new ExpressBrute(store, {
    freeRetries: 3,
    minWait: 5*60*1000, // 5 minutes
    maxWait: 60*60*1000, // 1 hour,
	lifetime: 24*60*60, //1 day
    failCallback: failCallback,
    handleStoreError: handleStoreError,
	attachResetToRequest: true
});
middleware.bruteforce = new ExpressBrute(store);

//isLoggedIn middleware - checks if a user is logged in
middleware.isLoggedIn = function(req, res, next){
	if(req.isAuthenticated()){
		return next();
	}
	console.log("you need to be logged in to do this");
	req.flash("error", "You need to be logged in to do that.");
	return res.redirect("/login");
}

//checkShelterOwnership - checks if a user is the owner of a shelter
middleware.checkShelterOwnership = function(req, res, next){
	//if user is logged in
	if(req.isAuthenticated()){
		Shelter.findById(req.params.id, function(err, foundShelter){
			if(err){
				console.log(err);
				req.flash("error", "Shelter not found.");
				return res.redirect("back");
			}
			console.log(foundShelter);
			console.log(foundShelter.author);
			console.log(foundShelter.author.id);
			console.log(req.user._id);
			console.log(foundShelter.author.id.equals(req.user._id));
			//check if user is owner of shelter
			if(foundShelter.author.id.equals(req.user._id)){
				return next();
			}
			//if user isn't the author of this shelter
			console.log("you need to be the owner of this shelter to do this");
			req.flash("error", "You need to be the owner of this shelter to do that.");
			return res.redirect("back");
		});
	}
	else{
		//if not logged in return to login
		console.log("you need to be logged in to do this");
		req.flash("error", "You need to be logged in to do that.");
		return res.redirect("/login");
	}
}

//checkCommentOwnership - checks if a user is the owner of a comment
middleware.checkCommentOwnership = function(req, res, next){
	//if the user logged in
	if(req.isAuthenticated()){
		Comment.findById(req.params.commentId, function(err, foundComment){
			if(err){
				console.log(err);
				req.flash("error", "Comment not found.");
				return res.redirect("back");
			}
			//if logged in user is the owner of the comment
			if(foundComment.author.id.equals(req.user._id)){
			   return next();
			}
			//if user is not the owner of the owner of the comment
			console.log("you need to be the owner of this comment to do that");
			req.flash("error", "You need to be the author of that comment to do that.");
			return res.redirect("back");
		});
	}
	else{
		//if not, redirect them to login
		console.log("you need to be logged in to do this");
		req.flash("error", "You need to be logged in to do that.");
		return res.redirect("/login");
	}
}

//checkReviewOwnership - checks if a user is the owner of a review
middleware.checkReviewOwnership = function(req, res, next){
	//if the user is logged in
	if(req.isAuthenticated()){
		Review.findById(req.params.reviewId, function(err, foundReview){
			if(err){
				console.log(err);
				req.flash("error", "Review not found.");
				return res.redirect("back");
			}
			//if the user is the owner of the review
			if(foundReview.author.id.equals(req.user._id)){
				return next();
			}
			//if the user isn't the owner of the review
			console.log("you need to be the author of this review to do that");
			req.flash("error", "You need to be the author of this review to do that.");
			return res.redirect("back");
		});
	}
	else{
		//if the user isn't logged in, redirect him to login
		console.log("you need to be logged in to do this");
		req.flash("error", "You need to be logged in to do that.");
		return res.redirect("/login");
	}
}

//checkReviewExistence - checks if the user already reviewed a shelter, we only allow one review per shelter, user can edit his review tho
middleware.checkReviewExistence = function(req, res, next){
	//if the user is logged in
	if(req.isAuthenticated()){
		Shelter.findById(req.params.id).populate("reviews").exec(function(err, foundShelter){
			if(err){
				console.log(err);
				req.flash("error", "Shelter not found.");
				return res.redirect("back");
			}
			//we re going to save the review that the user has done previously in foundReview variable so we can pass it to the template
			var foundReview = {};
			//checks if there is any review in this shelter that the review author matches the user, meaning that the user already reviewed this shelter
			var alreadyReviewed = foundShelter.reviews.some(function(review){
				if(review.author.id.equals(req.user._id)){
					foundReview = review;
				}
				return review.author.id.equals(req.user._id);
			});
			//if the user already reviewed
			if(alreadyReviewed){
				console.log("you already reviewed this shelter. you can only review each shelter once. do you want to change your review?");
				req.flash("error", "You already reviewed this shelter. You can only review each shelter once. Do you want to change your review?");
				return res.render("reviews/editOrNot.ejs", {shelter: foundShelter, review: foundReview});
			}
			//if the user didn't reviewed this shelter yet
			return next();
		});
	}
	else{
		//if the user isn't logged in
		console.log("you need to be logged in to do that");
		req.flash("error", "You need to be logged in to do that.");
		return res.redirect("/login");
	}
}


//checkDogOwnership - checks if the user is the author of the dog
middleware.checkDogOwnership = function(req, res, next){
	//if the user is logged in
	if(req.isAuthenticated()){
		Dog.findById(req.params.dogId, function(err, foundDog){
			if(err){
				console.log(err);
				req.flash("error", "Dog not found.");
				return res.redirect("back");
			}
			//if the user is the owner of this dog
			if(foundDog.author.id.equals(req.user._id)){
				return next();
			}
			//if the user isn't the owner of this dog
			console.log("you need to be the author of this dog to do that");
			req.flash("error", "You need to be the owner of this dog to do that.");
			return res.redirect("back");
		});
	}
	else{
		//if the user isn't logged in
		console.log("you need to be logged in to do that");
		req.flash("error", "You need to be logged in to do that.");
		return res.redirect("/login");
	}
}

//userOwnership - checks if the user is the owner of a user page
middleware.userOwnership = function(req, res, next){
	//if user is logged in
	if(req.isAuthenticated()){
		//if user is a regular user
		if(req.user.role === "user"){
			User.findById(req.params.userId, function(err, foundUser){
				if(err){
					console.log(err);
					req.flash("error", "User account not found.");
					return res.redirect("back");
				}
				if(foundUser._id.equals(req.user._id)){
					return next();
				}
				else{
					console.log("you need to be the owner of this user's account to do that");
					req.flash("error", "You need to be the owner of this user's account to do that.");
					return res.redirect("back");
				}
			});
		}
		
		else{
			console.log("you need to be log in through a regular user account to do that");
			req.flash("error", "You need to be logged in through a regular user account to do that.");
			return res.redirect("/login");
		}
	}
	
	else{
		console.log("you need to be logged in for that");
		req.flash("error", "You need to be logged in for that.");
		return res.redirect("/login");
	}
}

//alUserOwnership - checks if the user is the owner of a user page
middleware.allUserOwnership = function(req, res, next){
	//if user is logged in
	if(req.isAuthenticated()){
		User.findById(req.params.userId, function(err, foundUser){
			if(err){
				console.log(err);
				req.flash("error", "User account not found.");
				return res.redirect("back");
			}
			if(foundUser._id.equals(req.user._id)){
				return next();
			}
			else{
				console.log("you need to be the owner of this user's account to do that");
				req.flash("error", "You need to be the owner of this user's account to do that.");
				return res.redirect("back");
			}
		});
	}
	
	else{
		console.log("you need to be logged in for that");
		req.flash("error", "You need to be logged in to do that.");
		return res.redirect("/login");
	}
}

//userIsUser - checks if the user has a regular user account
middleware.userIsUser = function(req, res, next){
	//if user is logged in
	if(req.isAuthenticated()){
		//if user is a regular user
		if(req.user.role === "user"){
			return next();
		}
		//if user is a shelterUser
		console.log("you need to create a regular user account to do that");
		req.flash("error", "You need to create a regular user account to do that.");
		return res.redirect("back");
	}
	//if user isn't logged in, redirect him to login page
	console.log("you need to be logged in to do that");
	req.flash("error", "You need to be logged in to do that.");
	return res.redirect("/login");
}

//shelterUser - checks if the user is a shelterUser account
middleware.shelterUser = function(req, res, next){
	//if user is logged in
	if(req.isAuthenticated()){
		//if user has a shelterUser account
		if(req.user.role === "shelterUser"){
			return next();
		}
		//if user is a regular user
		console.log("you need to create a shelter account to do that");
		req.flash("error", "You need to create a shelter account to do that.");
		return res.redirect("back");
	}
	//if user isn't logged in, redirect him to login page
	console.log("you need to be logged in to do that");
	req.flash("error", "You need to be logged in to do that.");
	return res.redirect("/login");
}


module.exports = middleware;