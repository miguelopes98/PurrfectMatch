var mongoose = require("mongoose");
var passportLocalMongoose = require("passport-local-mongoose");

var shelterUserSchema = new mongoose.Schema({
	username: {type:String, unique: true, required: true},
	password: String,
	name: String,
	image: String,
	address: String,
	description: String,
	phoneNumber: String,
	email: {type: mongoose.SchemaTypes.Email, required: true},
	schedule: String,
	websiteUrl: String
});

shelterUserSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("shelterUser", shelterUserSchema);