var express = require("express"),
	router = express.Router({mergeParams: true}),
	Shelter = require("../models/shelter.js"),
	Dog = require("../models/dog.js"),
	User = require("../models/user.js"),
	shelterUser = require("../models/shelterUser.js");


//INDEX ROUTE
router.get("/", function(req,res){
	res.render("shelters/index.ejs");
});

//NEW ROUTE - we have none, when a shelter's account is created, we ask for the informations of the shelter and the shelter gets created automatically and added to the shelters index page. the form that asks for the info to create de account sends a post request to /shelters

//CREATE ROUTE - once a shelters account is created, we automatically create a shelter and add it to the shelters index page, the 'create account' button must redirect here
router.post("/", function(req, res){
	//don't forget to not only create the shelter, but to create the shelter account as well
	//I'm going to create a shelterUser and pass that information to create the shelter itself aswell
	res.redirect("/shelters/" /* + shelter id */);
});

//SHOW ROUTE
router.get("/:id", function(req, res){
	res.render("shelters/show.ejs");
});

//EDIT ROUTE
router.get("/shelters/:id/edit", function(req, res){
	res.render("shelters/edit.ejs");
});

//UPDATE ROUTE
router.post("/shelters/:id", function(req, res){
	res.redirect("/" + req.params.id);
});


//DESTROY ROUTE
router.post("/shelters/:id/delete", function(req, res){
	res.redirect("/");
});



module.exports = router;