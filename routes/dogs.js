var express = require("express"),
	router = express.Router({mergeParams: true});


//INDEX ROUTE
router.get("/dogs", function(req,res){
	res.render("dogs/index.ejs");
});

//NEW ROUTE - shows the form to create a dog
router.get("/shelters/:id/dogs/new", function(req, res){
	res.render("dogs/new.ejs")
})

//CREATE ROUTE - creates a dog
router.post("/dogs", function(req, res){
	res.redirect("/dogs" /* + dog's id*/);
});

//SHOW ROUTE - shows a dog from a shelter
router.get("shelters/:id/dogs/:dogId", function(req, res){
	res.render("dogs/show.ejs");
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