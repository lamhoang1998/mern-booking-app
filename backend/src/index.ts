import express, { Request, Response } from "express";
import cors from "cors";
import "dotenv/config";
import mongoose from "mongoose";
import userRoutes from "./routes/users";
import authRoutes from "./routes/auth";
import cookieParser from "cookie-parser";
import path from "path";
import { v2 as cloudinary } from "cloudinary";
import myHotelRoutes from "./routes/my-hotels";

//connect to cloudinary
cloudinary.config({
	cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
	api_key: process.env.CLOUDINARY_API_KEY,
	api_secret: process.env.CLOUDINARY_API_SECRET,
});

mongoose.connect(process.env.MONGODB_CONNECTION_STRING as string);
//it'll try to connect to our database when we first run the app

const app = express();

//tell express to use the cookie parser
app.use(cookieParser());

app.use(express.json()); //convert the body of API request into JSON automatically
app.use(express.urlencoded({ extended: true })); // parse the URL the get the create parameters
app.use(
	cors({
		//our server will only except requests from this frontend_url and the url must include the http cookie
		origin: process.env.FRONTEND_URL,
		credentials: true,
	})
); //prevent certain requests from certain URL

// we do this after we've done with setting up some stuff for deploying in the backend and front end folder.
//it mean go to the frontend dist folder which has our compiled frontend static assets and serve those static assets on the root of the URL that has the backend run on
app.use(express.static(path.join(__dirname, "../../frontend/dist")));

//Endpoint to test
//any requests coming into our api prefixed with /api/users then pass the request to the userRoute
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/my-hotels", myHotelRoutes);

app.get("*", (req: Request, res: Response) => {
	res.sendFile(path.join(__dirname, "../../frontend/dist/index.html"));
});

app.listen(7000, () => {
	console.log("server running on localhost:7000");
});
