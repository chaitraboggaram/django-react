import react from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/login";
import Register from "./pages/register";
import NotFound from "./pages/not_found";
import Home from "./pages/home";
import ProtectedRoute from "./components/protected_route";

function Logout() {
	localStorage.clear();
	return <Navigate to="/login" />;
}

function RegisterAndLogout() {
	localStorage.clear();
	return <Register />;
}

function App() {
	return (
		<BrowserRouter>
			<Routes>
				<Route
					path="/"
					element={
						<ProtectedRoute>
							<Home />				{/*  You cannot access home until you have successfully authenticated */}
						</ProtectedRoute>
					}
				/>
				<Route path="/login" element={<Login />} />			{/*  No authentication is required to access these */}
				<Route path="/logout" element={<Logout />} />
				<Route path="/register" element={<Register />} />
				<Route path="*" element={<NotFound />} />
			</Routes>
		</BrowserRouter>
	);
};

export default App;