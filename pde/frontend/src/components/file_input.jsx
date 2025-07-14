import { useRef, useState } from "react";

function FileInput({ onCsvParsed }) {
	const fileInputRef = useRef(null);
	const [error, setError] = useState("");

	const handleReadFile = () => {
		const fileInput = fileInputRef.current;
		if (!fileInput || !fileInput.files[0]) {
			setError("Please select a file to read.");
			return;
		}
		setError("");

		const file = fileInput.files[0];
		const reader = new FileReader();

		reader.onload = (e) => {
			const csvText = e.target.result;
			const lines = csvText.trim().split("\n");

			if (lines.length <= 1) {
				alert("CSV must have header and at least one data row.");
				return;
			}

			const rawHeaders = lines[0].split(",").map((h) => h.trim());
			const headerMap = {
				"Agile PN": "agile_pn",
				"Agile Rev": "agile_rev",
				"Document Title": "doc_title",
				"Document Type": "doc_type",
				"Document ID": "doc_id",
			};

			const headers = rawHeaders.map((h) => headerMap[h] || h);
			const rows = lines.slice(1);

			const documents = rows
				.map((line) => {
					const values = line.split(",").map((val) => val.trim());
					if (values.length !== headers.length) return null;

					const doc = {};
					headers.forEach((key, index) => {
						doc[key] = values[index] || "";
					});
					return doc;
				})
				.filter(Boolean);

			// Pass documents to parent for uploading
			onCsvParsed(documents);
		};

		reader.readAsText(file);
	};

	return (
		<form
			className="action-form"
			id="upload-form"
			onSubmit={(e) => e.preventDefault()}
		>
			<div className="center-file-input">
				<input
					type="file"
					id="file-upload"
					name="file-upload"
					accept=".csv"
					className="custom-input"
					ref={fileInputRef}
					required
				/>
				<label
					htmlFor="file-upload"
					className="file-icon"
					title="Upload"
					alt="Upload"
				>
					<img
						src={`${import.meta.env.BASE_URL}src/assets/upload.png`}
						alt="Submit"
						className="file-icon"
					/>
				</label>
				<input type="hidden" name="csv_data" id="csv-data-input" />
				<button type="button" className="btn-dark" onClick={handleReadFile}>
					Read File
				</button>
			</div>
			{error && <p style={{ color: "red" }}>{error}</p>}
		</form>
	);
}

export default FileInput;