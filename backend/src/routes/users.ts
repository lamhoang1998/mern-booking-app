import express, { Request, Response } from "express";
import User from "../models/user";
import jwt from "jsonwebtoken";
import { check, validationResult } from "express-validator";

const router = express.Router();

// /api/users/register

router.post(
	"/register",
	[
		check("firstName", "firstName is required").isString(),
		check("lastName", "LastName is required").isString(),
		check("email", "Email is required").isEmail(),
		check("password", "Password with 6 or more characters required").isLength({
			min: 6,
		}),
	],
	async (req: Request, res: Response) => {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(400).json({ message: errors.array() });
		}
		try {
			//check the user model in our database and find a document(model) where the email matches the email in which we received in the body of the request
			let user = await User.findOne({ email: req.body.email });
			// if the user already existed, we add a bad request status code to the response
			if (user) {
				return res.status(400).json({ message: "User already exist" });
			}

			//If the user doesn't exist, we will create a new User and then pass in req.body and it will take the firstName, the lastName, the email and password from the request and it'll use those details to create a new User and then we'll save the new user
			user = new User(req.body);
			await user.save();

			//we can create the token after we've encrypted the password and save the user
			const token = jwt.sign(
				{ userId: user.id },
				process.env.JWT_SECRET_KEY as string,
				{ expiresIn: "1d" }
			);

			res.cookie("auth_token", token, {
				httpOnly: true,
				secure: process.env.NODE_ENV === "production", // only accept cookie over https, if we are in production it returns true, returns false if we're in development
				maxAge: 86400000,
			});

			return res.status(200).send({ message: "User registered OK" });
		} catch (error) {
			console.log(error);
			res.status(500).send({ message: "Something went wrong" });
		}
	}
);

export default router;
