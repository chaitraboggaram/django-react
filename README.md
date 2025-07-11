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
Windows: Ctrl + k + ctrl + shift + c
Mac: 

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