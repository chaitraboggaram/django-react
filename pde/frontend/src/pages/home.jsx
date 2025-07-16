import { useState } from "react";
import api from "../api";
import DocumentTable from "../components/document_table";
import FileInput from "../components/file_input";
import Layout from "../components/base";
import "../styles/home.css";

function Home() {
	// We don't need csvDocuments state anymore
	// Just upload CSV and reload backend documents

	const handleCsvParsed = async (docsFromCsv) => {
		try {
			// Upload each document with order field
			for (let i = 0; i < docsFromCsv.length; i++) {
				const docWithOrder = { ...docsFromCsv[i], order: i };
				await api.post("/documents/", docWithOrder);
			}
			// After upload, reload the page or update state to refresh DocumentTable
			window.location.reload();
		} catch (err) {
			console.error("Error uploading CSV documents:", err);
		}
	};

	return (
		<Layout>
			<FileInput onCsvParsed={handleCsvParsed} />
		</Layout>
	);
}

export default Home;