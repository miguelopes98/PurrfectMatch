var mongoose = require("mongoose");

var shelterSchema = new mongoose.Schema({
	author: {
		id: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User"
		},
		username: String
	},
	name: String,
	avatar: String,
	address: String,
	description: String,
	phoneNumber: String,
	email: {type: String, unique: true, required: true},
	schedule: String,
	websiteUrl: String,
	dogs: [
		{
			type: mongoose.Schema.Types.ObjectId,
			ref: "Dog"
		}
	],
	reviews: [
		{
			type: mongoose.Schema.Types.ObjectId,
			ref: "Review"
		}
	],
    rating: {
        type: Number,
        default: 0
    }
});

module.exports = mongoose.model("Shelter", shelterSchema);