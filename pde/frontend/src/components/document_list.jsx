import React from "react";
import Document from "./manage_document";

function DocumentList({ documents, onDelete, onUpdate }) {
	return (
		<>
			{documents.map((document, index) => (
				<Document
					key={document.id || `csv-${index}`}
					document={document}
					onDelete={onDelete}
					onUpdate={onUpdate}
				/>
			))}
		</>
	);
}

export default DocumentList;