var mongoose = require("mongoose");

var messageSchema = new mongoose.Schema({
	sender: {
		id: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User"
		}
	},
	recipient: {
		id: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User"
		}
	},
	text: String
	//for some reason mongoDB collections only auto create when we have at least one parameter unique:true in the schema, in this case, we don't want this anywhere, and mongoDB also creates a collections (if non existing) when we create a create, so it's fine
});

module.exports = mongoose.model("Message", messageSchema);