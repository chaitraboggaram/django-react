# React-Django App Setup Guide
## Table of Contents
1. [Initial Setup](#initial-setup)
   1.1 [Set Up a Virtual Environment](#1-set-up-a-virtual-environment)
   1.2 [Install Required Python Packages](#2-install-required-packages)
   1.3 [Run Database Migrations](#3-run-database-migrations)
   1.4 [Start Backend Server](#4-start-backend-server)
2. [Frontend Setup](#frontend-setup)
   2.1 [Install Node.js](#1-install-nodejs)
   2.2 [Configure Environment Variables](#2-create-env-file)
   2.3 [Start Frontend Server](#3-start-frontend)
3. [Accessing the App](#accessing-the-app)
4. [User Registration](#user-registration)

<br>

---

## Initial Setup
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

### 2. Install Required Packages
```bash
pip install -r requirements.txt
```

<br>

### 3. Run Database Migrations
```bash
cd pde
python manage.py makemigrations tvt
python manage.py migrate
```

<br>

### 4. Start Backend Server
```bash
python manage.py runserver
```

<br>

---

## Frontend Setup
### 1. Install Node.js
Download and install Node.js from:
🔗 [https://nodejs.org/en/download](https://nodejs.org/en/download)

<br>

### 2. Create `.env` File
Create a file at `pde/frontend/.env` and add the following:
```
VITE_API_URL="http://127.0.0.1:8000"
```

<br>

### 3. Start Frontend
Open a new terminal and do not close the terminal where backend is running and make sure you are in `pde` folder
```bash
cd frontend
npm install
npm run dev
```

<br>

---

## Accessing the App
1. Open your browser and go to: [http://localhost:5173/](http://localhost:5173/)
2. Fill in your **username** and **password**
3. Click **Login**

<br>

### First-Time Users:
1. Visit [http://localhost:5173](http://localhost:5173)
2. On the login screen, click the **“Register”** link below the login form
3. Fill in your **username** and **password**
4. Click **Register** to create your account
After successful registration, you'll be redirected back to the login page.