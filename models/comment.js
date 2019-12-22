var mongoose = require("mongoose");

var commentSchema = new mongoose.Schema({
	author: {
		id: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User"
		},
		username: String
	},
	text: String
	//for some reason mongoDB collections only auto create when we have at least one parameter unique:true in the schema, in this case, we don't want this anywhere, and mongoDB also creates a collections (if non existing) when we create a create, so it's fine
});

module.exports = mongoose.model("Comment", commentSchema);