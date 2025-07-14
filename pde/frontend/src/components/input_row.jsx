import { useState } from "react";
import documentFields from "./fields_config";

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

		// Validate all fields are filled (trimmed)
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

export default InputRow;