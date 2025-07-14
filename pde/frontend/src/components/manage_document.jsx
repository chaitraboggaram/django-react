import React, { useState } from "react";
import "../styles/document.css";
import documentFields from "./fields_config";

function Document({ document, onDelete, onUpdate, onAddClick, showAddButton }) {
	const [isEditing, setIsEditing] = useState(false);
	const [editedDoc, setEditedDoc] = useState({ ...document });

	const handleChange = (e) => {
		setEditedDoc({ ...editedDoc, [e.target.name]: e.target.value });
	};

	const handleSave = () => {
		onUpdate(document.id, editedDoc);
		setIsEditing(false);
	};

	const handleCancel = () => {
		setEditedDoc({ ...document });
		setIsEditing(false);
	};

	const startEditing = () => {
		setEditedDoc({ ...document });
		setIsEditing(true);
	};

	return (
		<tr>
			{isEditing
				? documentFields.map(({ key }) => (
					<td key={key}>
						<input
							name={key}
							value={editedDoc[key] || ""}
							onChange={handleChange}
						/>
					</td>
				))
				: documentFields.map(({ key }) => <td key={key}>{document[key]}</td>)}
			<td>
				{isEditing ? (
					<>
						<button type="button" className="icon-button done" onClick={handleSave}>
							<img
								src={`${import.meta.env.BASE_URL}src/assets/check.png`}
								alt="Save"
								className="button-icon"
							/>
						</button>
						<button type="button" className="icon-button cancel" onClick={handleCancel}>
							<img
								src={`${import.meta.env.BASE_URL}src/assets/cross.png`}
								alt="Cancel"
								className="button-icon"
							/>
						</button>
					</>
				) : (
					<>
						{showAddButton && (
							<button type="button" className="icon-button add" onClick={onAddClick}>
								<img
									src={`${import.meta.env.BASE_URL}src/assets/add.png`}
									alt="Add"
									className="button-icon"
								/>
							</button>
						)}
						<button type="button" className="icon-button edit" onClick={startEditing}>
							<img
								src={`${import.meta.env.BASE_URL}src/assets/edit.png`}
								alt="Edit"
								className="button-icon"
							/>
						</button>
						<button type="button" className="icon-button delete" onClick={() => onDelete(document.id)}>
							<img
								src={`${import.meta.env.BASE_URL}src/assets/delete.png`}
								alt="Delete"
								className="button-icon"
							/>
						</button>
					</>
				)}
			</td>
		</tr>
	);
}

export default Document;