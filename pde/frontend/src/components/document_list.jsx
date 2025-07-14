import React, { useState } from "react";
import Document from "./manage_document";
import InputRow from "./input_row";

function DocumentList({ documents, onDelete, onUpdate, onCreate }) {
	const [activeInputRowId, setActiveInputRowId] = useState(null);

	const handleAddClick = (docId) => {
		setActiveInputRowId(docId === activeInputRowId ? null : docId);
	};

	const handleCancel = () => {
		setActiveInputRowId(null);
	};

	return (
		<>
			{documents.map((doc) => (
				<React.Fragment key={doc.id}>
					<Document
						document={doc}
						onDelete={onDelete}
						onUpdate={onUpdate}
						onAddClick={() => handleAddClick(doc.id)}
						showAddButton={true}
					/>
					{activeInputRowId === doc.id && (
						<InputRow
							onCreate={(newDoc) => {
								onCreate(newDoc);
								setActiveInputRowId(null);
							}}
							onCancel={handleCancel}
						/>
					)}
				</React.Fragment>
			))}
		</>
	);
}

export default DocumentList;