import React, { useEffect, useRef } from "react";
import cytoscape from "cytoscape";
import "../styles/cytoscape.css";

const document_colors = {
	Requirement: "#1f77b4",
	Design: "#ff7f0e",
	Test: "#2ca02c",
	Specification: "#d62728",
	Task: "#9467bd",
	Development: "#8c564b",
	Risk: "#e377c2",
	Unknown: "gray",
};

export default function CytoscapeGraph({
	documents = [],
	layoutName = "breadthfirst",
	darkMode = false,
	highlighted,
	onNodeSelect,
}) {
	const containerRef = useRef(null);
	const cyRef = useRef(null);

	const buildGraphElements = (docs) => {
		const nodes = docs.map((doc) => ({
			data: {
				id: doc.id.toString(),
				label: doc.title || doc.doc_title || `Doc ${doc.id}`,
				doc_type: doc.doc_type || "Unknown",
			},
		}));

		const edges = [];
		return [...nodes, ...edges];
	};

	useEffect(() => {
		if (containerRef.current && Array.isArray(documents) && documents.length > 0) {
			if (cyRef.current) {
				cyRef.current.destroy();
				cyRef.current = null;
			}

			cyRef.current = cytoscape({
				container: containerRef.current,
				elements: buildGraphElements(documents),
				style: [
					{
						selector: "node",
						style: {
							label: "data(label)",
							shape: "ellipse",
							width: 50,
							height: 50,
							"background-color": (ele) => {
								const docType = ele.data("doc_type");
								return document_colors[docType] || document_colors["Unknown"];
							},
							color: darkMode ? "#fff" : "white",
							"text-valign": "center",
							"text-halign": "center",
							"transition-property": "background-color, border-color, width, height, opacity",
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
							"transition-property": "line-color",
							"transition-duration": "0.3s",
						},
					},
					{
						selector: ".highlighted",
						style: {
							width: 80,
							height: 80,
							"z-index": 10,
						},
					},
					{
						selector: ".dimmed",
						style: {
							opacity: 0.2,
						},
					},
				],
				layout: {
					name: layoutName,
					animate: false,
					animationDuration: 0,
				},
			});

			// Tap on node → highlight it
			cyRef.current.on("tap", "node", (event) => {
				event.originalEvent.preventDefault();
				const nodeId = event.target.id();

				// Highlight selected and dim others
				cyRef.current.nodes().removeClass("highlighted dimmed");
				cyRef.current.nodes().forEach((n) => {
					if (n.id() === nodeId) {
						n.addClass("highlighted");
					} else {
						n.addClass("dimmed");
					}
				});

				onNodeSelect && onNodeSelect(nodeId);
			});

			// Tap on background → clear highlight
			cyRef.current.on("tap", (event) => {
				if (event.target === cyRef.current) {
					cyRef.current.nodes().removeClass("highlighted dimmed");
					onNodeSelect && onNodeSelect(null);
				}
			});
		}
	}, [documents, layoutName, darkMode, onNodeSelect]);

	useEffect(() => {
		if (cyRef.current) {
			cyRef.current.nodes().removeClass("highlighted dimmed");
			if (highlighted) {
				cyRef.current.nodes().forEach((node) => {
					if (node.id() === highlighted) {
						node.addClass("highlighted");
					} else {
						node.addClass("dimmed");
					}
				});
			}
		}
	}, [highlighted]);

	return <div ref={containerRef} className="graph-section" />;
}