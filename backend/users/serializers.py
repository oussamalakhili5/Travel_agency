import logging

from django.contrib.auth import authenticate, get_user_model
from django.contrib.auth.password_validation import validate_password
from django.utils import timezone
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

from .exceptions import EmailVerificationRequired
from .services import issue_email_verification

User = get_user_model()
logger = logging.getLogger(__name__)


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = (
            "id",
            "email",
            "first_name",
            "last_name",
            "phone",
            "role",
            "is_email_verified",
        )
        read_only_fields = fields


class RegisterSerializer(serializers.ModelSerializer):
    confirm_password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = (
            "email",
            "first_name",
            "last_name",
            "phone",
            "password",
            "confirm_password",
        )
        extra_kwargs = {
            "password": {"write_only": True},
            "phone": {"required": True, "allow_blank": False},
        }

    def validate_email(self, value):
        email = User.objects.normalize_email(value)
        if User.objects.filter(email__iexact=email).exists():
            raise serializers.ValidationError("An account with this email already exists.")
        return email

    def validate(self, attrs):
        password = attrs.get("password")
        confirm_password = attrs.pop("confirm_password", None)

        if password != confirm_password:
            raise serializers.ValidationError(
                {"confirm_password": "Password confirmation does not match."}
            )

        user = User(
            email=attrs.get("email"),
            first_name=attrs.get("first_name", ""),
            last_name=attrs.get("last_name", ""),
            phone=attrs.get("phone", ""),
        )
        validate_password(password, user=user)
        return attrs

    def create(self, validated_data):
        user = User.objects.create_user(
            email=validated_data["email"],
            password=validated_data["password"],
            first_name=validated_data["first_name"],
            last_name=validated_data["last_name"],
            phone=validated_data["phone"],
            role=User.Role.USER,
            is_staff=False,
            is_superuser=False,
            is_email_verified=False,
        )
        logger.info("User created: %s", user.email)
        logger.info("User email verified flag: %s", user.is_email_verified)
        issue_email_verification(user)
        return user


class VerifyEmailSerializer(serializers.Serializer):
    email = serializers.EmailField()
    verification_code = serializers.CharField(max_length=20, trim_whitespace=True)

    default_error_messages = {
        "invalid_email": "No account was found for this email address.",
        "already_verified": "This email address is already verified.",
        "invalid_code": "The verification code is invalid.",
        "expired_code": "The verification code has expired. Please request a new one.",
    }

    def validate_email(self, value):
        return User.objects.normalize_email(value)

    def validate(self, attrs):
        email = attrs["email"]
        verification_code = attrs["verification_code"].strip()

        try:
            user = User.objects.get(email__iexact=email)
        except User.DoesNotExist as exc:
            raise serializers.ValidationError({"email": self.error_messages["invalid_email"]}) from exc

        if user.is_email_verified:
            raise serializers.ValidationError(
                {"detail": self.error_messages["already_verified"]}
            )

        if not user.email_verification_code or not user.email_verification_expires_at:
            raise serializers.ValidationError(
                {"verification_code": self.error_messages["invalid_code"]}
            )

        if user.email_verification_expires_at < timezone.now():
            raise serializers.ValidationError(
                {"verification_code": self.error_messages["expired_code"]}
            )

        if not user.is_email_verification_code_valid(verification_code):
            raise serializers.ValidationError(
                {"verification_code": self.error_messages["invalid_code"]}
            )

        attrs["user"] = user
        attrs["verification_code"] = verification_code
        return attrs

    def save(self, **kwargs):
        user = self.validated_data["user"]
        user.clear_email_verification(mark_verified=True)
        return user


class ResendVerificationCodeSerializer(serializers.Serializer):
    email = serializers.EmailField()

    def validate_email(self, value):
        return User.objects.normalize_email(value)

    def save(self, **kwargs):
        email = self.validated_data["email"]
        user = User.objects.filter(email__iexact=email).first()

        if user and not user.is_email_verified:
            issue_email_verification(user)

        return user


class AuthTokenObtainPairSerializer(TokenObtainPairSerializer):
    username_field = User.USERNAME_FIELD

    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token["email"] = user.email
        token["role"] = user.role
        return token

    def validate(self, attrs):
        credentials = {
            self.username_field: attrs.get(self.username_field),
            "password": attrs.get("password"),
        }
        user = authenticate(request=self.context.get("request"), **credentials)

        if user is None:
            raise serializers.ValidationError(
                {"detail": "Invalid email or password."}
            )

        if not user.is_active:
            raise serializers.ValidationError(
                {"detail": "This account is inactive."}
            )

        if not user.is_email_verified:
            raise EmailVerificationRequired()

        refresh = self.get_token(user)
        return {
            "refresh": str(refresh),
            "access": str(refresh.access_token),
            "user": UserSerializer(user).data,
        }
