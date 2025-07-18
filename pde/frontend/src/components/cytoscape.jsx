import { useEffect, useRef, useState } from "react";
import cytoscape from "cytoscape";
import api from "../api";
import "../styles/cytoscape.css";

const space_colors = {
	Risks: "#e377c2",
	Requirements: "#ff7f0e",
	Specifications: "#53b047",
	Testing: "#2dc0d0",
	Manufacturing: "#d62728",
	"Executed Protocols": "#9467bd",
	Unknown: "gray",
};

const workitem_colors = {
	"clinRisk": "#d87cb3",
	"clinRiskRecord": "#de0b80",
	"usabRisk": "#d87cb3",
	"usabRiskRecord": "#de0b80",
	"cyberRisk": "#d87cb3",
	"cyberRiskRecord": "#de0b80",
	"prodRiskRecord": "#de0b80",
	"designFailureMode": "#d87cb3",
	"dfmeaRiskRecord": "#de0b80",
	"processFailureMode": "#b3a5d0",
	"pfmeaRiskRecord": "#6b54a4",
	"softHazard": "#d87cb3",
	"shaRiskRecord": "#de0b80",
	"prodReqt": "#e74228",
	"accReqt": "#e88124",
	"algoReqt": "#e88124",
	"elecReqt": "#e88124",
	"extReqt": "#e88124",
	"ifuReqt": "#e88124",
	"instrReqt": "#e88124",
	"mechReqt": "#e88124",
	"networkReqt": "#e88124",
	"softReqt": "#e88124",
	"visionReqt": "#e88124",
	"mfgReqt": "#d56c28",
	"functionalSpec": "#53b047",
	"testDesignSpec": "#53b047",
	"eftSpec": "#1d783b",
	"designvvTestCase": "#2dc0d0",
	"mfgTestCase": "#1faead",
	"hm": "#f79a2a",
	"nonHm": "#166db6",
	"miniMitigation": "#969696",
	"pointer": "#ead171",
	"versionRevision": "#acc5cf",
	"testArticle": "#acc5cf",
	"testSysConfig": "#acc5cf",
	"testEquipment": "#acc5cf",
	"testEquipNoCalib": "#acc5cf",
	"testerInformation": "#acc5cf",
	"testLocation": "#acc5cf",
	"devicesUnderTest": "#acc5cf",
	"testReview": "#acc5cf",
	"sampleSizeJust": "#c6cccf",
	"controlArticle": "#c6cccf",
	"purposeTestData": "#acc5cf",
	"scopeTestData": "#acc5cf"
};

const document_colors = {
	clinRiskDoc: "#874687ff",
	usabRiskDoc: "#03364aff",
	cyberRiskDoc: "#66aeaeff",
	cyberNonRiskDoc: "#c0c0c0ff",
	designFMEADoc: "#072a07ff",
	processFMEADoc: "#188f18ff",
	swHazardDoc: "#61bdbdff",
	reqtDoc: "#08413cff",
	mfgLineReqDoc: "#6c6767ff",
	specDoc: "#1c5a15ff",
	processDOD: "#FFA500",
	productDOD: "#ebc172ff",
	eftSpecDoc: "#409be0ff",
	vvProtocolDoc: "#FF7F50",
	mfgQualProtocolDoc: "#96c3e5ff",
	traceClosure: "#C0C0C0",
	assetEvalDoc: "#223e35ff",
	generic: "#d7d1efff",
	vvExecutedProtocolDoc: "#eedb2aff",
	vvTestReportDoc: "#743c70ff",
	mfgExecutedProtocolDoc: "#efdc36ff",
	mfgTestReportDoc: "#965677ff",
	prodNonRiskDoc: "#82375eff",
	riskAssContDoc: "#d373a4ff",
	processSpecDoc: "#006400",
	humanFacTaskAnalysisDoc: "#8B0000"
};

export default function CytoscapeGraph({
	layoutName = "cose",
	darkMode = false,
	highlighted,
	onNodeSelect,
}) {
	const containerRef = useRef(null);
	const cyRef = useRef(null);
	const [documents, setDocuments] = useState([]);

	useEffect(() => {
		api
			.get("/documents_with_links/")
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

	const buildGraphElements = (docs) => {
		const docMap = new Map(docs.map((doc) => [doc.id.toString(), doc]));

		const nodes = docs.map((doc) => {
			const fullLabel = doc.doc_title || doc.doc_id || `Doc ${doc.id}`;
			const trimmedLabel = fullLabel.slice(0, 50);
			const fontSize = trimmedLabel.length > 30 ? "8px" : "10px";

			return {
				data: {
					id: doc.id.toString(),
					label: trimmedLabel,
					doc_type: doc.doc_type || "Unknown",
					fontSize,
				},
			};
		});

		const edges = [];
		docs.forEach((doc) => {
			if (Array.isArray(doc.linked_docs)) {
				doc.linked_docs.forEach((linkedDoc) => {
					const targetId = linkedDoc.id?.toString();
					if (targetId && docMap.has(targetId)) {
						edges.push({
							data: {
								id: `${doc.id}-${targetId}`,
								source: doc.id.toString(),
								target: targetId,
							},
						});
					}
				});
			}
		});

		return [...nodes, ...edges];
	};

	useEffect(() => {
		if (containerRef.current && documents.length > 0) {
			if (cyRef.current) {
				cyRef.current.destroy();
				cyRef.current = null;
			}

			const cy = cytoscape({
				container: containerRef.current,
				elements: buildGraphElements(documents),
				style: [
					{
						selector: "node",
						style: {
							label: "data(label)",
							shape: "ellipse",
							width: 60,
							height: 60,
							"background-color": (ele) => {
								const docType = ele.data("doc_type");
								return space_colors[docType] || space_colors["Unknown"];
							},
							color: darkMode ? "#fff" : "#000",
							"text-valign": "center",
							"text-halign": "center",
							"font-size": (ele) => ele.data("fontSize") || "10px",
							"font-weight": "bold",
							"text-wrap": "wrap",
							"text-max-width": "55px",
							"transition-property": "background-color, opacity",
							"transition-duration": "0.3s",
						},
					},
					{
						selector: "edge",
						style: {
							width: 2,
							"line-color": darkMode ? "#888" : "#ccc",
							"target-arrow-color": darkMode ? "#888" : "#ccc",
							"target-arrow-shape": "triangle",
							"curve-style": "bezier",
						},
					},
					{
						selector: "node.highlighted",
						style: {
							width: 90,
							height: 90,
							"font-size": "12px",
							"z-index": 10,
						},
					},
					{
						selector: "edge.highlighted",
						style: {
							"line-color": "black",
							"target-arrow-color": "black",
							width: 3,
						},
					},
					{
						selector: ".dimmed",
						style: {
							opacity: 0.2,
							"text-opacity": 0.1,
							"background-opacity": 0.2,
						},
					},
				],
				layout: {
					name: layoutName,
					animate: false,
				},
			});

			cyRef.current = cy;

			const highlightConnected = (node) => {
				const connected = node.closedNeighborhood().union(node.connectedEdges());
				const all = cy.elements();

				all.removeClass("highlighted dimmed");
				connected.addClass("highlighted");
				all.difference(connected).addClass("dimmed");
			};

			cy.on("tap", "node", (event) => {
				const node = event.target;
				highlightConnected(node);
				onNodeSelect?.(node.id());
				event.originalEvent.preventDefault();
			});

			cy.on("tap", (event) => {
				if (event.target === cy) {
					cy.elements().removeClass("highlighted dimmed");
					onNodeSelect?.(null);
				}
			});

			window.addEventListener("resize", () => cy.resize());
			return () => window.removeEventListener("resize", () => cy.resize());
		}
	}, [documents, layoutName, darkMode, onNodeSelect]);

	useEffect(() => {
		if (cyRef.current) {
			const cy = cyRef.current;
			cy.elements().removeClass("highlighted dimmed");

			if (highlighted) {
				const node = cy.getElementById(highlighted);
				if (node) {
					const connected = node.closedNeighborhood().union(node.connectedEdges());
					connected.addClass("highlighted");
					cy.elements().difference(connected).addClass("dimmed");
				}
			}
		}
	}, [highlighted]);

	return <div ref={containerRef} className="cytoscape-container graph-section" />;
}