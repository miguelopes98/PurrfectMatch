var mongoose = require("mongoose");
var passportLocalMongoose = require("passport-local-mongoose");
var userType = require("./plugins/userType.js");

var UserSchema = new mongoose.Schema({
	username: {type:String, unique: true, required: true},
	password: String
});

//adds passportLocalMongoose's methods to User
UserSchema.plugin(passportLocalMongoose);
//adds userType's methods to User
UserSchema.plugin(userType);

module.exports = mongoose.model("User", UserSchema);