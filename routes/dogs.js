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


//GENERAL INDEX ROUTE - shows every existing dog and fuzzy search
router.get("/dogs", function(req,res){
	Shelter.find({}).populate("dogs").exec(function(err, allShelters){
		if(err){
			console.log(err);
			return res.redirect("back");
		}
		res.render("dogs/generalIndex.ejs", {shelters: allShelters});
	});
});

//INDEX ROUTE - shows every existing dog of a specific shelter
router.get("/shelters/:id/dogs", function(req, res){
	Shelter.findById(req.params.id).populate("dogs").exec(function(err, foundShelter){
		if(err){
			console.log(err);
			return res.redirect("back");
		}
		res.render("dogs/index.ejs", {shelter: foundShelter});
	});
});

//NEW ROUTE - shows the form to create a dog
router.get("/shelters/:id/dogs/new", middleware.isLoggedIn, middleware.checkShelterOwnership, function(req, res){
	Shelter.findById(req.params.id, function(err, foundShelter){
		if(err){
			console.log(err);
			return res.redirect("back");
		}
		res.render("dogs/new.ejs", {shelter: foundShelter});
	});
});

//CREATE ROUTE - creates a dog and adds it to shelter
router.post("/shelters/:id/dogs", middleware.isLoggedIn, middleware.checkShelterOwnership, function(req, res){
	Shelter.findById(req.params.id, function(err, foundShelter){
		if(err){
			console.log(err);
			return res.redirect("back");
		}
		Dog.create(req.body.dog, function(err, newDog){
			if(err){
				console.log(err);
				return res.redirect("back");
			}
			newDog.author.id = req.user._id;
			newDog.author.username = req.user.username;
			newDog.save();
			foundShelter.dogs.push(newDog);
			foundShelter.save();
			res.redirect("/shelters/" + req.params.id);;
		});
	});
});

//SHOW ROUTE - shows a dog from a shelter
router.get("/shelters/:id/dogs/:dogId", function(req, res){
	Shelter.findById(req.params.id, function(err, foundShelter){
		if(err){
			console.log(err);
			return res.redirect("back");
		}
		Dog.findById(req.params.dogId).populate("comments likes").exec(function(err, foundDog){
			if(err){
				console.log(err);
				return res.redirect("back");
			}
			
			//checks if some user is logged in
			if(req.user){
				//if so, we check if the user already liked this dog and save the result (true or false) in the variable x to pass it to the template
				var x;
				foundDog.likes.some(function (like) {
					x = like.equals(req.user._id);
				});
			}
			res.render("dogs/show.ejs", {shelter: foundShelter, dog: foundDog, x: x});
		});
	});
});

//EDIT ROUTE - show the form to edit a dog from a shelter
router.get("/shelters/:id/dogs/:dogId/edit", middleware.isLoggedIn, middleware.checkDogOwnership, function(req, res){
	Dog.findById(req.params.dogId, function(err, foundDog){
		if(err){
			console.log(err);
			return res.redirect("back");
		}
		res.render("dogs/edit.ejs", {dog: foundDog, shelterId: req.params.id});
	});
});

//UPDATE ROUTE - update a dog from a shelter
router.post("/shelters/:id/dogs/:dogId", middleware.isLoggedIn, middleware.checkDogOwnership, function(req, res){
	Dog.findByIdAndUpdate(req.params.dogId, req.body.dog, function(err, foundDog){
		if(err){
			console.log(err);
			return res.redirect("back");
		}
		res.redirect("/shelters/" + req.params.id + "/dogs/" + req.params.dogId);
	});
});


//DESTROY ROUTE - delete a dog from a shelter
router.post("/shelters/:id/dogs/:dogId/delete", middleware.isLoggedIn, middleware.checkDogOwnership, function(req, res){
	//we use async so that the dog is only removed once all the likes and comments are removed, async only allows a function to run after everything inside is ran basically
	Dog.findByIdAndRemove(req.params.dogId, async function(err, dog){
		if(err){
			console.log(err);
			return res.redirect("back");
		}
		
	})
	res.redirect("/shelters/" + req.params.id + "/dogs");
});

//LIKE DOG ROUTE - checks if user already liked to unlike a dog, if didn't like, then like the dog
router.post("/shelters/:id/dogs/:dogId/like", middleware.isLoggedIn, middleware.userIsUser, function(req, res){
	Dog.findById(req.params.dogId, function(err, foundDog){
		if(err){
			console.log(err);
			return res.redirect("back");
		}
		
		//checks if user already liked the dog, some function runs an array and returns true as soon as the condition in the callback is true for some item in the array
		var likeIsInArray = foundDog.likes.some(function (like) {
    		return like.equals(req.user._id);
		});
		
		//if user liked the dog, then unlike dog
		if(likeIsInArray){
			foundDog.likes.pull(req.user._id);
		}
		//if user didn't like the dog yet, then like the dog
		else{
			foundDog.likes.push(req.user._id);
		}
		
		foundDog.save(function(err){
			if(err){
				console.log(err);
				return res.redirect("back");
			}
			return res.redirect("/shelters/" + req.params.id + "/dogs/" + req.params.dogId);
		});
	});
});



module.exports = router;