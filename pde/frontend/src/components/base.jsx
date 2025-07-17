import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import "../styles/base.css";
import handleUploadClick from "../pages/file_upload";

function Layout({ children }) {
	const location = useLocation();

	useEffect(() => {
		if ('scrollRestoration' in history) {
			history.scrollRestoration = 'manual';
		}

		const saveScrollOnClick = () => {
			localStorage.setItem('scrollPosition', window.scrollY);
		};

		window.addEventListener('click', saveScrollOnClick);

		return () => {
			window.removeEventListener('click', saveScrollOnClick);
		};
	}, []);

	useEffect(() => {
		const scrollPos = localStorage.getItem('scrollPosition');
		if (!scrollPos) return;

		let attempts = 0;
		const maxAttempts = 20;

		const interval = setInterval(() => {
			const pageHeight = document.body.scrollHeight;

			if (pageHeight > parseInt(scrollPos) || attempts > maxAttempts) {
				window.scrollTo(0, parseInt(scrollPos));
				clearInterval(interval);
			}

			attempts++;
		}, 200);

		return () => clearInterval(interval);
	}, [location]);

	return (
		<div>
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
						<button className="btn-dark" type="button" onClick={handleUploadClick}>
							Upload File
						</button>
					</li>
					<li>
						<a href={`${import.meta.env.BASE_URL}logout/`}>
							<button type="button" className="btn-dark">Logout</button>
						</a>
					</li>
				</ul>
			</nav>

			{/* Main page content rendered below the navbar */}
			<main className="main-content">
				<br />
				{children}
			</main>
		</div>
	);
}

export default Layout;