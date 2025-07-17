const documentFields = [
	// { key: "agile_pn", label: "Agile PN", className: "center-class" },
	// { key: "agile_rev", label: "Agile Rev", className: "center-class" },
	// { key: "doc_title", label: "Document Title", className: "" },
	{ key: "project_id", label: "Project ID", className: "" },
	{ key: "doc_type", label: "Document Type", className: "" },
	{ key: "doc_id", label: "Document ID", className: "center-class" },
];

const docURL = [{ key: "doc_url", label: "Document URL", className: "" }];

const headerMap = documentFields.reduce((map, field) => {
	map[field.label] = field.key;
	return map;
}, {});

export { documentFields, headerMap };
export { docURL };
export default documentFields;