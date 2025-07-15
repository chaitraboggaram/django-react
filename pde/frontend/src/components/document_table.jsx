import { useEffect, useState } from "react";
import api from "../api";
import DocumentList from "./document_list";
import InputRow from "./input_row";
import "../styles/table.css";
import {
	useReactTable,
	getCoreRowModel,
	getFilteredRowModel,
	getSortedRowModel,
	flexRender,
	createColumnHelper,
} from "@tanstack/react-table";
import "../styles/document.css";

const columnHelper = createColumnHelper();

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
		<div className="document-container">
			<div className="filter-box">
				<input
					type="text"
					placeholder="Filter documents..."
					value={globalFilter ?? ""}
					onChange={(e) => setGlobalFilter(e.target.value)}
				/>
			</div>
			<form>
				<table className="input-table">
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
							<>
								<DocumentList
									documents={documents}
									onDelete={deleteDocument}
									onUpdate={updateDocument}
									onCreate={createDocument}
								/>
							</>
						)}
					</tbody>
				</table>
			</form>
		</div>
	);
}

export default DocumentTable;