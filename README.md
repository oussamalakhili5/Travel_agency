# Atlas Travel Agency

A full-stack travel agency application built with React and Django. The project combines a multilingual booking interface with a REST API for authentication, catalog browsing, reservations, admin monitoring, and a lightweight intent-based chatbot assistant.

## Overview

Atlas Travel Agency is designed as a professional portfolio-style project that demonstrates:

- a modern React frontend with multilingual UI
- a Django REST backend with PostgreSQL
- JWT authentication and protected routes
- email verification before login
- hotel and transport catalog browsing
- reservation creation and cancellation
- admin-only monitoring endpoints and dashboard pages
- a simple backend-driven chatbot assistant for guided navigation

## Main Features

- User registration, login, token refresh, and current-user profile lookup
- Email verification flow with resend-code support
- Public hotel catalog with filtering by city and max price
- Public transport catalog with filtering by departure city, arrival city, and type
- Authenticated reservation flow for hotels and transports
- Reservation list, detail view, and cancellation for the logged-in user
- Admin-only API endpoints for hotels, transports, and reservations
- Admin dashboard foundation in the frontend
- Multilingual frontend support with English, French, Spanish, and Arabic
- Floating chatbot widget connected to the Django chatbot API

## Tech Stack

### Frontend

- React 19
- Vite
- React Router
- Axios
- Bootstrap 5
- i18next / react-i18next

### Backend

- Django 5
- Django REST Framework
- Simple JWT
- django-cors-headers
- PostgreSQL

## Project Structure

```text
Travel_agency/
├─ backend/
│  ├─ chatbot/         # Intent-based chatbot API
│  ├─ config/          # Django settings, root URLs, API routing
│  ├─ hotels/          # Hotel models, serializers, views, tests
│  ├─ reservations/    # Reservation flow and cancellation
│  ├─ transports/      # Transport models, serializers, views, tests
│  ├─ users/           # Custom user model, JWT auth, email verification
│  ├─ manage.py
│  └─ requirements.txt
├─ frontend/
│  ├─ src/
│  │  ├─ components/   # Shared UI, admin shell, chatbot widget
│  │  ├─ context/      # Auth context
│  │  ├─ i18n/         # Locale files and i18n setup
│  │  ├─ pages/        # Public, private, and admin pages
│  │  ├─ routes/       # Private/admin route guards
│  │  └─ services/     # API service layer
│  └─ package.json
└─ docs/
   ├─ architecture.md
   └─ features.md
```

## Prerequisites

Install these tools before running the project locally:

- Python 3.11+
- Node.js 18+
- PostgreSQL 14+ or compatible local instance

## Local Setup

### 1. Clone the repository

```bash
git clone <your-repository-url>
cd Travel_agency
```

### 2. Create the PostgreSQL database

Create a database for the Django app. The project defaults to:

- Database name: `Travel_agency_db`
- User: `postgres`
- Password: `admin`
- Host: `127.0.0.1`
- Port: `5432`

Example SQL:

```sql
CREATE DATABASE "Travel_agency_db";
```

You can also override these values with environment variables:

```text
POSTGRES_DB
POSTGRES_USER
POSTGRES_PASSWORD
POSTGRES_HOST
POSTGRES_PORT
FRONTEND_ORIGIN
DJANGO_SECRET_KEY
DJANGO_DEBUG
DJANGO_ALLOWED_HOSTS
```

### 3. Backend setup

```bash
cd backend
python -m venv .venv
```

Activate the virtual environment:

- Windows PowerShell:

```powershell
.\.venv\Scripts\Activate.ps1
```

- macOS / Linux:

```bash
source .venv/bin/activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Apply migrations:

```bash
python manage.py migrate
```

Email verification can run in either local console mode or Gmail SMTP mode.
The backend automatically loads `.env` from the repository root or from
`backend/.env` when either file exists. You can copy `backend/.env.example` to
`backend/.env` for local placeholders. You can also set variables manually in
the same Windows PowerShell terminal before starting `runserver`; PowerShell
variables override `.env` values when both are present.

Mode A: Local console email backend. This prints verification emails in the
backend terminal and does not send real email:

```powershell
$env:EMAIL_BACKEND="django.core.mail.backends.console.EmailBackend"
python manage.py runserver
```

Mode B: Gmail SMTP. This sends real email through Gmail SMTP:

```powershell
$env:EMAIL_BACKEND="django.core.mail.backends.smtp.EmailBackend"
$env:EMAIL_HOST="smtp.gmail.com"
$env:EMAIL_PORT="587"
$env:EMAIL_USE_TLS="True"
$env:EMAIL_USE_SSL="False"
$env:EMAIL_HOST_USER="your_email@gmail.com"
$env:EMAIL_HOST_PASSWORD="your_new_google_app_password"
$env:DEFAULT_FROM_EMAIL="your_email@gmail.com"
python manage.py runserver
```

Test the active email configuration without registering a user:

```powershell
python manage.py test_email_delivery recipient@example.com
```

Gmail SMTP security notes:

- Use a Google App Password, not your normal Gmail password.
- Never commit `.env`.
- If an app password was exposed, revoke it in your Google account and create a new one.
- Do not place real Gmail credentials in `backend/.env.example`; use placeholders only.

After changing email variables, stop and restart `python manage.py runserver`.
The project includes `backend/.env.example` with the supported email variables:

```text
EMAIL_BACKEND
EMAIL_HOST
EMAIL_PORT
EMAIL_USE_TLS
EMAIL_USE_SSL
EMAIL_HOST_USER
EMAIL_HOST_PASSWORD
DEFAULT_FROM_EMAIL
EMAIL_VERIFICATION_CODE_TTL_MINUTES
```

Start the backend:

```bash
python manage.py runserver
```

Backend default local URL:

```text
http://127.0.0.1:8000/
```

### 4. Create an admin user

Run:

```bash
python manage.py createsuperuser
```

This project uses a custom user model. A superuser is automatically created with:

- `role = "admin"`
- `is_staff = True`
- `is_superuser = True`

You can use that account to access:

- Django admin: `http://127.0.0.1:8000/admin/`
- frontend admin pages after login

### 5. Frontend setup

Open a new terminal:

```bash
cd frontend
npm install
npm run dev
```

Frontend default local URL:

```text
http://127.0.0.1:5173/
```

The frontend API client points by default to:

```text
http://127.0.0.1:8000/api/
```

You can override that with:

```text
VITE_API_BASE_URL
```

## How to Run the Project Locally

With PostgreSQL running:

1. Start Django from `backend/`
2. Start Vite from `frontend/`
3. Open `http://127.0.0.1:5173/`

For a full local demo, keep these available:

- Frontend UI: `http://127.0.0.1:5173/`
- Django API root: `http://127.0.0.1:8000/api/`
- Django admin: `http://127.0.0.1:8000/admin/`

## Database Notes

- Django is configured for PostgreSQL only in the current project setup
- migrations are included in the repository for the implemented apps
- the email backend defaults to Django's console email backend in local development
- with `DEBUG=True`, verification codes are logged in the backend terminal so local testing can continue even if email delivery fails
- SMTP is used only when `EMAIL_BACKEND` is explicitly set to `django.core.mail.backends.smtp.EmailBackend`

## Key API Highlights

### Authentication and user account

- `POST /api/auth/register/`
- `POST /api/auth/login/`
- `POST /api/auth/verify-email/`
- `POST /api/auth/resend-verification-code/`
- `POST /api/auth/refresh/`
- `GET /api/auth/me/`

### Public catalog

- `GET /api/hotels/`
- `GET /api/hotels/<id>/`
- `GET /api/transports/`
- `GET /api/transports/<id>/`

### Reservations

- `GET /api/reservations/`
- `POST /api/reservations/`
- `GET /api/reservations/<id>/`
- `POST /api/reservations/<id>/cancel/`

### Admin-only management endpoints

- `GET /api/admin/hotels/`
- `GET /api/admin/transports/`
- `GET /api/admin/reservations/`

### Chatbot assistant

- `POST /api/chatbot/`

## Chatbot Feature Summary

The chatbot is not a generative AI assistant. It is a lightweight backend-driven travel helper built around intent detection and redirect guidance.

Current chatbot behavior includes:

- detecting hotel, transport, reservation, login, verification, and admin-related intents
- returning a structured reply and suggested redirect
- supporting frontend quick actions and typed messages
- redirecting users to pages like `/hotels`, `/transports`, `/my-reservations`, `/login`, or `/verify-email`

Example request:

```json
{
  "message": "I want a hotel in Paris"
}
```

Example response shape:

```json
{
  "message": "I want a hotel in Paris",
  "intent": "hotel_search",
  "reply": "You can browse hotels and start with the city filter for Paris.",
  "redirect": {
    "path": "/hotels",
    "label": "Browse hotels",
    "params": {
      "city": "Paris"
    }
  },
  "requires_auth": false,
  "entities": {
    "city": "Paris"
  }
}
```

## Optional Quality Checks

Backend tests:

```bash
cd backend
python manage.py test
```

Frontend production build:

```bash
cd frontend
npm run build
```

## Future Improvements

- CRUD management tools for hotels, transports, and reservations in the admin area
- pagination, search state persistence, and richer catalog filters
- production-ready email delivery configuration
- reservation status updates from admin workflows
- chatbot conversation history persistence
- deployment configuration for frontend and backend
- screenshots, demo GIFs, and architecture diagrams for portfolio presentation

## Supporting Docs

- [Project architecture](docs/architecture.md)
- [Implemented features](docs/features.md)
