import React from "react";
import { Link } from "react-router-dom";
import "../styles/not_found.css";

function NotFound() {
	return (
		<div className="not-found-container">
			<h1>404</h1>
			<p>Oops! The page you're looking for doesn't exist.</p>
			<br />
			<Link to="/" className="btn-dark">Go Back Home</Link>
		</div>
	);
}

export default NotFound;