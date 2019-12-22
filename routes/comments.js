var express = require("express"),
	router = express.Router({mergeParams: true}),
	passport = require("passport"),
	bodyParser = require('body-parser'),
	Shelter = require("../models/shelter.js"),
	Dog = require("../models/dog.js"),
	Comment = require("../models/comment.js"),
	User = require("../models/user.js");

//INDEX ROUTE - shows comments for a specific dog
router.get("/", function(req, res){
	res.send("comments index page");
	//res.render("comments/index.ejs")
});

//NEW ROUTE - shows form to create a comment
router.get("/new", function(req, res){
	Dog.findById(req.params.dogId, function(err, foundDog){
		if(err){
			console.log(err);
			return res.redirect("back");
		}
		res.render("comments/new.ejs", {shelterId: req.params.id, dog: foundDog});
	});
});

//CREATE ROUTE - creates comment
router.post("/", function(req, res){
	Dog.findById(req.params.dogId, function(err, foundDog){
		if(err){
			console.log(err);
			return res.redirect("back");
		}
		Comment.create(req.body.comment, function(err, newComment){
			if(err){
				console.log(err);
				return res.redirect("back");
			}
			//adding author to created comment
			newComment.author.id = req.user._id;
			newComment.author.username = req.user.username;
			newComment.save();
			//adding comment to dog
			foundDog.comments.push(newComment);
			foundDog.save();
			res.redirect("/shelters/" + req.params.id + "/dogs/" + req.params.dogId);
		})
	});
});

//EDIT ROUTE - shows form to edit comment
router.get("/:commentId/edit", function(req, res){
	Comment.findById(req.params.commentId, function(err, foundComment){
		if(err){
			console.log(err);
			return res.redirect("back");
		}
		res.render("comments/edit.ejs", {shelterId: req.params.id, dogId: req.params.dogId, comment: foundComment});
	});
});

//UPDATE ROUTE - updates comment
router.post("/:commentId", function(req, res){
	Comment.findByIdAndUpdate(req.params.commentId, req.body.comment, function(err, comment){
		if(err){
			console.log(err);
			return res.redirect("back");
		}
		res.redirect("/shelters/" + req.params.id + "/dogs/" + req.params.dogId);
	});
});

//DESTROY ROUTE - deletes a comment
router.post("/:commentId/delete", function(req,res){
	
});

module.exports = router;