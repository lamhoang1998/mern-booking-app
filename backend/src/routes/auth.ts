import express, { Request, Response } from "express";
import { check, validationResult } from "express-validator";
import User from "../models/user";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { verify } from "crypto";
import verifyToken from "../middleware/auth";

const router = express.Router();

router.post(
	"/login",
	[
		check("email", "Email is required").isEmail(),
		check("password", "Password with 6 or more characters required").isLength({
			min: 6,
		}),
	],
	async (req: Request, res: Response) => {
		const error = validationResult(req);
		if (!error.isEmpty()) {
			return res.status(400).json({ Message: error.array() });
		}

		const { email, password } = req.body;

		//fetch data, basically find the user that has the email address of email that we get from the request body
		try {
			const user = await User.findOne({ email });
			if (!user) {
				return res.status(400).json({ message: "Invalid Credentials" });
			}

			//check if the password that was sent in request matches the password from user
			const isMatch = await bcrypt.compare(password, user.password);
			if (!isMatch) {
				return res.status(400).json({ message: "Invalid Credentials" });
			}

			const token = jwt.sign(
				{ userId: user.id },
				process.env.JWT_SECRET_KEY as string,
				{ expiresIn: "1d" }
			);

			res.cookie("auth_token", token, {
				httpOnly: true,
				secure: process.env.NODE_ENV === "production",
				maxAge: 86400000,
			});
			//send back the user id whenever we log in
			res.status(200).json({ userId: user._id });
		} catch (error) {
			console.log(error);
			res.status(500).json({ message: "Something went wrong" });
		}
	}
);

//whenever we make a request to the /validate-token endpoint, it's going to run middleware which will check the HTTP cookie that was sent to us by the front end in the request, depending on if that check passes or not, if it passes the middleware we'll forward the request onto the arrow fn, and then we send back a 200 respond to say everything's ok and pass in the user Id which we get from the token
router.get("/validate-token", verifyToken, (req: Request, res: Response) => {
	res.status(200).send({ userId: req.userId });
});

router.post("/logout", (req: Request, res: Response) => {
	//return an empty token as part of the auth token http cookie and pass an empty string instead of the token.
	// all it does is to create an empty auth token and also says this token has expired at the time of creation.
	res.cookie("auth_token", "", {
		expires: new Date(0),
	});
	res.send();
});

export default router;
