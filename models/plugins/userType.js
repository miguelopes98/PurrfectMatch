module.exports = function(schema) {
  schema.add({
    avatar: String,
	firstName: String,
	lastName: String,
	description: String,
	email: {type:String, unique: true, required: true},
	name: String,
	address: String,
	phoneNumber: {type:String, unique: true, require: true},
	schedule: String,
	websiteUrl: String,
    role: String //either user or shelterUser, we will use this to allow different things considering the role of the current logged in account
   });
}