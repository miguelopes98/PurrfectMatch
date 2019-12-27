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

//INDEX ROUTE - shows reviews for a specific shelter
router.get("/", function(req, res){
	Shelter.findById(req.params.id).populate({
		path: "reviews"//,
        //options: {sort: {createdAt: -1}} // sorting the populated reviews array to show the latest first
    }).exec(function(err, foundShelter){
		if(err){
			console.log(err);
			return res.redirect("back");
		}
		res.render("reviews/index.ejs", {shelter: foundShelter});
	});
});

//NEW ROUTE - shows form to create new review
router.get("/new", middleware.isLoggedIn, middleware.checkReviewExistence, function(req, res){
	Shelter.findById(req.params.id, function(err, foundShelter){
		if(err){
			console.log(err);
			return res.redirect("back");
		}
		res.render("reviews/new.ejs", {shelter: foundShelter});
	});
});

//CREATE ROUTE - creates a new review
router.post("/", middleware.isLoggedIn, middleware.checkReviewExistence, function(req, res){
	//we gotta populate so that when we try to access the ratings of each sehlter review, theres something there other than review id's, since we need to run the reviews array in the shelter
	Shelter.findById(req.params.id).populate("reviews").exec(function(err,foundShelter){
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
			foundShelter.rating = calculateAverage(foundShelter.reviews);
			foundShelter.save();
			res.redirect("/shelters/" + req.params.id);
		});
	});
});

//EDIT ROUTE - shows form to edit a review
router.get("/:reviewId/edit", function(req, res){
	Review.findById(req.params.reviewId, function(err, foundReview){
		if(err){
			console.log(err);
			return res.redirect("back");
		}
		res.render("reviews/edit.ejs", {review: foundReview, shelterId: req.params.id});
	});
});

//UPDATE ROUTE - updates a review
router.post("/:reviewId", function(req, res){
	//{new:true} so we don't end up with both versions of the review, by setting new to be true, mongoose will destroy the older version and replace it with the updated one
	Review.findByIdAndUpdate(req.params.reviewId, req.body.review, {new: true}, function(err, updatedReview){
		if(err){
			console.log(err);
			return res.redirect("back");
		}
		Shelter.findById(req.params.id).populate("reviews").exec(function(err, foundShelter){
			if(err){
				console.log(err);
				return res.redirect("back");
			}
			//updating shelter's reviews average rating
			foundShelter.rating = calculateAverage(foundShelter.reviews);
			foundShelter.save();
			res.redirect("/shelters/" + req.params.id);
		});
	});
});

//DESTROY ROUTE - deletes a review
router.post("/:reviewId/delete", function(req, res){
	Review.findByIdAndRemove(req.params.reviewId, function(err, review){
		if(err){
			console.log(err);
			return res.redirect("back");
		}
		Shelter.findByIdAndUpdate(req.params.id, {$pull: {reviews: req.params.review_id}}, {new: true}).populate("reviews").exec(function(err, shelter){
			if(err){
				console.log(err);
				return res.redirect("back");
			}
			//updating shelter's reviews average rating
			shelter.rating = calculateAverage(shelter.reviews);
			shelter.save();
			res.redirect("back");
		});
	});
});


//defining the calculateAverage function
function calculateAverage(reviews) {
    if (reviews.length === 0) {
        return 0;
    }
    var sum = 0;
    reviews.forEach(function (element) {
        sum += element.rating;
    });
    return sum / reviews.length;
}

module.exports = router;