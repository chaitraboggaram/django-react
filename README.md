# React-Django App
## Table of Contents
1. [Initial Set Up](#Initial-Set-Up)
	1.1. [Set Up a Virtual Environment](#1-set-up-a-virtual-environment)
	1.2. [Install Required Packages](#2-install-required-packages)

2. [Create a Django Project and Application](#create-a-django-project-and-application)
	2.1 [Create Django Project](#1-Create-Django-Project)
	2.2 [Create Django App](#2-Create-Django-App)
	2.3 [Register Django App](#3-Register-Django-App)
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
pip install django djangorestframework django-cors-headers dotenv djangorestframework-simplejwt
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

### 3. Register Django App
Open `pde/pde/settings.py` and add the newly created app to the `INSTALLED_APPS` list:
```py
INSTALLED_APPS = [
	...
	'tvt',
    'rest_framework',
]
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
### Pre-Requisites
Install node.js from `https://nodejs.org/en/download`

<br>

### Create React App Inside Django Project Folder
```bash
cd pde
npm create vite@latest frontend -- --template react
```

### Install Axios for API calls
```bash
cd frontend
npm install axios react-router-dom jwt-decode cytoscape @tanstack/react-table
npm run dev
```

<br>

---

### Update App code
Update `pde/frontend/src/App.jsx`
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
1. Delete all CSS files in `pde/frontend/src/assets`, along with any references to them in other files.

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
```
VITE_API_URL="http://127.0.0.1:8000"
```

<br>

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
```jsx
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

### Navigation and Routes
1. Create files
`pde/frontend/src/pages/home.jsx`
```jsx
function Home() {
	return <div>Home</div>
}

export default Home
```

<br>

`pde/frontend/src/pages/login.jsx`
```jsx
function Login() {
	return <div>Login</div>
}

export default Login
```

<br>

`pde/frontend/src/pages/not_found.jsx`
```jsx
function NotFound() {
	return <div>Not Found</div>
}

export default NotFound
```

<br>

`pde/frontend/src/pages/register.jsx`
```jsx
function Register() {
	return <div>Register</div>
}

export default Register
```

<br>

2. Update `pde/frontend/src/App.jsx`
```jsx
import react from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/login";
import Register from "./pages/register";
import NotFound from "./pages/not_found";
import Home from "./pages/home";
import ProtectedRoute from "./components/protected_route";

function Logout() {
	localStorage.clear();
	return <Navigate to="/login" />;
}

function RegisterAndLogout() {
	localStorage.clear();
	return <Register />;
}

function App() {
	return (
		<BrowserRouter>
			<Routes>
				<Route
					path="/"
					element={
						<ProtectedRoute>
							<Home />				{/*  You cannot access home until you have successfully authenticated */}
						</ProtectedRoute>
					}
				/>
				<Route path="/login" element={<Login />} />			{/*  No authentication is required to access these */}
				<Route path="/logout" element={<Logout />} />
				<Route path="/register" element={<Register />} />
				<Route path="*" element={<NotFound />} />
			</Routes>
		</BrowserRouter>
	);
};

export default App;
```

<br>

### Running frontend
```bash
npm install
npm run dev
```
Access the local host at http://localhost:5173/

<br>

## Enable CORS in Django App
- CORS (Cross-Origin Resource Sharing) is a browser security feature that blocks requests from different origins by default. We enable CORS on the backend to allow the frontend (served from a different domain or port) to access API resources safely.
- Modern browsers enforce the Same-Origin Policy to protect users from malicious scripts, but since some cross-origin requests (like in our application) are legitimate, we use CORS to allow them safely.
	- Frontend (React) is served from http://localhost:3000
	- Backend (Django) is running at http://localhost:8000
- By default, this setup will fail due to CORS restrictions.

1. Open `pde/pde/settings.py` and add the newly created app to the `INSTALLED_APPS` list:
```py
from datetime import timedelta
from dotenv import load_dotenv
import os

load_dotenv()

ALLOWED_HOSTS = ["*"]           # Allow any host to access the django application

REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": (
        "rest_framework_simplejwt.authentication.JWTAuthentication",
    ),
    "DEFAULT_PERMISSION_CLASSES": [
        "rest_framework.permissions.IsAuthenticated",
    ],
}

SIMPLE_JWT = {
    "ACCESS_TOKEN_LIFETIME": timedelta(minutes=30),
    "REFRESH_TOKEN_LIFETIME": timedelta(days=1),
}

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

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
]
# CORS_ALLOW_ALL_ORIGINS = True
# CORS_ALLOWS_CREDENTIALS = True
```

<br>

## Implement JWT Token Authentication in Django App
Frontend communicates with backend through a request and receives a response from backend
User enter credentials in Frontend, then the Frontend will take those credentials and provide it to the Backend and requests for a token with these credentidals. Once authenticated Backend provides 2 tokens
1. Access Token -> Used for all our requests
2. Refresh Token -> Used for refresh the access token
Frontend will store both the access token and refresh token in the browser's cache
Once the access token is expired, the frontend will send the refresh token to backend, if that refresh token is valid, a new access token is provided, frontend will stored the access token again

1. Create `pde/tvt/serializers.py`
```py
from django.contrib.auth.models import User
from rest_framework import serializers

class UserSerializer(serializers.ModelSerializer):
	class Meta:
		model = User
		fields = ["id", "username", "password"]
		extra_kwargs = {"password": {"write_only": True}}

	def create(self, validated_data):
		user = User.objects.create_user(**validated_data)
		return user
```

<br>

2. Update `pde/tvt/views.py`
```py
from rest_framework.response import Response
from rest_framework.decorators import api_view
from django.contrib.auth.models import User
from .serializers import UserSerializer
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework import generics

class CreateUserView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [AllowAny]
```

<br>

3. Update `pde/pde/urls.py`
```py
from django.contrib import admin
from django.urls import path, include
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from tvt.views import CreateUserView

urlpatterns = [
	path("admin/", admin.site.urls),
	path("api/user/register/", CreateUserView.as_view(), name="register"),
	path("api/token/", TokenObtainPairView.as_view(), name="get_token"),
	path("api/token/refresh/", TokenRefreshView.as_view(), name="refresh"),
	path("api-auth", include("rest_framework.urls")),
	path("", include("tvt.urls")),
]
```

<br>

4. Migrate the django project
```bash
python manage.py makemigrations
python manage.py migrate
```

<br>

5. Testing the apis
Run the django server
```bash
python manage.py runserver
```
- Open http://127.0.0.1:8000/api/user/register/ -> Enter username and password to register -> POST
- Open http://127.0.0.1:8000/api/token/ -> Enter username and password you registered above to get access token -> POST
- Copy the Refresh Token and open http://127.0.0.1:8000/api/token/refresh/ -> Paste the copied refresh token -> POST -> This generates new access token

<br>

### Implement login and registration forms
1. Create Form in `pde/frontend/src/components/form.jsx`
```jsx
import { useState } from "react";
import api from "../api";
import { useNavigate } from "react-router-dom";
import { ACCESS_TOKEN, REFRESH_TOKEN } from "../constants";
import "../styles/form.css";

function Form({ route, method }) {
	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");
	const [loading, setLoading] = useState(false);
	const navigate = useNavigate();

	const name = method === "login" ? "Login" : "Register";
	const handleSubmit = async (e) => {
		setLoading(true);
		e.preventDefault();

		try {
			const response = await api.post(route, { username, password });
			if (method === "login") {
				localStorage.setItem(ACCESS_TOKEN, response.data.access);
				localStorage.setItem(REFRESH_TOKEN, response.data.refresh);
				navigate("/");
			} else {
				navigate("/login");
			}
		} catch (error) {
			alert(error);
		} finally {
			setLoading(false);
		}
	};

	return <form onSubmit={handleSubmit} className="form-container">
		<h1>{name}</h1>
		<input className="form-input" type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Username" />
		<input className="form-input" type="text" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" />
		<button className="form-button" type="submit">{name}</button>
	</form>;
}

export default Form;
```

2. Create styling for form `pde/frontend/src/styles/form.css`

3. Update Register and Login
`pde/frontend/src/pages/register.jsx`
```jsx
import Form from "../components/form";

function Register() {
	return <Form route="/api/user/register/" method="register" />
}

export default Register;
```

`pde/frontend/src/pages/login.jsx`
```jsx
import Form from "../components/form";

function Login() {
	return <Form route="/api/token/" method="login" />;
}

export default Login;
```

## Running application
> Run frontend and backend at the same time

### Run frontend
```bash
npm run dev
```
Access the local host at http://localhost:5173/

### Run backend
```bash
python manage.py runserver
```

<br>

---

## React Templates
1. Create base template as `pde/frontend/src/components/base.jsx`
```jsx
import React from 'react';
import { Link } from 'react-router-dom';
import "../styles/base.css";

function Layout({ children }) {
	return (
		<div>
			{/* Navbar section */}
			<nav className="navbar">
				<a href={import.meta.env.BASE_URL}>
					<img
						src={`${import.meta.env.BASE_URL}src/assets/tvt.svg`}
						alt="TVT Logo"
						className="logo"
					/>
				</a>
				<ul>
					<li>
						<a href={import.meta.env.BASE_URL}>
							<button type="button" className="btn-dark">Home</button>
						</a>
					</li>
					<li>
						<a href={`${import.meta.env.BASE_URL}traces/`}>
							<button type="button" className="btn-dark">Traces</button>
						</a>
					</li>
				</ul>
			</nav>

			{/* Main page content rendered below the navbar */}
			<main className="main-content">
				{children}			{/* the content from the child file */}
			</main>
		</div>
	);
}

export default Layout;
```

2. Import base template to `pde/frontend/src/pages/home.jsx`
```jsx
import Layout from '../components/base';

return <Layout>
		// Enter html content here
	</Lagout>
```

<br>

---

## Create a new route
1. Update App.jsx
```jsx
import Traces from "./pages/traces";

<Route path="/traces" element={<Traces />} />
```

2. Create `pde/frontend/src/pages/traces.jsx`
```jsx
function Traces() {
	return <div>Traces</div>;
}

export default Traces;
```

<br>

---

## Configure Database/Model in Django App
1. Configure `pde/tvt/models.py`
```py
from django.db import models
from django.contrib.auth.models import User


class Document(models.Model):
    agile_pn = models.CharField(max_length=100, default="NA")
    agile_rev = models.CharField(max_length=100, default="NA")
    doc_title = models.CharField(max_length=225, default="Untitled")
    doc_type = models.CharField(max_length=100, default="General")
    doc_id = models.CharField(max_length=100, default="0000")
    created_at = models.DateTimeField(auto_now_add=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="documents")

    def __str__(self):
        return self.doc_title
```

2. Update `pde/tvt/serializers.py`
```py
from django.contrib.auth.models import User
from rest_framework import serializers
from .models import Document

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username", "password"]
        extra_kwargs = {"password": {"write_only": True}}

    def create(self, validated_data):
        print(validated_data)
        user = User.objects.create_user(**validated_data)
        return user

class DocumentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Document
        fields = [
            "id",
            "agile_pn",
            "agile_rev",
            "doc_title",
            "doc_type",
            "doc_id",
            "created_at",
            "user",
        ]
        extra_kwargs = {"user": {"read_only": True}}
```

3. Update `pde/tvt/urls.py`
```py
from django.contrib.auth.models import User
from rest_framework import serializers
from .models import Document

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username", "password"]
        extra_kwargs = {"password": {"write_only": True}}

    def create(self, validated_data):
        print(validated_data)
        user = User.objects.create_user(**validated_data)
        return user


class DocumentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Document
        fields = [
            "id",
            "agile_pn",
            "agile_rev",
            "doc_title",
            "doc_type",
            "doc_id",
            "created_at",
            "user",
        ]
        extra_kwargs = {"user": {"read_only": True}}
```

4. Update `pde/tvt/views.py`
```py
from django.shortcuts import render
from django.contrib.auth.models import User
from rest_framework import generics
from .serializers import UserSerializer, DocumentSerializer
from rest_framework.permissions import IsAuthenticated, AllowAny
from .models import Document


class DocumentListCreate(generics.ListCreateAPIView):
    serializer_class = DocumentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return Document.objects.filter(user=user)

    def perform_create(self, serializer):
        if serializer.is_valid():
            serializer.save(user=self.request.user)
        else:
            print(serializer.errors)


class DocumentDelete(generics.DestroyAPIView):
    serializer_class = DocumentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return Document.objects.filter(user=user)


class CreateUserView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [AllowAny]

```

5. Create `pde/frontend/src/components/document.jsx`
```jsx
import React from "react";
import "../styles/document.css";

function Document({ document, onDelete }) {
    const formattedDate = new Date(document.created_at).toLocaleDateString("en-US");

    return (
        <div className="document-container">
            <p><strong>Agile PN:</strong> {document.agile_pn}</p>
            <p><strong>Agile Rev:</strong> {document.agile_rev}</p>
            <p><strong>Title:</strong> {document.doc_title}</p>
            <p><strong>Type:</strong> {document.doc_type}</p>
            <p><strong>Document ID:</strong> {document.doc_id}</p>
            <p className="document-date">{formattedDate}</p>
            <button className="delete-button" onClick={() => onDelete(document.id)}>
                Delete
            </button>
        </div>
    );
}

export default Document;
```

6. Update `pde/frontend/src/pages/home.jsx`
```jsx
import { useState, useEffect } from "react";
import api from "../api";
import Document from "../components/document";
import "../styles/home.css";

function Home() {
    const [documents, setDocuments] = useState([]);

    const [agilePn, setAgilePn] = useState("");
    const [agileRev, setAgileRev] = useState("");
    const [docTitle, setDocTitle] = useState("");
    const [docType, setDocType] = useState("");
    const [docId, setDocId] = useState("");

    useEffect(() => {
        getDocuments();
    }, []);

    const getDocuments = () => {
        api
            .get("/documents/")
            .then((res) => res.data)
            .then((data) => {
                setDocuments(data);
                console.log(data);
            })
            .catch((err) => alert(err));
    };

    const deleteDocument = (id) => {
        api
            .delete(`/documents/delete/${id}/`)
            .then((res) => {
                if (res.status === 204) alert("Document deleted!");
                else alert("Failed to delete document.");
                getDocuments();
            })
            .catch((error) => alert(error));
    };

    const createDocument = (e) => {
        e.preventDefault();
        api
            .post("/documents/", {
                agile_pn: agilePn,
                agile_rev: agileRev,
                doc_title: docTitle,
                doc_type: docType,
                doc_id: docId,
            })
            .then((res) => {
                if (res.status === 201) {
                    alert("Document created!");
                    getDocuments();
                    // Clear input fields after successful submission
                    setAgilePn("");
                    setAgileRev("");
                    setDocTitle("");
                    setDocType("");
                    setDocId("");
                } else {
                    alert("Failed to make document.");
                }
            })
            .catch((err) => alert(err));
    };

    return (
        <div>
            <div>
                <h2>Documents</h2>
                {documents.map((document) => (
                    <Document document={document} onDelete={deleteDocument} key={document.id} />
                ))}
            </div>
            <h2>Create a Document</h2>
            <form onSubmit={createDocument}>
                <label htmlFor="agile_pn">Agile PN:</label>
                <input
                    type="text"
                    id="agile_pn"
                    required
                    value={agilePn}
                    onChange={(e) => setAgilePn(e.target.value)}
                />
                <br />

                <label htmlFor="agile_rev">Agile Rev:</label>
                <input
                    type="text"
                    id="agile_rev"
                    required
                    value={agileRev}
                    onChange={(e) => setAgileRev(e.target.value)}
                />
                <br />

                <label htmlFor="doc_title">Document Title:</label>
                <input
                    type="text"
                    id="doc_title"
                    required
                    value={docTitle}
                    onChange={(e) => setDocTitle(e.target.value)}
                />
                <br />

                <label htmlFor="doc_type">Document Type:</label>
                <input
                    type="text"
                    id="doc_type"
                    required
                    value={docType}
                    onChange={(e) => setDocType(e.target.value)}
                />
                <br />

                <label htmlFor="doc_id">Document ID:</label>
                <input
                    type="text"
                    id="doc_id"
                    required
                    value={docId}
                    onChange={(e) => setDocId(e.target.value)}
                />
                <br />

                <input type="submit" value="Submit" />
            </form>
        </div>
    );
}

export default Home;
```

7. Migrate the django project
```bash
python manage.py makemigrations
python manage.py migrate
```