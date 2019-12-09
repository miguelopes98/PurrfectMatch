var express = require("express"),
	app = express(),
	mongoose = require('mongoose');

mongoose.connect("mongodb://localhost:27017/purrfect_match", {useNewUrlParser: true, useUnifiedTopology:true});
app.set("view engine", ".ejs");
app.use(express.static("public"));

//requiring routes
var indexRoutes = require("./routes/index.js"),
	shelterRoutes = require("./routes/shelters.js"),
	dogsRoutes = require("./routes/dogs.js");





//telling express to use the routes that are in the respective files
app.use("/", indexRoutes); //routes non related with mongoose models
app.use("/shelters", shelterRoutes); //routes related with the shelter model
app.use("/", dogsRoutes); //routes related to the comment model, I can't do ("/dogs", dogsRoutes) since the index route is /dogs and the other routes are /shelter/:id/dogs
//app.use("/campgrounds/:id/reviews", reviewRoutes); //routes related to the review model

app.listen(process.env.PORT || 3000);