import { Navigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import api from "../api";
import { ACCESS_TOKEN, REFRESH_TOKEN } from "../constants";
import { useEffect, useState } from "react";

function ProtectedRoute({ children }) {
	const [isAuthorized, setIsAuthorized] = useState(null);

	useEffect(() => {
		auth().catch(() => setIsAuthorized(false));
	}, []);

	const refreshToken = async () => {
		const refreshToken = localStorage.getItem(REFRESH_TOKEN);

		try {
			const response = await api.post("/api/token/refresh/", { refresh: refreshToken });
			if (response.status !== 200) {
				setIsAuthorized(false);
			} else {
				localStorage.setItem(ACCESS_TOKEN, response.data.access);
				setIsAuthorized(true);
			}
		} catch (error) {
			console.error("Error refreshing token:", error);
			setIsAuthorized(false);
		}
	};

	const auth = async () => {
		const accessToken = localStorage.getItem(ACCESS_TOKEN);
		if (!accessToken) {
			setIsAuthorized(false);
			return;
		}

		try {
			const decoded = jwtDecode(accessToken);
			const tokenExpiry = decoded.exp;
			const currentTime = Date.now() / 1000; // Convert to seconds
			if (tokenExpiry < currentTime) {
				await refreshToken();
			}
			else {
				setIsAuthorized(true);
			}
		} catch (error) {
			console.error("Error decoding access token:", error);
		}
	};


	if (isAuthorized === null) {
		return <div>Loading...</div>; // or a spinner
	}
	return isAuthorized ? children : <Navigate to="/login" />;
}

export default ProtectedRoute;