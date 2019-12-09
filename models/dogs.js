var mongoose = require("mongoose");

var dogSchema = new mongoose.Schema({
	author: {
		id: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "shelterUser"
		},
		username: String
	},
	name: String,
	breed: String,
	age: String,
	image: String,
	temperament: String,
	medicalConditions: String,
	personality: String
});

module.exports = mongoose.model("Dog", dogSchema);