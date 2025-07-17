function exportTableToCSV(filename = "table_export.csv") {
	const table = document.getElementById("data-table");
	if (!table) {
		alert("Table not found!");
		return;
	}

	let csv = [];
	for (let row of table.rows) {
		let rowData = [];
		for (let cell of row.cells) {
			let cellText = cell.innerText.replace(/"/g, '""');
			rowData.push(`"${cellText}"`);
		}
		csv.push(rowData.join(","));
	}

	const csvString = csv.join("\n");
	const blob = new Blob([csvString], { type: "text/csv" });
	const url = URL.createObjectURL(blob);

	const a = document.createElement("a");
	a.href = url;
	a.download = filename;
	a.click();

	URL.revokeObjectURL(url);
}

export default exportTableToCSV;