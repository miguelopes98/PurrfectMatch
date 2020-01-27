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

//GENERALINDEX - show every existing dog and fuzzy search
router.get("/dogs", function(req, res){
	var perPage = 8;
    var pageQuery = parseInt(req.query.page);
    var pageNumber = pageQuery ? pageQuery : 1;
    var noMatch = null;
    if(req.query.search) {
        const regex = new RegExp(escapeRegex(req.query.search), 'gi');
        // Get the shelters that match the search from DB
        Dog.find({breed: regex}).skip((perPage * pageNumber) - perPage).limit(perPage).populate("shelter").exec(function(err, allDogs){
			if(err){
				console.log(err);
				req.flash("error", "Sorry! Something went wrong.");
				return res.redirect("back");
			}
			Dog.count({breed: regex}).exec(function(err, count){
				if(err){
				   console.log(err);
				   req.flash("error", "Dog/Dogs not found.");
					return res.redirect("back");
			   } else {
					return res.render("dogs/generalIndex", {
					dogs: allDogs,
					current: pageNumber,
					pages: Math.ceil(count / perPage),
					noMatch: noMatch,
					search: req.query.search
					});
			   }
			});
        });
    } 
	else
	{
        //Get all shelters from DB
		//Shelter.find() vai correr e tudo o que encontrar vai guardar em allShelters
		Dog.find({}).skip((perPage * pageNumber) - perPage).limit(perPage).populate("shelter").exec(function (err, allDogs) {
			if(err){
				console.log(err);
				req.flash("error", "Sorry! Something went wrong.");
				return res.redirect("back");
			}
			Dog.count().exec(function (err, count) {
				if (err) {
					console.log(err);
					req.flash("error", "Dog/Dogs not found.");
					return res.redirect("back");
				} else {
					return res.render("dogs/generalIndex", {
					dogs: allDogs,
					current: pageNumber,
					pages: Math.ceil(count / perPage),
					noMatch: noMatch,
					search: req.query.search
					});
				}
			});
		});
    }
});

//INDEX ROUTE - shows every existing dog of a specific shelter
router.get("/shelters/:id/dogs", function(req, res){
	Shelter.findById(req.params.id).exec(function(err, foundShelter){
		if(err){
			console.log(err);
			req.flash("error", "Shelter not found.");
			return res.redirect("back");
		}
		var perPage = 8;
		var pageQuery = parseInt(req.query.page);
		var pageNumber = pageQuery ? pageQuery : 1;
		var noMatch = null;
		if(req.query.search) {
			const regex = new RegExp(escapeRegex(req.query.search), 'gi');
			// Get the shelters that match the search from DB
			Dog.find({breed: regex, "_id": {$in: foundShelter.dogs}}).skip((perPage * pageNumber) - perPage).limit(perPage).exec(function(err, allDogs){
				if(err){
					console.log(err);
					req.flash("error", "Sorry! Something went wrong.");
					return res.redirect("back");
				}
				Dog.count({breed: regex}).exec(function(err, count){
					if(err){
					   console.log(err);
					   req.flash("error", "Dog/Dogs not found.");
						return res.redirect("back");
				   } else {
						return res.render("dogs/index", {
						dogs: allDogs,
						shelter: foundShelter,
						current: pageNumber,
						pages: Math.ceil(count / perPage),
						noMatch: noMatch,
						search: req.query.search
						});
				   }
				});
			});
		} 
		else
		{
			//Get all shelters from DB
			//Shelter.find() vai correr e tudo o que encontrar vai guardar em allShelters
			Dog.find({"_id": {$in: foundShelter.dogs}}).skip((perPage * pageNumber) - perPage).limit(perPage).exec(function (err, allDogs) {
				if(err){
					console.log(err);
					req.flash("error", "Sorry! Something went wrong.");
					return res.redirect("back");
				}
				Dog.count().exec(function (err, count) {
					if (err) {
						console.log(err);
						req.flash("error", "Dog/Dogs not found.");
						return res.redirect("back");
					} else {
						return res.render("dogs/index", {
						dogs: allDogs,
						shelter: foundShelter,
						current: pageNumber,
						pages: Math.ceil(count / perPage),
						noMatch: noMatch,
						search: req.query.search
						});
					}
				});
			});
		}
	});
});

//NEW ROUTE - shows the form to create a dog
router.get("/shelters/:id/dogs/new", middleware.isLoggedIn, middleware.checkShelterOwnership, function(req, res){
	Shelter.findById(req.params.id, function(err, foundShelter){
		if(err){
			console.log(err);
			req.flash("error", "Shelter not found.");
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
			req.flash("error", "Shelter not found.");
			return res.redirect("back");
		}
		Dog.create(req.body.dog, function(err, newDog){
			if(err){
				console.log(err);
				req.flash("error", "Dog wasn't created.");
				return res.redirect("back");
			}
			newDog.author.id = req.user._id;
			newDog.author.username = req.user.username;
			newDog.shelter = req.params.id;
			newDog.save();
			foundShelter.dogs.push(newDog);
			foundShelter.save();
			req.flash("success", "Dog added successfully.");
			res.redirect("/shelters/" + req.params.id);;
		});
	});
});

//SHOW ROUTE - shows a dog from a shelter
router.get("/shelters/:id/dogs/:dogId", function(req, res){
	Shelter.findById(req.params.id, function(err, foundShelter){
		if(err){
			console.log(err);
			req.flash("error", "Shelter not found.");
			return res.redirect("back");
		}
		Dog.findById(req.params.dogId).populate("comments likes shelter").exec(function(err, foundDog){
			if(err){
				console.log(err);
				req.flash("error", "Dog not found.");
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
			req.flash("error", "Dog not found.");
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
			req.flash("error", "Dog not found.");
			return res.redirect("back");
		}
		res.redirect("/shelters/" + req.params.id + "/dogs/" + req.params.dogId);
	});
});


//DESTROY ROUTE - delete a dog from a shelter
router.post("/shelters/:id/dogs/:dogId/delete", middleware.isLoggedIn, middleware.checkDogOwnership, function(req, res){
	//we use async so that the dog is only removed once all the likes and comments are removed, async only allows a function to run after everything inside is ran basically
	Dog.findByIdAndRemove(req.params.dogId, async function(err, foundDog){
		if(err){
			console.log(err);
			req.flash("error", "Dog not found.");
			return res.redirect("back");
		}
		else{
			//delete all the comments associated with the dog we're about to remove
			Comment.remove({"_id": {$in: foundDog.comments}}, function (err) {
				if(err){
					console.log(err);
					req.flash("error", "Sorry! Something went wrong.");
					return res.redirect("back");
				}
				foundDog.remove();
				req.flash("success", "Dog removed successfully.");
				return res.redirect("/shelters/" + req.params.id);
			});
		}
	});
});

//LIKE DOG ROUTE - checks if user already liked to unlike a dog, if didn't like, then like the dog
router.post("/shelters/:id/dogs/:dogId/like", middleware.isLoggedIn, middleware.userIsUser, function(req, res){
	Dog.findById(req.params.dogId, function(err, foundDog){
		if(err){
			console.log(err);
			req.flash("error", "Dog not found.");
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
				req.flash("error", "Sorry! Something went wrong.");
				return res.redirect("back");
			}
			return res.redirect("/shelters/" + req.params.id + "/dogs/" + req.params.dogId);
		});
	});
});

//function that we're going to call on the index route to do the fuzzy search
function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};


module.exports = router;