import express, { Request, Response } from "express";
import multer from "multer";
import cloudinary from "cloudinary";
import Hotel from "../models/hotel";
import { HotelType } from "../shared/types";
import verifyToken from "../middleware/auth";
import { body } from "express-validator";

const router = express.Router();

//tell multer that we want to store images that we get from the post request in memory
const storage = multer.memoryStorage();
//define limits and initialize multer.
const upload = multer({
	storage: storage,
	limits: {
		fileSize: 5 * 1024 * 1024, //5MB
	},
});

//it's gonna be a post request because we create hotels at this endpoint.
// imageFiles is the name of the form value field which is going to hold the image
router.post(
	"/",
	verifyToken,
	[
		body("name").notEmpty().withMessage("Name is required"),
		body("city").notEmpty().withMessage("City is required"),
		body("country").notEmpty().withMessage("Country is required"),
		body("description").notEmpty().withMessage("Description is required"),
		body("type").notEmpty().withMessage("Hotel is required"),
		body("pricePerNight")
			.notEmpty()
			.isNumeric()
			.withMessage("Price per night is required and must be a number"),
		body("facilities")
			.notEmpty()
			.isArray()
			.withMessage("Facilities are required"),
	],
	upload.array("imageFiles", 6),
	async (req: Request, res: Response) => {
		try {
			const imageFiles = req.files as Express.Multer.File[];
			const newHotel: HotelType = req.body;

			//1. Upload the image to the cloudinary
			const uploadPromises = imageFiles.map(async (image) => {
				//encode the image as base 64
				const b64 = Buffer.from(image.buffer).toString("base64");
				let dataURI = "data:" + image.mimetype + ";base64," + b64;
				const res = await cloudinary.v2.uploader.upload(dataURI);
				return res.url;
			});

			const imageUrls = await Promise.all(uploadPromises);

			//2. if upload was successful, add the URL to the new hotel
			newHotel.imageUrls = imageUrls;
			newHotel.lastUpdated = new Date();
			newHotel.userId = req.userId;

			//3. save the new hotel in our database.
			const hotel = new Hotel(newHotel);
			await hotel.save();

			//4. return a 201 status.
			res.status(201).send(hotel);
		} catch (error) {
			console.log("Error creating hotel: ", error);
			res.status(500).json({ message: "Something went wrong" });
		}
	}
);

router.get("/", verifyToken, async (req: Request, res: Response) => {
	try {
		const hotels = await Hotel.find({ userId: req.userId });
		res.json(hotels);
	} catch (error) {
		res.status(500).json({ message: "Error fetching hotels" });
	}
});

export default router;
