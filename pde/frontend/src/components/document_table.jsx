import React, { useEffect, useRef, useState } from "react";
import api from "../api";
import {
	useReactTable,
	getCoreRowModel,
	getFilteredRowModel,
	getSortedRowModel,
	flexRender,
	createColumnHelper,
} from "@tanstack/react-table";
import documentFields from "./fields_config";
import { docURL } from "./fields_config";
import "../styles/document_table.css";

const columnHelper = createColumnHelper();

const documentTypeList = [
	"---",
	"Risks",
	"Requirements",
	"Specifications",
	"Testing",
	"Manufacturing",
	"Executed Protocols",
];

const docId = "doc_id";

function DocumentTable({ documents, highlighted, setHighlighted, refreshDocuments }) {
	const [globalFilter, setGlobalFilter] = useState("");
	const [sorting, setSorting] = useState([]);
	const [activeInputRowId, setActiveInputRowId] = useState(null);
	const tableRef = useRef(null);
	const [selectedColumn, setSelectedColumn] = useState(docId);
	const [columnFilter, setColumnFilter] = useState("");

	useEffect(() => {
		function handleClickOutside(event) {
			if (tableRef.current?.contains(event.target)) return;
			const isCyNode = event.target.closest(".cytoscape-container") &&
				(event.target.matches(".cy-node") || event.target.closest(".cy-node"));
			if (isCyNode) return;
			if (event.target.closest(".cytoscape-container")) return;
			setHighlighted(null);
		}

		document.addEventListener("mousedown", handleClickOutside);
		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, [setHighlighted]);

	const columns = documentFields.map(({ key, label }) =>
		columnHelper.accessor(key, {
			header: () => label,
			cell: (info) => info.getValue(),
		})
	);

	const table = useReactTable({
		data: Array.isArray(documents) ? documents : [],
		columns,
		state: { globalFilter, sorting },
		onGlobalFilterChange: setGlobalFilter,
		onSortingChange: setSorting,
		getCoreRowModel: getCoreRowModel(),
		getFilteredRowModel: getFilteredRowModel(),
		getSortedRowModel: getSortedRowModel(),
	});

	const deleteDocument = (id) => {
		api
			.delete(`/documents/delete/${id}/`)
			.then((res) => {
				if (res.status !== 204) alert("Failed to delete document.");
				refreshDocuments();
			})
			.catch((error) => alert(error));
	};

	const updateDocument = (id, updatedDoc) => {
		console.log("Updating doc id:", id, "with data:", updatedDoc);
		api.patch(`/documents/update/${id}/`, updatedDoc)
			.then((res) => {
				console.log("Update response:", res);
				if (res.status === 200) {
					refreshDocuments();
				} else {
					alert("Failed to update document.");
				}
			})
			.catch((err) => {
				console.error(err);
				alert("Error updating document");
			});
	};

	const createDocument = (newDoc) => {
		api
			.post("/documents/", newDoc)
			.then((res) => {
				if (res.status === 201) {
					refreshDocuments();
				} else {
					alert("Failed to make document.");
				}
			})
			.catch((err) => alert(err));
		window.location.reload();
	};

	const handleAddClick = (docId) => {
		setActiveInputRowId(docId === activeInputRowId ? null : docId);
	};

	const handleCancel = () => {
		setActiveInputRowId(null);
	};

	return (
		<div className="filter-container">
			<div className="filter-box">
				<label htmlFor="column-select" className="filter-label">Filter Column:</label>
				<select
					id="column-select"
					className="filter-select"
					value={selectedColumn}
					onChange={(e) => setSelectedColumn(e.target.value)}
				>
					{columns.map((col) => (
						<option key={col.id ?? col.accessorKey} value={col.accessorKey}>
							{typeof col.header === "function" ? col.header() : col.header}
						</option>
					))}
				</select>

				<label htmlFor="column-filter" className="filter-label">Search:</label>
				<input
					id="column-filter"
					className="filter-input"
					type="text"
					placeholder={`Filter by ${selectedColumn}`}
					value={columnFilter}
					onChange={(e) => {
						setColumnFilter(e.target.value);
						table.getColumn(selectedColumn)?.setFilterValue(e.target.value);
					}}
				/>
			</div>

			<div className="table-section">
				<table className="data-table" id="data-table" ref={tableRef}>
					<thead>
						{table.getHeaderGroups().map((headerGroup) => (
							<tr key={headerGroup.id}>
								{headerGroup.headers.map((header) => (
									<th
										key={header.id}
										onClick={header.column.getToggleSortingHandler()}
									>
										{flexRender(
											header.column.columnDef.header,
											header.getContext()
										)}
										{header.column.getIsSorted() === "asc"
											? " 🔼"
											: header.column.getIsSorted() === "desc"
												? " 🔽"
												: ""}
									</th>
								))}
								<th></th>
								<th></th>
								<th></th>
								<th></th>
							</tr>
						))}
					</thead>
					<tbody>
						{documents.length === 0 ? (
							<InputRow onCreate={createDocument} />
						) : (
							table.getRowModel().rows.map((row) => {
								const doc = row.original;
								return (
									<React.Fragment key={row.id}>
										<TableRow
											document={doc}
											onDelete={deleteDocument}
											onUpdate={updateDocument}
											onAddClick={() => handleAddClick(doc.id)}
											showAddButton={true}
											highlighted={highlighted === doc.id.toString()}
											setHighlighted={setHighlighted}
										/>
										{activeInputRowId === doc.id && (
											<InputRow
												onCreate={(newDoc) => {
													createDocument(newDoc);
													setActiveInputRowId(null);
												}}
												onCancel={handleCancel}
											/>
										)}
									</React.Fragment>
								);
							})
						)}
					</tbody>
				</table>
			</div>
		</div>
	);
}

function TableRow({ document, onDelete, onUpdate, onAddClick, showAddButton, highlighted, setHighlighted }) {
	const rowRef = useRef(null);
	const [isEditing, setIsEditing] = useState(false);
	const [editedDoc, setEditedDoc] = useState({ ...document });

	useEffect(() => {
		if (highlighted && rowRef.current) {
			rowRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
		}
	}, [highlighted]);

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
		<tr
			ref={rowRef}
			className={highlighted ? "highlighted-row" : ""}
			onClick={() => setHighlighted(document.id.toString())}
			style={{ cursor: "pointer" }}
		>
			{documentFields.map(({ key, className }) => (
				<td key={key} className={className}>
					{isEditing ? (
						key === "doc_type" ? (
							<select
								name={key}
								id={key}
								value={editedDoc[key] || ""}
								onChange={handleChange}
								className="user-select-input"
							>
								<option value="---" disabled>
									Select Document Type
								</option>
								{documentTypeList.map((type) => (
									<option key={type} value={type}>
										{type}
									</option>
								))}
							</select>
						) : (
							<input
								name={key}
								value={editedDoc[key] || ""}
								onChange={handleChange}
								className="user-text-input"
							/>
						)
					) : (
						document[key]
					)}
				</td>
			))}
			<td></td>
			<td></td>
			<td></td>
			<td className="text-center">
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

function InputRow({ onCreate, onCancel }) {
	const [errors, setErrors] = useState({});

	const initialState = [...documentFields, ...docURL].reduce((acc, field) => {
		acc[field.key] = "";
		return acc;
	}, {});

	const [formData, setFormData] = useState(initialState);

	const handleChange = (e) => {
		const { name, value } = e.target;
		setFormData((prev) => ({ ...prev, [name]: value }));
	};

	const handleClear = () => {
		setFormData(initialState);
		setErrors({});
	};

	const handleCancel = () => {
		handleClear();
		if (onCancel) onCancel();
	};

	const extractFromURL = (urlStr) => {
		try {
			const url = new URL(urlStr);
			const hashPath = url.hash.replace(/^#\/?/, "");
			const parts = hashPath.split("/").filter(Boolean);

			const result = {
				project_id: null,
				doc_type: null,
				doc_id: null,
			};

			const projectIdx = parts.indexOf("project");
			if (projectIdx !== -1 && parts.length > projectIdx + 1) {
				result.project_id = parts[projectIdx + 1];
			}

			for (let i = 0; i < parts.length; i++) {
				if (documentTypeList.includes(parts[i])) {
					result.doc_type = parts[i];
					if (i + 1 < parts.length) {
						result.doc_id = decodeURIComponent(parts[i + 1]);
					}
					break;
				}
			}

			return result;
		} catch {
			return { project_id: null, doc_type: null, doc_id: null };
		}
	};

	const handleSubmit = (e) => {
		e.preventDefault();

		let newErrors = {};

		const isDocURLProvided = docURL.some(({ key }) => formData[key]?.trim() !== "");
		const isDocFieldsProvided = documentFields.some(
			({ key }) => key !== "doc_type" && formData[key]?.trim() !== ""
		);

		if (isDocURLProvided && isDocFieldsProvided) {
			newErrors["doc_url"] = "Please provide either Document URL or document fields, not both.";
		} else if (!isDocURLProvided && !isDocFieldsProvided) {
			newErrors["doc_url"] = "Please fill either Document URL or document fields.";
			documentFields.forEach(({ key }) => {
				newErrors[key] = "This field is required.";
			});
		} else if (isDocFieldsProvided) {
			documentFields.forEach(({ key }) => {
				const value = formData[key]?.trim() ?? "";
				if (key === "doc_type" && value === "---") {
					newErrors[key] = "Please select a document type.";
				} else if (value === "") {
					newErrors[key] = "This field is required.";
				}
			});
		} else if (isDocURLProvided) {
			docURL.forEach(({ key }) => {
				const value = formData[key]?.trim() ?? "";
				if (value === "") {
					newErrors[key] = "Document URL is required.";
				}
			});
		}

		if (Object.keys(newErrors).length > 0) {
			setErrors(newErrors);
			return;
		}

		setErrors({});

		if (formData.doc_url && formData.doc_url.trim() !== "") {
			const extracted = extractFromURL(formData.doc_url.trim());
			if (!extracted.project_id || !extracted.doc_type || !extracted.doc_id) {
				setErrors({ doc_url: "URL does not contain valid project ID, doc type, or doc ID." });
				return;
			}
			onCreate({
				...formData,
				project_id: extracted.project_id,
				doc_type: extracted.doc_type,
				doc_id: extracted.doc_id,
			});
		} else {
			onCreate(formData);
		}

		handleClear();
		if (onCancel) onCancel();
	};

	return (
		<tr>
			{documentFields.map(({ key, label }) => (
				<td key={key}>
					{key === "doc_type" ? (
						<>
							<select
								name={key}
								id={key}
								required
								value={formData[key]}
								onChange={handleChange}
								className={`user-select-input ${errors[key] ? "input-error" : ""}`}
							>
								{documentTypeList.map((option) => (
									<option key={option} value={option}>
										{option}
									</option>
								))}
							</select>
							{errors[key] && <div className="error-message">{errors[key]}</div>}
						</>
					) : (
						<>
							<input
								type="text"
								name={key}
								id={key}
								placeholder={label}
								required
								value={formData[key]}
								onChange={handleChange}
								className={`user-text-input ${errors[key] ? "input-error" : ""}`}
							/>
							{errors[key] && <div className="error-message">{errors[key]}</div>}
						</>
					)}
				</td>
			))}

			<td className="or-column" style={{ fontWeight: "bold", textAlign: "center" }}>OR</td>

			{docURL.map(({ key, label }) => (
				<td key={key} colSpan={2}>
					<input
						type="text"
						name={key}
						id={key}
						placeholder={label}
						required
						value={formData[key]}
						onChange={handleChange}
						className={`user-text-input ${errors[key] ? "input-error" : ""}`}
					/>
					{errors[key] && <div className="error-message">{errors[key]}</div>}
				</td>
			))}

			<td>
				<button type="button" className="icon-button done" onClick={handleSubmit}>
					<img
						src={`${import.meta.env.BASE_URL}src/assets/check.png`}
						alt="Submit"
						className="button-icon"
					/>
				</button>
				<button type="button" className="icon-button clear" onClick={handleClear}>
					<img
						src={`${import.meta.env.BASE_URL}src/assets/clear.png`}
						alt="Clear"
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
			</td>
		</tr>
	);
}

export default DocumentTable;