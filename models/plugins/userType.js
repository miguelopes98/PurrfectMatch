var mongoose = require("mongoose");
module.exports = function(schema) {
  schema.add({
    avatar: {type: String, unique: false},
	firstName: {type: String, unique: false},
	lastName: {type: String, unique: false},
	description: {type: String, unique: false},
	email: {type:String, unique: true, required: true},
	name: {type: String, unique: false},
	address: {type: String, unique: false},
	phoneNumber: {type: String, unique: false},
	schedule: {type: String, unique: false},
	websiteUrl: String,
	conversations: [
		{
			person:{
				type: mongoose.Schema.Types.ObjectId,
				ref: "User"
			},
			messages: [
				{
					type: mongoose.Schema.Types.ObjectId,
					ref: "Message"
				}
			]
		}
	],
	role: String, //either user or shelterUser, we will use this to allow different things considering the role of the current logged in account
	resetPasswordToken: String,
	resetPasswordExpires: Date
   });
}