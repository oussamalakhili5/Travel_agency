from rest_framework.exceptions import APIException


class EmailVerificationRequired(APIException):
    status_code = 400
    default_detail = {
        "detail": "Email verification is required before you can log in.",
        "code": "email_verification_required",
    }
    default_code = "email_verification_required"
