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
	res.render("comments/index.ejs")
});

//NEW ROUTE - shows form to create a comment
router.get("/new", function(req, res){
	res.render("comments/new.ejs");
});

//CREATE ROUTE - creates comment
router.post("/", function(req, res){
	
});

//EDIT ROUTE - shows form to edit comment
router.get("/:commentId/edit", function(req, res){
	res.render("comments/edit.ejs");
});

//UPDATE ROUTE - updates comment
router.post("/:commentId", function(req, res){
	
});

//DESTROY ROUTE - deletes a comment
router.post("/:commentId/delete", function(req,res){
	
});

module.exports = router;