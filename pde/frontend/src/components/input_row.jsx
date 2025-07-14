import { useState } from "react";

function InputRow({ onCreate }) {
	const [agilePn, setAgilePn] = useState("");
	const [agileRev, setAgileRev] = useState("");
	const [docTitle, setDocTitle] = useState("");
	const [docType, setDocType] = useState("");
	const [docId, setDocId] = useState("");

	const handleSubmit = (e) => {
		e.preventDefault();

		// Check if any field is empty (trim to avoid spaces only)
		if (
			!agilePn.trim() ||
			!agileRev.trim() ||
			!docTitle.trim() ||
			!docType.trim() ||
			!docId.trim()
		) {
			alert("Please fill in all fields before submitting.");
			return;
		}

		const newDoc = {
			agile_pn: agilePn,
			agile_rev: agileRev,
			doc_title: docTitle,
			doc_type: docType,
			doc_id: docId,
		};
		onCreate(newDoc);

		// Clear form fields
		setAgilePn("");
		setAgileRev("");
		setDocTitle("");
		setDocType("");
		setDocId("");
	};


	return (
		<tr>
			<td>
				<input
					type="text"
					id="agile_pn"
					required
					value={agilePn}
					onChange={(e) => setAgilePn(e.target.value)}
				/>
			</td>
			<td>
				<input
					type="text"
					id="agile_rev"
					required
					value={agileRev}
					onChange={(e) => setAgileRev(e.target.value)}
				/>
			</td>
			<td>
				<input
					type="text"
					id="doc_title"
					required
					value={docTitle}
					onChange={(e) => setDocTitle(e.target.value)}
				/>
			</td>
			<td>
				<input
					type="text"
					id="doc_type"
					required
					value={docType}
					onChange={(e) => setDocType(e.target.value)}
				/>
			</td>
			<td>
				<input
					type="text"
					id="doc_id"
					required
					value={docId}
					onChange={(e) => setDocId(e.target.value)}
				/>
			</td>
			<td>
				<button type="submit" className="icon-button done" onClick={handleSubmit}>
					<img
						src={`${import.meta.env.BASE_URL}src/assets/check.png`}
						alt="Submit"
						className="button-icon"
					/>
				</button>
			</td>
		</tr>
	);
}

export default InputRow;