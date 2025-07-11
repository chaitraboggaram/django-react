# React-Django App
## Table of Contents
1. [Initial Set Up](#Initial-Set-Up)
	1.1. [Set Up a Virtual Environment](#1-set-up-a-virtual-environment)
	1.2. [Install Required Packages](#2-install-required-packages)

2. [Create a Django Project and Application](#create-a-django-project-and-application)
	2.1 [Create Django Project](#1-Create-Django-Project)
	2.2 [Create Django App](#2-Create-Django-App)
	2.3 [Register Django App and enable CORS](#3-Register-Django-App-and-enable-CORS)
	2.4 [Configure URL Routing](#4-Configure-URL-Routing)
		2.4.1 [Configure Application-Level URLs](#Configure-Application-Level-URLs)
		2.4.2 [Configure Application-Level URLs in Project URLs](#Configure-Application-Level-URLs-in-Project-URLs)
	2.5 [Create Sample View to Print Hello World](#5-Create-Sample-View-to-print-Hello-World)
	2.6 [Run the Development Server](#6-Run-the-Development-Server)

<br>

---

## Initial Set Up
### 1. Set Up a Virtual Environment
#### On Windows
```bash
python -m venv .venv
.\.venv\Scripts\activate
```

#### On macOS / Linux
```bash
python3 -m venv .venv
source .venv/bin/activate
```

<br>

---

### 2. Install Required Packages
```bash
pip install django djangorestframework django-cors-headers dotenv
```

#### Save Dependencies
```bash
pip freeze > requirements.txt
```

#### Install from `requirements.txt`
```bash
pip install -r requirements.txt
```
To install without any dependencies
```bash
pip install --no-deps -r requirements.txt
```

<br>

---

## Create a Django Project and Application
> Note: To Copy relative path
Windows: Ctrl + K + Ctrl + Shift + C
Mac: Option + Shift + Command + C

<br>

### 1. Create Django Project
```bash
django-admin startproject pde
```

<br>

### 2. Create Django App
```bash
cd pde
python manage.py startapp tvt
```

<br>

### 3. Register Django App and enable CORS
Open `pde/pde/settings.py` and add the newly created app to the `INSTALLED_APPS` list:
```py
INSTALLED_APPS = [
	...
	'tvt',
    'rest_framework',
    'corsheaders',
]


MIDDLEWARE = [
    ...
    'corsheaders.middleware.CorsMiddleware'
]

CORS_ALLOW_ALL_ORIGINS = True
```

<br>

### 4. Configure URL Routing
#### Configure Application-Level URLs
Create a new file at `pde\tvt\urls.py` with the following content:
```py
from django.urls import path
from . import views

urlpatterns = [
    path("", views.get_data),
]
```

<br>

#### Configure Application-Level URLs in Project URLs
Modify `pde\pde\urls.py` to include the app's URLs:
```py
from django.contrib import admin
from django.urls import path, include

urlpatterns = [
	path("admin/", admin.site.urls),
	path("", include("tvt.urls")),
]
```
> Tip: To namespace the app under a route (e.g., `test/`), use: `path("test/", include("tvt.urls"))`

<br>

### 5. Create Sample View to Print Hello World
Update `pde/tvt/views.py`
```py
from rest_framework.response import Response
from rest_framework.decorators import api_view

@api_view(['GET'])
def get_data(request):
    return Response({'message': 'Hello from Django!'})

```

<br>

### 6. Run the Development Server
```bash
python manage.py runserver
```
Visit: http://127.0.0.1:8000/

<br>

---

## Create React Frontend App
### Create React App Inside Django Project Folder
```bash
cd pde
npm create vite@latest frontend -- --template react
```

### Install Axios for API calls
```bash
cd frontend
npm install axios react-router-dom jwt-decode
```

<br>

---

### Update App code
Update `pde/frontend/src/App.js`
```js
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
```

<br>

---

### Start the Frontend
```bash
cd pde/frontend
npm start
```

### Start the Backend in new terminal
```bash
cd pde
python manage.py runserver
```
> Note: Make sure both frontend and backend both are running to allow frontend can communicate with the backend

<br>

---

### Organize files
1. Delete all css files in pde\frontend\src\assets

2. Update
`pde\frontend\src\App.jsx`
```js
import react from "react";

function App() {
  const [count, setCount] = useState(0);

  return (
    <>

    </>
  );
}

export default App;
```

`pde\frontend\src\main.jsx`
```js
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
```

3. Create below directories
`pde\frontend\src\components`
`pde\frontend\src\pages`
`pde\frontend\src\styles`

4. Create the below files
`pde\frontend\.env`

`pde\frontend\src\constants.js`
```js
// We will use local storage to store access token and refresh token in our browser, so these will be the keys

export const ACCESS_TOKEN = "access";
export const REFRESH_TOKEN = "refresh";
```

`pde\frontend\src\api.js`
```js
// This is a Interceptor that Intercepts any requests send will automatically add the correct header so that we don't have to rewrite it again. We will use axios and it will automatically add the accesss token to our requests

import axios from "axios";						// Import the Axios library to handle HTTP requests
import { ACCESS_TOKEN } from "./constants";		// Import a constant key name used to store/retrieve the token from localStorage


// Create a reusable Axios instance with a base URL
const api = axios.create({
	baseURL: import.meta.env.VITE_API_URL  		// Importing the base URL from the .env file
});

// Set up an interceptor to automatically modify all outgoing requests
api.interceptors.request.use(
	(config) => {
		const token = localStorage.getItem(ACCESS_TOKEN);	// Retrieve the access token from localStorage using the constant key defined in constants.js

		// If a token is found, attach it as a Bearer token in the Authorization header
		if (token) {
			config.headers.Authorization = `Bearer ${token}`;
		}

		return config;			// Return the modified request configuration
	},
	(error) => {
		return Promise.reject(error);	// If there's an error in the request, reject the promise with the error
	}
);

export default api;	// Export the configured Axios instance for use in other parts of the application instead of creating a new Axios instance each time
```

<br>

---


### Writing Protected Routes
1. Create a file in `pde/frontend/src/components/protected_route.jsx`
This wrapper for a protected route
```js
import { Navigate } from "react-router-dom"; 	// Import Navigate from React Router to redirect unauthorized users
import { jwtDecode } from "jwt-decode";			// Import jwtDecode to decode JWT tokens and read their payload (like expiry time)
import api from "../api";						// Import a pre-configured axios instance
import { ACCESS_TOKEN, REFRESH_TOKEN } from "../constants";		// Import token keys from a constants file
import { useEffect, useState } from "react";		// React hooks

// This component wraps protected routes and ensures the user is authenticated
function ProtectedRoute({ children }) {
	const [isAuthorized, setIsAuthorized] = useState(null);			// State to track if the user is authorized to access the route

	// Run this function once when the component mounts to check auth status
	useEffect(() => {
		auth().catch(() => setIsAuthorized(false));
	}, []);

	// Attempts to refresh the access token using the refresh token
	const refreshToken = async () => {
		const refreshToken = localStorage.getItem(REFRESH_TOKEN); // Get refresh token from storage

		try {
			const response = await api.post("/api/token/refresh/", { refresh: refreshToken });		// Send a request to the token refresh endpoint

			// If refresh fails, mark as unauthorized
			if (response.status !== 200) {
				setIsAuthorized(false);
			} else {
				// Save new access token and mark user as authorized
				localStorage.setItem(ACCESS_TOKEN, response.data.access);
				setIsAuthorized(true);
			}
		} catch (error) {
			console.error("Error refreshing token:", error);
			setIsAuthorized(false);
		}
	};

	// Checks whether the access token is valid or expired
	const auth = async () => {
		const accessToken = localStorage.getItem(ACCESS_TOKEN); // Get current access token
		if (!accessToken) {
			setIsAuthorized(false); // No token = not logged in
			return;
		}

		try {
			const decoded = jwtDecode(accessToken); // Decode token to get expiry
			const tokenExpiry = decoded.exp;
			const currentTime = Date.now() / 1000; // Get current time in seconds

			// If token is expired, try refreshing it
			if (tokenExpiry < currentTime) {
				await refreshToken();
			} else {
				// Token is valid
				setIsAuthorized(true);
			}
		} catch (error) {
			console.error("Error decoding access token:", error);
			setIsAuthorized(false);
		}
	};

	// Show a loading message while checking authorization
	if (isAuthorized === null) {
		return <div>Loading...</div>; // You can replace with a spinner
	}

	// If authorized, render the child route/component. Otherwise, redirect to login.
	return isAuthorized ? children : <Navigate to="/login" />;
}

export default ProtectedRoute;
```

<br>

---

