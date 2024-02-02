import { RegisterFormData } from "./pages/Register";
import { SignInFormData } from "./pages/SignIn";
import { HotelType } from "../../backend/src/shared/types";

// import the environment variables from .env file
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";

//the register async function capture the data from the register form
export const register = async (formData: RegisterFormData) => {
	// store the value that the sever sends back after making fetch request
	const response = await fetch(`${API_BASE_URL}/api/users/register`, {
		method: "POST",
		//anytime we make a request to the end point, we also want to include any HTTP cookies along with the request.
		credentials: "include",
		//header tell the server to expect the body of the request to be a json format
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify(formData),
	});

	//get the body of the response
	const responseBody = await response.json();

	if (!response.ok) {
		throw new Error(responseBody.message);
	}
};

export const SignIn = async (formData: SignInFormData) => {
	const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
		method: "POST",
		credentials: "include",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(formData),
	});

	const body = await response.json();
	if (!response.ok) {
		throw new Error(body.message);
	}
	return body;
};

export const validateToken = async () => {
	const response = await fetch(`${API_BASE_URL}/api/auth/validate-token`, {
		credentials: "include",
	});

	if (!response.ok) {
		throw new Error("Token invalid");
	}

	return response.json();
};

export const signOut = async () => {
	const response = await fetch(`${API_BASE_URL}/api/auth/logout`, {
		method: "POST",
		credentials: "include",
	});

	if (!response.ok) {
		throw new Error("Error during sign out");
	}
};

export const addMyHotel = async (hotelFormData: FormData) => {
	const response = await fetch(`${API_BASE_URL}/api/my-hotels`, {
		method: "POST",
		credentials: "include",
		body: hotelFormData,
	});

	if (!response.ok) {
		throw new Error("Fail to add hotel");
	}

	return response.json();
};

export const fetchMyHotels = async (): Promise<HotelType[]> => {
	const response = await fetch(`${API_BASE_URL}/api/my-hotels`, {
		credentials: "include",
	});

	if (!response.ok) {
		throw new Error("Error fetching hotels");
	}

	return response.json();
};

export const fetchMyHotelById = async (hotelId: string): Promise<HotelType> => {
	const response = await fetch(`${API_BASE_URL}/api/my-hotels/${hotelId}`, {
		credentials: "include",
	});

	if (!response.ok) {
		throw new Error("Error fetching hotels");
	}

	return response.json();
};

export const updateMyHotelById = async (hotelFormData: FormData) => {
	const response = await fetch(
		`${API_BASE_URL}/api/my-hotels/${hotelFormData.get("hotelId")}`,
		{
			method: "PUT",
			body: hotelFormData,
			credentials: "include",
		}
	);
	if (!response.ok) {
		throw new Error("Failed to update hotel");
	}

	return response.json();
};
