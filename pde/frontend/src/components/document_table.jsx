import React, { useEffect, useState } from "react";
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
import "../styles/document_table.css";

const columnHelper = createColumnHelper();

function DocumentList({ documents, onDelete, onUpdate, onCreate, highlighted }) {
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
					<TableRow
						document={doc}
						onDelete={onDelete}
						onUpdate={onUpdate}
						onAddClick={() => handleAddClick(doc.id)}
						showAddButton={true}
						highlighted={highlighted === doc.id.toString()}
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

function DocumentTable() {
	const [documents, setDocuments] = useState([]);
	const [highlighted, setHighlighted] = useState(null);
	const [globalFilter, setGlobalFilter] = useState("");
	const [sorting, setSorting] = useState([]);

	useEffect(() => {
		getDocuments();
	}, []);

	const getDocuments = () => {
		api
			.get("/documents/")
			.then((res) => res.data)
			.then((data) => {
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

	const columns = [
		columnHelper.accessor("agile_pn", {
			header: () => "Agile PN",
			cell: (info) => info.getValue(),
		}),
		columnHelper.accessor("agile_rev", {
			header: () => "Agile Rev",
			cell: (info) => info.getValue(),
		}),
		columnHelper.accessor("title", {
			header: () => "Document Title",
			cell: (info) => info.getValue(),
		}),
		columnHelper.accessor("doc_type", {
			header: () => "Document Type",
			cell: (info) => info.getValue(),
		}),
		columnHelper.accessor("id", {
			header: () => "Document ID",
			cell: (info) => info.getValue(),
		}),
	];

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

	return (
		<div className="filter-container">
			<div className="filter-box">
				<input
					type="text"
					placeholder="Filter documents..."
					value={globalFilter ?? ""}
					onChange={(e) => setGlobalFilter(e.target.value)}
				/>
			</div>
			<form>
				<table className="data-table">
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
							</tr>
						))}
					</thead>
					<tbody>
						{documents.length === 0 ? (
							<InputRow onCreate={createDocument} />
						) : (
							<DocumentList
								documents={documents}
								onDelete={deleteDocument}
								onUpdate={updateDocument}
								onCreate={createDocument}
								highlighted={highlighted}
							/>
						)}
					</tbody>
				</table>
			</form>
		</div>
	);
}

function TableRow({ document, onDelete, onUpdate, onAddClick, showAddButton, highlighted }) {
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
		<tr className={highlighted ? "highlighted-row" : ""}>
			{documentFields.map(({ key, className }) => (
				<td key={key} className={className}>
					{isEditing ? (
						<input
							name={key}
							value={editedDoc[key] || ""}
							onChange={handleChange}
						/>
					) : (
						document[key]
					)}
				</td>
			))}
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
	const initialState = documentFields.reduce((acc, field) => {
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
	};

	const handleCancel = () => {
		handleClear();
		if (onCancel) onCancel();
	};

	const handleSubmit = (e) => {
		e.preventDefault();

		const allFilled = documentFields.every(({ key }) => formData[key].trim() !== "");
		if (!allFilled) {
			alert("Please fill in all fields before submitting.");
			return;
		}

		onCreate(formData);
		handleClear();
		if (onCancel) onCancel();
	};

	return (
		<tr>
			{documentFields.map(({ key, label }) => (
				<td key={key}>
					<input
						type="text"
						name={key}
						id={key}
						placeholder={label}
						required
						value={formData[key]}
						onChange={handleChange}
					/>
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