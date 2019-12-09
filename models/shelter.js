var mongoose = require("mongoose");

var shelterSchema = new mongoose.Schema({
	author: {
		id: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "shelterUser"
		},
		username: String
	},
	name: String,
	image: String,
	address: String,
	description: String,
	phoneNumber: String,
	email: {type: String, unique: true, required: true},
	schedule: String,
	websiteUrl: String
});

module.exports = mongoose.model("Shelter", shelterSchema);