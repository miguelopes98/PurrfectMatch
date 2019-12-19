var mongoose = require("mongoose");

var dogSchema = new mongoose.Schema({
	author: {
		id: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Shelter"
		},
		username: String
	},
	name: String,
	breed: String,
	age: String,
	avatar: String,
	temperament: String,
	medicalConditions: String,
	personality: String
	//for some reason mongoDB collections only auto create when we have at least one parameter unique:true in the schema, in this case, we don't want this anywhere, and mongoDB also creates a collections (if non existing) when we create a dog, so it's fine
});

module.exports = mongoose.model("Dog", dogSchema);