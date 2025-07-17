import { useEffect, useState } from "react";
import api from "../api";
import DocumentTable from "../components/document_table";
import Layout from "../components/base";
import CytoscapeGraph from "../components/cytoscape";
import exportTableToCSV from "../components/table_export";

function Home() {
	const [documents, setDocuments] = useState([]);
	const [highlighted, setHighlighted] = useState(null);

	useEffect(() => {
		api
			.get("/documents/")
			.then((res) => {
				const data = res.data;
				data.sort((a, b) => {
					const orderA = a.order !== undefined ? a.order : 9999;
					const orderB = b.order !== undefined ? b.order : 9999;
					return orderA - orderB;
				});
				setDocuments(data);
			})
			.catch((err) => alert(err));
	}, []);

	// Handler when a node in Cytoscape is selected
	const handleSelect = (nodeId) => {
		setHighlighted(nodeId);
	};

	return (
		<Layout>
			<div>
				<CytoscapeGraph
					documents={documents}
					highlighted={highlighted}
					onNodeSelect={handleSelect}
				/>
				{/* Pass documents and highlighted to DocumentTable so it can highlight & update properly */}
				<br />
				<DocumentTable
					documents={documents}
					highlighted={highlighted}
					setHighlighted={setHighlighted}
					refreshDocuments={() => {
						api.get("/documents/").then(res => setDocuments(res.data));
					}}
				/>
				<br />
				<div className="center-class">
					<button className="btn-dark" onClick={() => exportTableToCSV()}>
						Export CSV
					</button>
				</div>
			</div>
		</Layout>
	);
}

export default Home;