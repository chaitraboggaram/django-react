const documentFields = [
	{ key: "agile_pn", label: "Agile PN" },
	{ key: "agile_rev", label: "Agile Rev" },
	{ key: "doc_title", label: "Document Title" },
	{ key: "doc_type", label: "Document Type" },
	{ key: "doc_id", label: "Document ID" },
];

const headerMap = documentFields.reduce((map, field) => {
	map[field.label] = field.key;
	return map;
}, {});

export { documentFields, headerMap };
export default documentFields;