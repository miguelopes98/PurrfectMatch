var express = require("express"),
	router = express.Router({mergeParams: true}),
	passport = require("passport"),
	bodyParser = require('body-parser'),
	Shelter = require("../models/shelter.js"),
	Dog = require("../models/dog.js"),
	User = require("../models/user.js");


//GENERAL INDEX ROUTE - shows every existing dog and fuzzy search
router.get("/dogs", function(req,res){
	Dog.find({}, function(err, allDogs){
		if(err){
			console.log(err);
			return res.redirect("back");
		}
		res.render("dogs/generalIndex.ejs", {dogs: allDogs});
	});
});

//INDEX ROUTE - shows every existing dog of a specific shelter
router.get("/shelters/:id/dogs", function(req, res){
	Shelter.findById(req.params.id, function(err, foundShelter){
		if(err){
			console.log(err);
			return res.redirect("back");
		}
		res.render("dogs/index.ejs");
	});
});

//NEW ROUTE - shows the form to create a dog
router.get("/shelters/:id/dogs/new", function(req, res){
	Shelter.findById(req.params.id, function(err, foundShelter){
		if(err){
			console.log(err);
			return res.redirect("back");
		}
		res.render("dogs/new.ejs", {shelter: foundShelter});
	});
});

//CREATE ROUTE - creates a dog and adds it to shelter
router.post("/shelters/:id/dogs", function(req, res){
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
		Dog.findById(req.params.dogId, function(err, foundDog){
			if(err){
				console.log(err);
				return res.redirect("back");
			}
			res.render("dogs/show.ejs", {shelter: foundShelter, dog: foundDog});
		});
	});
});

//EDIT ROUTE - show the form to edit a dog from a shelter
router.get("/shelters/:id/dogs/:dogId/edit", function(req, res){
	res.render("dogs/edit.ejs");
});

//UPDATE ROUTE - update a dog from a shelter
router.post("/shelters/:id/dogs/:dogId", function(req, res){
	res.redirect("/" + req.params.id);
});


//DESTROY ROUTE - delete a dog from a shelter
router.post("/shelters/:id/dogs/:dogId/delete", function(req, res){
	res.redirect("/shelters/" + req.params.id + "/dogs");
});



module.exports = router;