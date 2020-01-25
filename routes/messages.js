var express = require("express"),
	router = express.Router({mergeParams: true}),
	passport = require("passport"),
	bodyParser = require('body-parser'),
	middleware = require("../middleware/index.js"),
	Shelter = require("../models/shelter.js"),
	Dog = require("../models/dog.js"),
	Comment = require("../models/comment.js"),
	Review = require("../models/reviews.js"),
	Message = require("../models/message.js"),
	User = require("../models/user.js"),
	mongoose = require("mongoose");

//we won't allow to edit nor destroy messages, so we will not have updated, edit and destroy routes, but we will have destroy route.
//Since we are not going to have an update route, I'm going to set up the create route on /messages/:personId so I can preserve the recipient id without having the problem of overlapping routes

//INDEX ROUTE - shows all conversations of a user
router.get("/", middleware.userOwnership, function(req, res){
	User.findById(req.user._id).populate("conversations.messages conversations.person").exec(function(err, foundUser){
		if(err){
			console.log(err);
			req.flash("error", "Sorry! Something went wrong.");
			return res.redirect("back");
		}
		return res.render("messages/index.ejs", {user: foundUser});
	});
});

//NEW/SHOW ROUTE - shows the conversation with a specific user and gives form to send a text to user
router.get("/:personId", middleware.userOwnership, function(req, res){
	User.findById(req.user._id).populate("conversations.person conversations.messages").exec(function(err, foundUser){
		if(err){
			console.log(err);
			req.flash("error", "Sorry! Something went wrong.");
			return res.redirect("back");
		}
		User.findById(req.params.personId).populate("conversations.person conversations.messages").exec(function(err, foundRecipient){
			if(err){
				console.log(err);
				req.flash("error", "The person you were trying to reach wasn't found.");
				return res.redirect("back");
			}
			var index;
			var findConversation = foundUser.conversations.some(function (conversation) {
				if(conversation.person._id.equals(req.params.personId)){
					index = foundUser.conversations.indexOf(conversation);
				}
				return conversation.person._id.equals(req.params.personId);
			});
			//index is undefined if they didn't have a conversation before
			return res.render("messages/show.ejs", {user: foundUser, recipient: foundRecipient, index: index});
		});
			
	});
});

//CREATE ROUTE - creates messages, adds it to user and the recipient
router.post("/:personId", middleware.userOwnership, function(req, res){
	User.findById(req.user._id, function(err, foundUser){
		if(err){
			console.log(err);
			req.flash("error", "Sorry! Something went wrong.");
			return res.redirect("back");
		}
		User.findById(req.params.personId, function(err, foundRecipient){
			if(err){
				console.log(err);
				req.flash("error", "The person you were trying to reach wasn't found.");
				return res.redirect("back");
			}
			
			Message.create(req.body.message, function(err, savedMessage){
				if(err){
					console.log(err);
					req.flash("error", "Message not sent.");
					return res.redirect("back");
				}
				savedMessage.sender.id = req.user._id;
				savedMessage.recipient.id = req.params.personId;
				savedMessage.save();
				
				//check if the users had a conversation before or not
				var index;
				var findConversation = foundUser.conversations.some(function (conversation) {
					if(conversation.person._id.equals(req.params.personId)){
						index = foundUser.conversations.indexOf(conversation);
					}
					return conversation.person._id.equals(req.params.personId);
				});
				
				//if both users never had a conversation
				if(index === undefined){
					var objUser = {};
					objUser.person = foundRecipient._id;
					objUser.messages = [];
					objUser.messages.push(savedMessage._id);

					var objRecipient = {};
					objRecipient.person = foundUser._id;
					objRecipient.messages = [];
					objRecipient.messages.push(savedMessage._id);

					foundUser.conversations.push(objUser);
					foundUser.save();

					foundRecipient.conversations.push(objRecipient);
					foundRecipient.save();
					req.flash("success", "Message sent.");
					return res.redirect("/users/" + req.params.userId + "/messages/" + req.params.personId);
				}
				//if they had a conversation before
				else{
					foundRecipient.conversations[index].messages.push(savedMessage._id);
					foundUser.conversations[index].messages.push(savedMessage._id);
					foundUser.save();
					foundRecipient.save();
					req.flash("success", "Message sent.");
					return res.redirect("/users/" + req.params.userId + "/messages/" + req.params.personId);
				}
				
			});
		});
	});
});

module.exports = router;