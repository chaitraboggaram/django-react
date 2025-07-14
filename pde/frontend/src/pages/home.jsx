import React, { useState } from 'react';
import Layout from '../components/base';
import api from '../api';
import "../styles/home.css";

const fields = [
	{ key: "agile_pn", label: "Agile PN" },
	{ key: "agile_rev", label: "Agile Rev" },
	{ key: "title", label: "Document Title" },
	{ key: "doc_type", label: "Document Type" },
	{ key: "doc_id", label: "Document ID" }
];

function Home() {
	const [fileContent, setFileContent] = useState("");

	const handleCSVRead = () => {
		const fileInput = document.getElementById("file-upload");
		const file = fileInput.files[0];
		if (!file) {
			alert("Please select a file to read.");
			return;
		}

		const reader = new FileReader();
		reader.onload = async (e) => {
			const csvText = e.target.result;
			const lines = csvText.split("\n");
			lines.shift(); // remove header
			const csvWithoutHeader = lines.join("\n");

			localStorage.setItem("simple_table_data", JSON.stringify(csvWithoutHeader));
			setFileContent(csvWithoutHeader);
			console.log("Saved CSV text without header to localStorage");

			try {
				const response = await api.post("/upload-csv/", { csv: csvWithoutHeader });
				console.log("Upload successful:", response.data);
			} catch (error) {
				console.error("Upload failed:", error);
			}
		};
		reader.readAsText(file);
	};

	const clearRow = (e) => {
		const row = e.target.closest("tr");
		row.querySelectorAll("input, select").forEach((el) => (el.value = ""));
	};

	const removeRequired = (e) => {
		const row = e.target.closest("tr");
		row.querySelectorAll("input, select").forEach((el) => el.removeAttribute("required"));
	};

	return (
		<Layout>
			<div>
				<form method="post" id="upload-form">
					<div className="center-file-input">
						<input
							type="file"
							id="file-upload"
							name="file-upload"
							className="custom-input"
							accept=".csv"
							required
						/>
						<label htmlFor="file-upload" className="file-icon-label" title="Upload CSV">
							<img
								src={import.meta.env.BASE_URL + 'src/assets/upload.png'}
								alt="Upload"
								className="file-icon"
							/>
						</label>
						<input type="hidden" name="csv_data" value={fileContent} />
						<button type="button" className="btn-dark" onClick={handleCSVRead}>
							Read File
						</button>
					</div>
				</form>

				<br />
				<br />

				<table>
					<thead>
						<tr>
							{fields.map((field) => (
								<th key={field.key}>{field.label}</th>
							))}
							<th></th>
						</tr>
					</thead>
					<tbody>
						<tr>
							{fields.map((field) => (
								<td key={field.key}>
									<input
										type="text"
										name={field.key}
										placeholder={field.label}
										required
									/>
								</td>
							))}
							<td>
								<button className="icon-button done" title="Done">
									<img
										src={import.meta.env.BASE_URL + "src/assets/check.png"}
										alt="Done"
										className="button-icon"
									/>
								</button>
								<button
									type="button"
									className="icon-button clear"
									title="Clear"
									onClick={clearRow}
								>
									<img
										src={import.meta.env.BASE_URL + "src/assets/clear.png"}
										alt="Clear"
										className="button-icon"
									/>
								</button>
								<button
									type="button"
									className="icon-button cancel"
									title="Cancel"
									onClick={removeRequired}
								>
									<img
										src={import.meta.env.BASE_URL + "src/assets/cross.png"}
										alt="Cancel"
										className="button-icon"
									/>
								</button>
							</td>
						</tr>
					</tbody>
				</table>
			</div>
		</Layout>
	);
}

export default Home;