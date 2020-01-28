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

//INDEX ROUTE - shows comments for a specific dog
router.get("/", function(req, res){
	Dog.findById(req.params.dogId).populate("comments").exec(function(err, foundDog){
		if(err){
			console.log(err);
			req.flash("error", "Comments not found.");
			return res.redirect("back");
		}
		Comment.find({"_id":{$in: foundDog.comments}}).populate("author.id").exec(function(err, allComments){
			if(err){
				console.log(err);
				req.flash("error","Comments not found.");
				return res.redirect("back");
			}
			console.log(allComments[0]);
			return res.render("comments/index.ejs", {shelterId: req.params.id, dog: foundDog, comments: allComments});
		})
	});
});

//NEW ROUTE - shows form to create a comment
router.get("/new", middleware.isLoggedIn, middleware.userIsUser, function(req, res){
	Dog.findById(req.params.dogId, function(err, foundDog){
		if(err){
			console.log(err);
			req.flash("error", "Sorry! Something went wrong.");
			return res.redirect("back");
		}
		res.render("comments/new.ejs", {shelterId: req.params.id, dog: foundDog});
	});
});

//CREATE ROUTE - creates comment
router.post("/", middleware.isLoggedIn, middleware.userIsUser, function(req, res){
	Dog.findById(req.params.dogId, function(err, foundDog){
		if(err){
			console.log(err);
			req.flash("error", "Dog not found.");
			return res.redirect("back");
		}
		Comment.create(req.body.comment, function(err, newComment){
			if(err){
				console.log(err);
				req.flash("error", "Wasn't able to create comment.");
				return res.redirect("back");
			}
			//adding author to created comment
			newComment.author.id = req.user._id;
			newComment.author.username = req.user.username;
			newComment.save();
			//adding comment to dog
			foundDog.comments.push(newComment);
			foundDog.save();
			req.flash("success", "You have successfully commented this dog.");
			res.redirect("/shelters/" + req.params.id + "/dogs/" + req.params.dogId);
		})
	});
});

//EDIT ROUTE - shows form to edit comment
router.get("/:commentId/edit", middleware.isLoggedIn, middleware.userIsUser, middleware.checkCommentOwnership, function(req, res){
	Comment.findById(req.params.commentId, function(err, foundComment){
		if(err){
			console.log(err);
			req.flash("error", "Comment not found.");
			return res.redirect("back");
		}
		res.render("comments/edit.ejs", {shelterId: req.params.id, dogId: req.params.dogId, comment: foundComment});
	});
});

//UPDATE ROUTE - updates comment
router.post("/:commentId", middleware.isLoggedIn, middleware.userIsUser, middleware.checkCommentOwnership, function(req, res){
	Comment.findByIdAndUpdate(req.params.commentId, req.body.comment, function(err, comment){
		if(err){
			console.log(err);
			req.flash("error", "Sorry! Something went wrong.");
			return res.redirect("back");
		}
		req.flash("success", "Comment wasn't updated.");
		res.redirect("/shelters/" + req.params.id + "/dogs/" + req.params.dogId);
	});
});

//DESTROY ROUTE - deletes a comment
router.post("/:commentId/delete", middleware.isLoggedIn, middleware.userIsUser, middleware.checkCommentOwnership, function(req,res){
	//deleting comment
	Comment.findByIdAndRemove(req.params.commentId, function(err, foundComment){
		if(err){
			console.log(err);
			req.flash("error", "Comment not found.");
			return res.redirect("back");
		}
		//removing deleted comment id from dog.comments array
		Dog.findByIdAndUpdate(req.params.dogId, {$pull: {comments: req.params.commentId}}, {new: true}).populate("comments").exec(function(err, udpatedDog){
			if(err){
				console.log(err);
				req.flash("error", "Dog not found.");
				return res.redirect("back");
			}
			req.flash("success", "Comment deleted.");
			res.redirect("/shelters/" + req.params.id + "/dogs/" + req.params.dogId);
		});
	});
});

module.exports = router;