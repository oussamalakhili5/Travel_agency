# Architecture Overview

## Application Shape

Atlas Travel Agency is a split frontend/backend project:

- `frontend/` contains the React user interface
- `backend/` contains the Django REST API and business logic
- PostgreSQL stores application data

## Frontend Responsibilities

The React app handles:

- routing with public, authenticated, and admin-only pages
- multilingual UI with `i18next`
- token-aware API requests with Axios
- reservation and admin dashboard pages
- the floating chatbot widget

Key frontend areas:

- `components/` for reusable UI and chatbot/admin widgets
- `pages/` for route-level screens
- `routes/` for private and admin route guards
- `services/` for API integration
- `context/` for authentication state

## Backend Responsibilities

The Django backend handles:

- custom user model and role management
- JWT authentication
- email verification
- hotel and transport catalog APIs
- reservation creation, listing, detail, and cancellation
- admin-only monitoring endpoints
- intent-based chatbot responses

Key backend apps:

- `users/` for authentication and account flows
- `hotels/` for hotel catalog data
- `transports/` for transport catalog data
- `reservations/` for booking logic
- `chatbot/` for the intent-based assistant API

## Data Flow

### Authentication flow

1. User registers through the frontend
2. Django creates an unverified account
3. A verification code is issued
4. User verifies email
5. User logs in and receives JWT tokens
6. Frontend stores the access token and uses it in API requests

### Reservation flow

1. User browses hotels or transports
2. User opens a detail page and submits a reservation
3. Django validates the payload against reservation rules
4. Reservation is saved and returned through DRF serializers
5. User can view or cancel their own reservations later

### Chatbot flow

1. Frontend chatbot widget sends `POST /api/chatbot/`
2. Django detects a simple intent and returns a structured response
3. Frontend shows the reply and optional redirect button
4. Redirect buttons navigate with React Router and preserve query params

## Security Notes

- JWT authentication protects user-specific APIs
- admin endpoints are enforced in the backend with role-based permissions
- frontend route guards improve UX but do not replace backend access control
- unauthenticated users receive `401`, non-admin users receive `403` on admin APIs

## Current Scope

The project already demonstrates full-stack integration for core travel workflows, but some areas remain foundational:

- admin dashboard is read-oriented, not full CRUD
- chatbot is intent-based, not conversational AI
- production deployment and infrastructure are not yet documented in the repo
