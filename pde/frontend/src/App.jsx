import React, { useEffect, useState } from 'react';
import axios from 'axios';

function App() {
	const [message, setMessage] = useState('');

	useEffect(() => {
		axios.get('http://localhost:8000/')
			.then(res => setMessage(res.data.message))
			.catch(err => console.error('API Error:', err));
	}, []);

	return (
		<div>
			<h2>Backend Message:</h2>
			<p>{message}</p>
		</div>
	);
}

export default App;