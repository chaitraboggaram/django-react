import React, { useState } from "react";
import "../styles/document.css";

function Document({ document, onDelete, onUpdate }) {
	const [isEditing, setIsEditing] = useState(false);
	const [editedDoc, setEditedDoc] = useState({ ...document });

	const handleChange = (e) => {
		setEditedDoc({ ...editedDoc, [e.target.name]: e.target.value });
	};

	const handleSave = () => {
		onUpdate(document.id, editedDoc);
		setIsEditing(false);
	};

	return (
		<tr>
			{isEditing ? (
				<>
					<td><input name="agile_pn" value={editedDoc.agile_pn} onChange={handleChange} /></td>
					<td><input name="agile_rev" value={editedDoc.agile_rev} onChange={handleChange} /></td>
					<td><input name="doc_title" value={editedDoc.doc_title} onChange={handleChange} /></td>
					<td><input name="doc_type" value={editedDoc.doc_type} onChange={handleChange} /></td>
					<td><input name="doc_id" value={editedDoc.doc_id} onChange={handleChange} /></td>
				</>
			) : (
				<>
					<td>{document.agile_pn}</td>
					<td>{document.agile_rev}</td>
					<td>{document.doc_title}</td>
					<td>{document.doc_type}</td>
					<td>{document.doc_id}</td>
				</>
			)}
			<td>
				{isEditing ? (
					<button className="icon-button done" onClick={handleSave}>
						<img
							src={`${import.meta.env.BASE_URL}src/assets/check.png`}
							alt="Save"
							className="button-icon"
						/>
					</button>
				) : (
					<button className="icon-button edit" onClick={() => setIsEditing(true)}>
						<img
							src={`${import.meta.env.BASE_URL}src/assets/edit.png`}
							alt="Edit"
							className="button-icon"
						/>
					</button>
				)}

				<button className="icon-button delete" onClick={() => onDelete(document.id)}>
					<img
						src={`${import.meta.env.BASE_URL}src/assets/delete.png`}
						alt="Delete"
						className="button-icon"
					/>
				</button>
			</td>
		</tr>
	);
}

export default Document;