// This is a Interceptor that Intercepts any requests send will automatically add the correct header so that we don't have to rewrite it again. We will use axios and it will automatically add the accesss token to our requests

import axios from "axios";						// Import the Axios library to handle HTTP requests
import { ACCESS_TOKEN } from "./constants";		// Import a constant key name used to store/retrieve the token from localStorage


// Create a reusable Axios instance with a base URL
const api = axios.create({
	baseURL: import.meta.env.VITE_API_URL  		// Importing the base URL from the .env file
});

// Set up an interceptor to automatically modify all outgoing requests
api.interceptors.request.use(
	(config) => {
		const token = localStorage.getItem(ACCESS_TOKEN);	// Retrieve the access token from localStorage using the constant key defined in constants.js

		// If a token is found, attach it as a Bearer token in the Authorization header
		if (token) {
			config.headers.Authorization = `Bearer ${token}`;
		}

		return config;			// Return the modified request configuration
	},
	(error) => {
		return Promise.reject(error);	// If there's an error in the request, reject the promise with the error
	}
);

export default api;	// Export the configured Axios instance for use in other parts of the application instead of creating a new Axios instance each time