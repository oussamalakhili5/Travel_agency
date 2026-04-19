# Implemented Features

## Frontend

- Responsive React interface built with Vite and Bootstrap
- Public pages for home, hotels, transports, hotel detail, and transport detail
- Authentication pages for register, login, and email verification
- Protected pages for profile and user reservations
- Admin dashboard foundation with hotels, transports, and reservations pages
- Multilingual UI in English, French, Spanish, and Arabic
- Floating chatbot widget with:
  - welcome state
  - quick actions
  - backend-powered replies
  - redirect buttons

## Backend

- Custom Django user model with `user` and `admin` roles
- JWT authentication with current-user endpoint
- Email verification and resend-code flow
- Public hotel API with filtering support
- Public transport API with filtering support
- Reservation API for authenticated users
- Reservation cancellation endpoint
- Admin-only read endpoints for:
  - all hotels
  - all transports
  - all reservations
- Intent-based chatbot endpoint

## Catalog

### Hotels

- list endpoint
- detail endpoint
- filter by city
- filter by max price

### Transports

- list endpoint
- detail endpoint
- filter by departure city
- filter by arrival city
- filter by type

## Reservations

- hotel reservations
- transport reservations
- authenticated user-only reservation list
- reservation detail access scoped to owner
- cancellation support

## Chatbot Assistant

The chatbot currently helps users:

- find hotels
- browse transport options
- navigate to reservation pages
- get login help
- get email verification help
- reach the admin dashboard if relevant

It works by detecting common intents and returning:

- a reply
- an intent name
- redirect data
- auth requirement flag
- extracted entities

## Current Limitations

- no payment flow is documented as active
- no package booking workflow is exposed in the current UI
- no chatbot memory or persistent conversation history
- no admin CRUD forms yet
