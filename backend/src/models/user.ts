import mongoose from "mongoose";
import bcrypt from "bcryptjs";

export type UserType = {
	_id: string;
	email: string;
	password: string;
	firstName: string;
	lastName: string;
};

const userSchema = new mongoose.Schema({
	email: { type: String, required: true, unique: true },
	password: { type: String, required: true },
	firstName: { type: String, required: true },
	lastName: { type: String, required: true },
});

//middleware for mongodb, just tell the mongo b4 update to the document, it checks if the password has changed then want to bcrypt to hash it nd then just call the next function
userSchema.pre("save", async function (next) {
	if (this.isModified("password")) {
		this.password = await bcrypt.hash(this.password, 8);
	}
	next();
});

const User = mongoose.model<UserType>("User", userSchema); // inside the bracket, "User" stands for the name of the document we want this model to get associated to.

export default User;
