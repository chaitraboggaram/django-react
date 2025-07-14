import React from "react";
import "../styles/document.css";

function Document({ document, onDelete }) {
    const formattedDate = new Date(document.created_at).toLocaleDateString("en-US");

    return (
        <div className="document-container">
            <p><strong>Agile PN:</strong> {document.agile_pn}</p>
            <p><strong>Agile Rev:</strong> {document.agile_rev}</p>
            <p><strong>Title:</strong> {document.doc_title}</p>
            <p><strong>Type:</strong> {document.doc_type}</p>
            <p><strong>Doc ID:</strong> {document.doc_id}</p>
            <p className="document-date">{formattedDate}</p>
            <button className="delete-button" onClick={() => onDelete(document.id)}>
                Delete
            </button>
        </div>
    );
}

export default Document;
