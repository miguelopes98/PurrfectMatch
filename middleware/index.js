var Shelter = require("../models/shelter.js"),
	Dog = require("../models/dog.js"),
	User = require("../models/user.js"),
	Comment = require("../models/comment.js"),
	Review = require("../models/reviews.js");

//we're creating a middleware object to add a bunch of methods and export that object to the routes files
var middleware = {};

//WRITING THE MIDDLEWARE TO CHECK IF A USER IS LOGGED IN
middleware.isLoggedIn = function(req, res, next){
	if(req.isAuthenticated()){
		return next();
	}
	return res.redirect("/login");
}

module.exports = middleware;