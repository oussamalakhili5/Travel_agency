import re


SPACE_PATTERN = re.compile(r"\s+")
HOTEL_CITY_PATTERN = re.compile(
    r"\b(?:hotel|room|stay|accommodation)\b.*?\b(?:in|at)\s+(?P<city>[a-zA-Z][a-zA-Z\s'-]{1,40})",
    re.IGNORECASE,
)
TRANSPORT_ROUTE_PATTERN = re.compile(
    r"\bfrom\s+(?P<departure>[a-zA-Z][a-zA-Z\s'-]{1,30}?)\s+to\s+(?P<arrival>[a-zA-Z][a-zA-Z\s'-]{1,30})(?:\b|[?.!,])",
    re.IGNORECASE,
)


def normalize_message(message):
    return SPACE_PATTERN.sub(" ", message).strip()


def contains_any(message, keywords):
    for keyword in keywords:
        pattern = re.compile(r"\b" + re.escape(keyword) + r"\b", re.IGNORECASE)
        if pattern.search(message):
            return True

    return False


def clean_entity(value):
    return SPACE_PATTERN.sub(" ", value).strip(" .,!?\t\r\n").title()


def extract_hotel_city(message):
    match = HOTEL_CITY_PATTERN.search(message)
    if not match:
        return None

    return clean_entity(match.group("city"))


def extract_transport_route(message):
    match = TRANSPORT_ROUTE_PATTERN.search(message)
    if not match:
        return {}

    return {
        "departure_city": clean_entity(match.group("departure")),
        "arrival_city": clean_entity(match.group("arrival")),
    }


def build_response(message):
    raw_message = normalize_message(message)
    normalized = raw_message.lower()

    hotel_keywords = ("hotel", "room", "stay", "accommodation")
    transport_keywords = ("transport", "flight", "train", "bus", "trip", "travel")
    reservation_keywords = ("reservation", "reservations", "booking", "book", "cancel")
    login_keywords = ("login", "log in", "sign in")
    register_keywords = ("register", "sign up", "create account")
    verify_keywords = ("verify", "verification", "email code")
    admin_keywords = ("admin", "dashboard", "manage")
    greeting_keywords = ("hello", "hi", "hey", "good morning", "good evening")

    if contains_any(normalized, admin_keywords):
        return {
            "intent": "admin_help",
            "reply": (
                "The admin dashboard is available for admin users. "
                "You can manage hotels, transports, and reservations from there."
            ),
            "redirect": {
                "path": "/admin",
                "label": "Open admin dashboard",
                "params": {},
            },
            "requires_auth": True,
            "entities": {},
        }

    if contains_any(normalized, hotel_keywords):
        city = extract_hotel_city(raw_message) or ""
        reply = "You can browse the hotels page and filter by city."

        if city:
            reply = f"You can browse hotels and start with the city filter for {city}."

        return {
            "intent": "hotel_search",
            "reply": reply,
            "redirect": {
                "path": "/hotels",
                "label": "Browse hotels",
                "params": {"city": city} if city else {},
            },
            "requires_auth": False,
            "entities": {"city": city} if city else {},
        }

    if contains_any(normalized, transport_keywords):
        route = extract_transport_route(raw_message)
        reply = "You can browse transports and filter by departure city, arrival city, or type."

        if route:
            reply = (
                "You can browse transports and start with the route from "
                f"{route['departure_city']} to {route['arrival_city']}."
            )

        return {
            "intent": "transport_search",
            "reply": reply,
            "redirect": {
                "path": "/transports",
                "label": "Browse transports",
                "params": route,
            },
            "requires_auth": False,
            "entities": route,
        }

    if contains_any(normalized, reservation_keywords):
        cancel_requested = contains_any(normalized, ("cancel", "cancellation"))
        reply = "You can manage your bookings from My Reservations after logging in."

        if cancel_requested:
            reply = "You can cancel an existing booking from your My Reservations page."

        return {
            "intent": "reservation_help",
            "reply": reply,
            "redirect": {
                "path": "/my-reservations",
                "label": "Open my reservations",
                "params": {},
            },
            "requires_auth": True,
            "entities": {"action": "cancel"} if cancel_requested else {},
        }

    if contains_any(normalized, verify_keywords):
        return {
            "intent": "email_verification_help",
            "reply": "If you need to confirm your account, go to the email verification page.",
            "redirect": {
                "path": "/verify-email",
                "label": "Verify email",
                "params": {},
            },
            "requires_auth": False,
            "entities": {},
        }

    if contains_any(normalized, login_keywords):
        return {
            "intent": "login_help",
            "reply": "You can sign in from the login page to access reservations and your profile.",
            "redirect": {
                "path": "/login",
                "label": "Log in",
                "params": {},
            },
            "requires_auth": False,
            "entities": {},
        }

    if contains_any(normalized, register_keywords):
        return {
            "intent": "register_help",
            "reply": "You can create an account from the registration page.",
            "redirect": {
                "path": "/register",
                "label": "Register",
                "params": {},
            },
            "requires_auth": False,
            "entities": {},
        }

    if contains_any(normalized, greeting_keywords):
        return {
            "intent": "greeting",
            "reply": (
                "I can help you find hotels, browse transports, manage reservations, "
                "or guide you to login and verification pages."
            ),
            "redirect": {
                "path": "/",
                "label": "Go to homepage",
                "params": {},
            },
            "requires_auth": False,
            "entities": {},
        }

    return {
        "intent": "fallback",
        "reply": (
            "I can help with hotels, transports, reservations, login, email verification, "
            "and the admin dashboard. Try asking for one of those."
        ),
        "redirect": {
            "path": "/",
            "label": "Go to homepage",
            "params": {},
        },
        "requires_auth": False,
        "entities": {},
    }
