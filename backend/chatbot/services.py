import re


SPACE_PATTERN = re.compile(r"\s+")
HOTEL_CITY_PATTERN = re.compile(
    r"\b(?:hotel|room|stay|accommodation)\b.*?\b(?:in|at|near)\s+"
    r"(?P<city>[a-zA-Z][a-zA-Z\s'-]{1,40})",
    re.IGNORECASE,
)
PACKAGE_DESTINATION_PATTERN = re.compile(
    r"\b(?:package|packages|tour|holiday|vacation|escape)\b.*?\b(?:in|to|for)\s+"
    r"(?P<destination>[a-zA-Z][a-zA-Z\s'-]{1,40})",
    re.IGNORECASE,
)
TRANSPORT_ROUTE_PATTERN = re.compile(
    r"\bfrom\s+(?P<departure>[a-zA-Z][a-zA-Z\s'-]{1,30}?)\s+to\s+"
    r"(?P<arrival>[a-zA-Z][a-zA-Z\s'-]{1,30})(?:\b|[?.!,])",
    re.IGNORECASE,
)
PRICE_PATTERN = re.compile(
    r"\b(?:under|below|less than|max(?:imum)?|budget(?: of)?|up to)\s*\$?\s*"
    r"(?P<price>\d{2,6})",
    re.IGNORECASE,
)
DATE_PATTERN = re.compile(
    r"\b(?P<date>20\d{2}-\d{1,2}-\d{1,2}|\d{1,2}[/-]\d{1,2}[/-]\d{2,4})\b"
)
TRAVELER_PATTERN = re.compile(
    r"\b(?P<count>\d{1,3})\s*"
    r"(?:travelers?|travellers?|guests?|people|passengers?|persons?)\b",
    re.IGNORECASE,
)
RESERVATION_ID_PATTERN = re.compile(
    r"\b(?:reservation|booking)\s*(?:id|#|number|ref)?\s*#?(?P<id>\d+)\b",
    re.IGNORECASE,
)
PAYMENT_ID_PATTERN = re.compile(
    r"\bpayment\s*(?:id|#|number|ref)?\s*#?(?P<id>\d+)\b",
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
    cleaned = SPACE_PATTERN.sub(" ", value).strip(" .,!?\t\r\n")
    stop_words = (
        " under ",
        " below ",
        " less than ",
        " with ",
        " for ",
        " on ",
        " from ",
        " to ",
    )

    lowered = f" {cleaned.lower()} "
    for stop_word in stop_words:
        index = lowered.find(stop_word)
        if index > 0:
            cleaned = cleaned[: index - 1].strip()
            break

    return cleaned.title()


def extract_first(pattern, message, group_name):
    match = pattern.search(message)
    if not match:
        return None

    return clean_entity(match.group(group_name))


def extract_transport_route(message):
    match = TRANSPORT_ROUTE_PATTERN.search(message)
    if not match:
        return {}

    return {
        "departure_city": clean_entity(match.group("departure")),
        "arrival_city": clean_entity(match.group("arrival")),
    }


def extract_entities(raw_message):
    entities = {}
    normalized = raw_message.lower()
    route = extract_transport_route(raw_message)
    hotel_city = extract_first(HOTEL_CITY_PATTERN, raw_message, "city")
    package_destination = extract_first(
        PACKAGE_DESTINATION_PATTERN,
        raw_message,
        "destination",
    )
    price_match = PRICE_PATTERN.search(raw_message)
    date_match = DATE_PATTERN.search(raw_message)
    traveler_match = TRAVELER_PATTERN.search(raw_message)
    reservation_id_match = RESERVATION_ID_PATTERN.search(raw_message)
    payment_id_match = PAYMENT_ID_PATTERN.search(raw_message)

    if hotel_city:
        entities["city"] = hotel_city

    if package_destination:
        entities["destination"] = package_destination

    entities.update(route)

    if price_match:
        entities["max_price"] = price_match.group("price")

    if date_match:
        entities["date"] = date_match.group("date")

    if traveler_match:
        entities["travelers"] = int(traveler_match.group("count"))

    if reservation_id_match:
        entities["reservation_id"] = int(reservation_id_match.group("id"))

    if payment_id_match:
        entities["payment_id"] = int(payment_id_match.group("id"))

    for transport_type in ("flight", "train", "bus"):
        if contains_any(normalized, (transport_type,)):
            entities["transport_type"] = transport_type
            break

    if contains_any(normalized, ("hotel", "room", "stay", "accommodation")):
        entities["item_type"] = "hotel"
    elif contains_any(normalized, ("package", "tour", "holiday", "vacation", "escape")):
        entities["item_type"] = "package"
    elif contains_any(normalized, ("transport", "flight", "train", "bus", "transfer")):
        entities["item_type"] = "transport"

    return entities


def redirect(path, label, params=None):
    return {
        "path": path,
        "label": label,
        "params": params or {},
    }


def quick_action(label, message=None, path=None, params=None):
    action = {"label": label}

    if message:
        action["message"] = message

    if path:
        action["path"] = path
        action["params"] = params or {}

    return action


def make_response(
    *,
    intent,
    reply,
    redirect_target,
    requires_auth=False,
    entities=None,
    quick_actions=None,
    suggestions=None,
):
    return {
        "intent": intent,
        "reply": reply,
        "redirect": redirect_target,
        "requires_auth": requires_auth,
        "entities": entities or {},
        "quick_actions": quick_actions or [],
        "suggestions": suggestions or [],
    }


def auth_required_response(intent, reply, entities=None):
    return make_response(
        intent=intent,
        reply=reply,
        redirect_target=redirect("/login", "Log in"),
        requires_auth=True,
        entities=entities,
        quick_actions=[
            quick_action("Log in", path="/login"),
            quick_action("Create an account", path="/register"),
        ],
        suggestions=[
            "Sign in first to access account-specific reservations and payments.",
            "Use the same email address you used during registration.",
        ],
    )


def public_navigation_actions():
    return [
        quick_action("Browse hotels", path="/hotels"),
        quick_action("Browse transports", path="/transports"),
        quick_action("Browse packages", path="/packages"),
    ]


def build_response(message, *, is_authenticated=False):
    raw_message = normalize_message(message)
    normalized = raw_message.lower()
    entities = extract_entities(raw_message)

    hotel_keywords = ("hotel", "room", "stay", "accommodation")
    transport_keywords = ("transport", "flight", "train", "bus", "transfer", "route")
    package_keywords = ("package", "packages", "tour", "holiday", "vacation", "escape")
    reservation_keywords = ("reservation", "reservations", "booking", "book")
    cancel_keywords = ("cancel", "cancellation")
    payment_keywords = ("payment", "payments", "pay", "checkout", "invoice")
    payment_status_keywords = (
        "payment status",
        "paid",
        "invoice status",
        "checkout status",
    )
    failed_payment_keywords = (
        "payment failed",
        "failed payment",
        "card declined",
        "declined",
    )
    refund_keywords = ("refund", "refunded", "money back")
    login_keywords = ("login", "log in", "sign in")
    register_keywords = ("register", "sign up", "create account", "new account")
    verify_keywords = ("verify", "verification", "email code", "verify email")
    resend_keywords = ("resend", "new code", "send code again")
    admin_keywords = ("admin", "dashboard", "manage")
    support_keywords = ("support", "contact", "help desk", "customer service")
    greeting_keywords = ("hello", "hi", "hey", "good morning", "good evening")

    if contains_any(normalized, admin_keywords):
        if not is_authenticated:
            return auth_required_response(
                "admin_help",
                "Please log in with an administrator account to open the admin dashboard.",
                entities,
            )

        return make_response(
            intent="admin_help",
            reply=(
                "The admin dashboard lets authorized staff manage hotels, "
                "transports, packages, reservations, and payments."
            ),
            redirect_target=redirect("/admin", "Open admin dashboard"),
            requires_auth=True,
            entities=entities,
            quick_actions=[
                quick_action("Open admin dashboard", path="/admin"),
                quick_action("Manage reservations", path="/admin/reservations"),
            ],
            suggestions=[
                "Use the admin area for catalog and operations management.",
                "If you cannot access it, confirm your account has the admin role.",
            ],
        )

    if contains_any(normalized, support_keywords):
        return make_response(
            intent="support_contact",
            reply=(
                "For support, use the contact details in the footer or ask me to "
                "guide you to hotels, transports, packages, reservations, or payments."
            ),
            redirect_target=redirect("/", "Go to homepage"),
            requires_auth=False,
            entities=entities,
            quick_actions=public_navigation_actions()
            + [quick_action("Payment help", message="I need payment help")],
            suggestions=[
                "For account-specific issues, sign in before checking reservations or payments.",
                "For email verification issues, use the Verify email page.",
            ],
        )

    if contains_any(normalized, refund_keywords):
        if not is_authenticated:
            return auth_required_response(
                "refund_help",
                "Please log in first so you can review payment and refund-related details.",
                entities,
            )

        return make_response(
            intent="refund_help",
            reply=(
                "Refund handling depends on the payment status. Open My Payments "
                "to review the relevant mock payment record."
            ),
            redirect_target=redirect("/payments", "Open payments"),
            requires_auth=True,
            entities=entities,
            quick_actions=[
                quick_action("Open payments", path="/payments"),
                quick_action("Open my reservations", path="/my-reservations"),
            ],
            suggestions=[
                "Check whether the payment is paid, failed, cancelled, or refunded.",
                "Contact support for refund-specific follow-up.",
            ],
        )

    if contains_any(normalized, failed_payment_keywords):
        if not is_authenticated:
            return auth_required_response(
                "failed_payment_help",
                "Please log in first to review failed payments safely.",
                entities,
            )

        return make_response(
            intent="failed_payment_help",
            reply=(
                "If a mock payment failed, open the reservation or payments page "
                "and start a new payment attempt when the reservation is still eligible."
            ),
            redirect_target=redirect("/payments", "Open payments"),
            requires_auth=True,
            entities=entities,
            quick_actions=[
                quick_action("Open payments", path="/payments"),
                quick_action("Open my reservations", path="/my-reservations"),
            ],
            suggestions=[
                "Use the payment page to retry eligible failed or cancelled payments.",
                "Do not enter real card details in mock mode.",
            ],
        )

    if contains_any(normalized, payment_status_keywords):
        if not is_authenticated:
            return auth_required_response(
                "payment_status_help",
                "Please log in first so you can check payment status securely.",
                entities,
            )

        return make_response(
            intent="payment_status_help",
            reply=(
                "You can review payment status from My Payments or from each "
                "reservation summary."
            ),
            redirect_target=redirect("/payments", "Open payments"),
            requires_auth=True,
            entities=entities,
            quick_actions=[
                quick_action("Open payments", path="/payments"),
                quick_action("Open my reservations", path="/my-reservations"),
            ],
            suggestions=[
                "Payment statuses include pending, paid, failed, cancelled, and refunded.",
                "Open a payment to see its reference and linked reservation.",
            ],
        )

    if contains_any(normalized, payment_keywords):
        if not is_authenticated:
            return auth_required_response(
                "payment_help",
                "Please log in first, then open your reservations to choose a booking to pay.",
                entities,
            )

        return make_response(
            intent="payment_help",
            reply=(
                "You can pay from My Reservations. Open a pending reservation, "
                "click Pay Now, and complete the safe mock card form."
            ),
            redirect_target=redirect("/my-reservations", "Go to my reservations"),
            requires_auth=True,
            entities=entities,
            quick_actions=[
                quick_action("Open my reservations", path="/my-reservations"),
                quick_action("Open payments", path="/payments"),
            ],
            suggestions=[
                "Use demo card details only; no real charge is made.",
                "After payment succeeds, the reservation payment status updates.",
            ],
        )

    if contains_any(normalized, package_keywords):
        params = {}
        if entities.get("destination"):
            params["destination"] = entities["destination"]
        if entities.get("city"):
            params["city"] = entities["city"]
        if entities.get("max_price"):
            params["max_price"] = entities["max_price"]

        reply = "You can browse travel packages and filter by destination, city, or budget."
        if entities.get("destination"):
            reply = (
                "You can browse packages and start with the destination filter "
                f"for {entities['destination']}."
            )

        return make_response(
            intent="package_search",
            reply=reply,
            redirect_target=redirect("/packages", "Browse packages", params),
            requires_auth=False,
            entities=entities,
            quick_actions=[
                quick_action("Browse packages", path="/packages", params=params),
                quick_action("Browse hotels", path="/hotels"),
            ],
            suggestions=[
                "Try adding a destination, city, budget, or traveler count.",
                "Open a package detail page to start a reservation.",
            ],
        )

    if contains_any(normalized, hotel_keywords):
        params = {}
        if entities.get("city"):
            params["city"] = entities["city"]
        if entities.get("max_price"):
            params["max_price"] = entities["max_price"]

        reply = "You can browse the hotels page and filter by city or maximum price."
        if entities.get("city"):
            reply = f"You can browse hotels and start with the city filter for {entities['city']}."

        return make_response(
            intent="hotel_search",
            reply=reply,
            redirect_target=redirect("/hotels", "Browse hotels", params),
            requires_auth=False,
            entities=entities,
            quick_actions=[
                quick_action("Browse hotels", path="/hotels", params=params),
                quick_action("Browse packages", path="/packages"),
            ],
            suggestions=[
                "Try asking for a city, budget, or stay date.",
                "Open a hotel detail page to reserve rooms.",
            ],
        )

    if contains_any(normalized, transport_keywords):
        params = {}
        for key in ("departure_city", "arrival_city"):
            if entities.get(key):
                params[key] = entities[key]
        if entities.get("transport_type"):
            params["type"] = entities["transport_type"]

        reply = "You can browse transports and filter by departure city, arrival city, or type."
        if entities.get("departure_city") and entities.get("arrival_city"):
            reply = (
                "You can browse transports and start with the route from "
                f"{entities['departure_city']} to {entities['arrival_city']}."
            )

        return make_response(
            intent="transport_search",
            reply=reply,
            redirect_target=redirect("/transports", "Browse transports", params),
            requires_auth=False,
            entities=entities,
            quick_actions=[
                quick_action("Browse transports", path="/transports", params=params),
                quick_action("Browse hotels", path="/hotels"),
            ],
            suggestions=[
                "Try asking for a route, date, or transport type.",
                "Open a transport detail page to start a reservation.",
            ],
        )

    if contains_any(normalized, cancel_keywords) or contains_any(normalized, reservation_keywords):
        cancel_requested = contains_any(normalized, cancel_keywords)
        intent = "cancellation_help" if cancel_requested else "reservation_help"
        entities = {
            **entities,
            **({"action": "cancel"} if cancel_requested else {}),
        }

        if not is_authenticated:
            return auth_required_response(
                intent,
                "Please log in first so you can view and manage your reservations.",
                entities,
            )

        reply = "You can manage your bookings from My Reservations."
        if cancel_requested:
            reply = "You can cancel an eligible booking from your My Reservations page."

        return make_response(
            intent=intent,
            reply=reply,
            redirect_target=redirect("/my-reservations", "Open my reservations"),
            requires_auth=True,
            entities=entities,
            quick_actions=[
                quick_action("Open my reservations", path="/my-reservations"),
                quick_action("Payment help", message="I need payment help"),
            ],
            suggestions=[
                "Reservation statuses include pending, confirmed, cancelled, and completed.",
                "Cancelled reservations cannot be paid.",
            ],
        )

    if contains_any(normalized, resend_keywords) and (
        contains_any(normalized, verify_keywords)
        or contains_any(normalized, ("code", "email"))
    ):
        return make_response(
            intent="resend_verification_help",
            reply=(
                "Use the Verify Email page, enter your email address, and click "
                "Resend Code to receive a fresh verification code."
            ),
            redirect_target=redirect("/verify-email", "Verify email"),
            requires_auth=False,
            entities=entities,
            quick_actions=[quick_action("Verify email", path="/verify-email")],
            suggestions=[
                "Verification codes expire after a short time.",
                "Check that you used the same email address from registration.",
            ],
        )

    if contains_any(normalized, verify_keywords):
        return make_response(
            intent="email_verification_help",
            reply="Go to the Verify Email page to confirm your account with the code we sent.",
            redirect_target=redirect("/verify-email", "Verify email"),
            requires_auth=False,
            entities=entities,
            quick_actions=[
                quick_action("Verify email", path="/verify-email"),
                quick_action("Create an account", path="/register"),
            ],
            suggestions=[
                "If the code expired, request a new one from the same page.",
                "Use the email address you entered during registration.",
            ],
        )

    if contains_any(normalized, login_keywords):
        return make_response(
            intent="login_help",
            reply="You can sign in from the login page to access reservations and payments.",
            redirect_target=redirect("/login", "Log in"),
            requires_auth=False,
            entities=entities,
            quick_actions=[
                quick_action("Log in", path="/login"),
                quick_action("Verify email", path="/verify-email"),
            ],
            suggestions=[
                "You must verify your email before logging in.",
                "Use the same email and password from registration.",
            ],
        )

    if contains_any(normalized, register_keywords):
        return make_response(
            intent="register_help",
            reply="Create an account from the registration page to reserve trips and manage payments.",
            redirect_target=redirect("/register", "Register"),
            requires_auth=False,
            entities=entities,
            quick_actions=[
                quick_action("Register", path="/register"),
                quick_action("Log in", path="/login"),
            ],
            suggestions=[
                "After registration, verify your email before signing in.",
                "Use a reachable email address so you can receive the verification code.",
            ],
        )

    if contains_any(normalized, greeting_keywords):
        return make_response(
            intent="greeting",
            reply=(
                "I can help you find hotels, browse transports, explore packages, "
                "manage reservations, handle mock payments, or guide you to login "
                "and email verification."
            ),
            redirect_target=redirect("/", "Go to homepage"),
            requires_auth=False,
            entities=entities,
            quick_actions=public_navigation_actions()
            + [quick_action("My reservations", path="/my-reservations")],
            suggestions=[
                "Try asking for a hotel in a city.",
                "Ask how to pay, verify email, or cancel a reservation.",
            ],
        )

    return make_response(
        intent="fallback",
        reply=(
            "I can help with hotels, transports, packages, reservations, payments, "
            "login, email verification, admin access, and support."
        ),
        redirect_target=redirect("/", "Go to homepage"),
        requires_auth=False,
        entities=entities,
        quick_actions=public_navigation_actions()
        + [
            quick_action("Payment help", message="How do I pay?"),
            quick_action("Verify email", path="/verify-email"),
        ],
        suggestions=[
            "Try: I want a hotel in Paris under 200.",
            "Try: Show flights from Casablanca to Madrid.",
            "Try: How do I pay for a reservation?",
        ],
    )
