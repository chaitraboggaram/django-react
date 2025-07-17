import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import "../styles/base.css";
import { headerMap } from "../components/fields_config";
import api from "../api";

function Layout({ children }) {
	const location = useLocation();
	const fileInputRef = useRef(null);

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

	const handleCsvParsed = async (docsFromCsv) => {
		try {
			for (let i = 0; i < docsFromCsv.length; i++) {
				const docWithOrder = { ...docsFromCsv[i], order: i };

				const cleanDoc = {};
				Object.entries(docWithOrder).forEach(([k, v]) => {
					if (k && v !== "") cleanDoc[k] = v;
				});

				if (!cleanDoc.project_id) {
					console.warn(`⚠️ Skipping document ${i + 1} due to missing project_id`);
					continue;
				}

				console.log(`Sending document ${i + 1} data:`, cleanDoc);
				const response = await api.post("/documents/", cleanDoc);
				console.log(`✅ Uploaded document ${i + 1}:`, response.data);
			}
			alert("✅ All documents uploaded successfully!");
			window.location.reload();
		} catch (err) {
			console.error("❌ Error uploading CSV documents:", err);
			alert("❌ Upload failed. Check console for details.");
		}
	};

	const handleUploadClick = () => {
		if (fileInputRef.current) {
			fileInputRef.current.click();
		}
	};

	const handleFileChange = (event) => {
		const file = event.target.files[0];
		if (!file) return;

		if (file.type !== "text/csv" && !file.name.endsWith(".csv")) {
			alert("Please upload a valid .csv file");
			return;
		}

		const reader = new FileReader();
		reader.onload = (e) => {
			const contents = e.target.result;
			console.log("📄 CSV File Contents:\n", contents);

			const lines = contents.trim().split("\n");
			if (lines.length <= 1) {
				alert("CSV must have header and at least one data row.");
				return;
			}

			const rawHeaders = lines[0].split(",").map(h => h.trim().replace(/^"|"$/g, ''));
			const filteredIndexes = [];
			const filteredHeaders = [];

			rawHeaders.forEach((header, idx) => {
				if (header) {
					filteredIndexes.push(idx);
					filteredHeaders.push(headerMap[header] || header);
				}
			});

			const rows = lines.slice(1);

			const documents = rows.map((line, rowIndex) => {
				const values = line.split(",").map(v => v.trim().replace(/^"|"$/g, ''));

				if (values.length < filteredIndexes.length) {
					console.warn(`⚠️ Skipping row ${rowIndex + 2}: insufficient columns`);
					return null;
				}

				const doc = {};
				filteredIndexes.forEach((colIdx, i) => {
					doc[filteredHeaders[i]] = values[colIdx] || "";
				});

				return doc;
			}).filter(Boolean);

			console.log("📦 Parsed Documents from CSV:", documents);
			handleCsvParsed(documents);
		};
		reader.onerror = () => {
			alert("Failed to read file!");
		};
		reader.readAsText(file);
	};

	const deleteAllDocuments = async () => {
		const confirmed = window.confirm("Are you sure you want to reset the form.");

		if (!confirmed) return;

		try {
			const response = await api.delete("/delete_all_documents/");
			window.location.reload();
		} catch (error) {
			console.error("Failed to delete documents", error);
			alert("Error while resetting try again!.");
		}
	};

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
						<input
							type="file"
							ref={fileInputRef}
							accept=".csv"
							style={{ display: 'none' }}
							onChange={handleFileChange}
						/>
					</li>
					&nbsp;&nbsp;
					<li>
						<button className="btn-dark" type="button" onClick={deleteAllDocuments}>
							Reset
						</button>
					</li>
					<li>
						<a href={`${import.meta.env.BASE_URL}logout/`}>
							<button type="button" className="btn-dark">Logout</button>
						</a>
					</li>
				</ul>
			</nav>

			<main className="main-content">
				<br />
				{children}
			</main>
		</div>
	);
}

export default Layout;