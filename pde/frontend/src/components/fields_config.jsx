const documentFields = [
	// { key: "agile_pn", label: "Agile PN", className: "center-class" },
	// { key: "agile_rev", label: "Agile Rev", className: "center-class" },
	// { key: "doc_title", label: "Document Title", className: "" },
	{ key: "project_id", label: "Project ID", className: "" },
	{ key: "doc_type", label: "Document Type", className: "" },
	{ key: "doc_id", label: "Document ID", className: "center-class" },
];

const docURL = [{ key: "doc_url", label: "Document URL", className: "" }];

const headerMap = {
	"Project ID": "project_id",
	"Document Type": "doc_type",
	"Document ID": "doc_id"
};

export { documentFields, headerMap };
export { docURL };
export default documentFields;