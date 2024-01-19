import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
//import the request and response type from express, not from api package

//extend express request type
declare global {
	namespace Express {
		interface Request {
			userId: string;
		}
	}
}

const verifyToken = (req: Request, res: Response, next: NextFunction) => {
	//get the auth token from the cookie sent from the request. we will acess the token object based on the key, and the key used to identify the http auth cookie is "auth_token"
	const token = req.cookies["auth_token"];

	//check if token does exist
	if (!token) {
		return res.status(401).json({ message: "unauthorized" });
	}

	//verify token by using the jwt secret key defined in the environment file
	try {
		//decode the token
		const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY as string);
		//we're trying to add the custom property as userId to express request which it doesn't know about
		req.userId = (decoded as JwtPayload).userId;
		next();
	} catch (error) {
		return res.status(401).json({ message: "unauthorized" });
	}
};

export default verifyToken;
