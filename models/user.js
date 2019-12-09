var mongoose = require("mongoose");
var passportLocalMongoose = require("passport-local-mongoose");

var UserSchema = new mongoose.Schema({
	username: {type:String, unique: true, required: true},
	password: String,
	avatar: String,
	firstName: String,
	lastName: String,
	description: String,
	email: {type: String, unique: true, required: true}
});

UserSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", UserSchema);