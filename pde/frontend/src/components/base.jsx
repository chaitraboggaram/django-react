import React from 'react';
import { Link } from 'react-router-dom';
import "../styles/base.css";

function Layout({ children }) {
	return (
		<div>
			{/* Navbar section */}
			<nav className="navbar">
				<a href={import.meta.env.BASE_URL}>
					<img
						src={`${import.meta.env.BASE_URL}src/assets/tvt.svg`}
						alt="TVT Logo"
						className="logo"
					/>
				</a>
				<ul>
					<li>
						<a href={import.meta.env.BASE_URL}>
							<button type="button" className="btn-dark">Home</button>
						</a>
					</li>
					<li>
						<a href={`${import.meta.env.BASE_URL}traces/`}>
							<button type="button" className="btn-dark">Traces</button>
						</a>
					</li>
				</ul>
			</nav>

			{/* Main page content rendered below the navbar */}
			<main className="main-content">
				{children}
			</main>
		</div>
	);
}

export default Layout;