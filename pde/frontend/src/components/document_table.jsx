import { useEffect, useState } from "react";
import api from "../api";
import DocumentList from "./document_list";
import InputRow from "./input_row";
import "../styles/home.css";

function DocumentTable() {
	const [documents, setDocuments] = useState([]);

	useEffect(() => {
		getDocuments();
	}, []);

	const getDocuments = () => {
		api
			.get("/documents/")
			.then((res) => res.data)
			.then((data) => {
				// Sort by order field to preserve CSV input order
				data.sort((a, b) => {
					const orderA = a.order !== undefined ? a.order : 9999;
					const orderB = b.order !== undefined ? b.order : 9999;
					return orderA - orderB;
				});
				setDocuments(data);
			})
			.catch((err) => alert(err));
	};

	const deleteDocument = (id) => {
		api
			.delete(`/documents/delete/${id}/`)
			.then((res) => {
				if (res.status !== 204) alert("Failed to delete document.");
				getDocuments();
			})
			.catch((error) => alert(error));
	};

	const updateDocument = (id, updatedDoc) => {
		api
			.put(`/documents/update/${id}/`, updatedDoc)
			.then((res) => {
				if (res.status === 200) {
					getDocuments();
				} else {
					alert("Failed to update document.");
				}
			})
			.catch((err) => alert(err));
	};

	const createDocument = (newDoc) => {
		api
			.post("/documents/", newDoc)
			.then((res) => {
				if (res.status === 201) {
					getDocuments();
				} else {
					alert("Failed to make document.");
				}
			})
			.catch((err) => alert(err));
	};

	return (
		<form>
			<table className="input-table">
				<thead>
					<tr>
						<th>Agile PN</th>
						<th>Agile Rev</th>
						<th>Document Title</th>
						<th>Document Type</th>
						<th>Document ID</th>
						<th></th>
					</tr>
				</thead>
				<tbody>
					<DocumentList
						documents={documents}
						onDelete={deleteDocument}
						onUpdate={updateDocument}
					/>
					<InputRow onCreate={createDocument} />
				</tbody>
			</table>
		</form>
	);
}

export default DocumentTable;