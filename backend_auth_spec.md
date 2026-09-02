# Backend Authentication Integration Guide

The Brew Haven frontend is equipped with a modern, fully responsive authentication UI (Sign Up, Log In, and Forgot Password). Currently, it runs in a **simulated client-side mode** persisting user profiles to `localStorage` and notifying the interface dynamically.

To transition to production database-driven authentication, follow this specification to update the Django backend.

---

## 1. Django REST Framework Configuration

To support token-based authentication (such as DRF's default token system or JWT), add the authentication classes to `backend/brewbackend/settings.py`.

```python
# settings.py

INSTALLED_APPS = [
    # ...
    'rest_framework',
    'rest_framework.authtoken',  # Add DRF token app
    'cafe',
]

REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework.authentication.TokenAuthentication',
        'rest_framework.authentication.SessionAuthentication',
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.AllowAny', # Adjust permissions per endpoint
    ],
}
```

Then run Django migrations to generate the auth token tables:
```bash
python manage.py migrate
```

---

## 2. API Endpoints Specification

Expose the following endpoints under `api/auth/`.

| Endpoint | Method | Request Payload | Response (200/201 OK) | Description |
| :--- | :--- | :--- | :--- | :--- |
| `/api/auth/signup/` | `POST` | `{ "username": "email", "name": "Name", "email": "email", "password": "pass" }` | `{ "token": "abc...", "user": { "name": "Name", "email": "email" } }` | Creates a Django user account and returns an auth token. |
| `/api/auth/login/` | `POST` | `{ "username": "email", "password": "pass" }` | `{ "token": "xyz...", "user": { "name": "Name", "email": "email" } }` | Validates credentials and returns an active auth token. |
| `/api/auth/logout/` | `POST` | *(Requires Header: `Authorization: Token abc...`)* | `{ "message": "Logged out successfully" }` | Destroys the auth token on the server. |
| `/api/auth/password-reset/` | `POST` | `{ "email": "email" }` | `{ "message": "Reset instructions sent" }` | Initiates the email verification flow. |

---

## 3. Database Schema Updates

Currently, `Customer` data is independent of users. In `backend/cafe/models.py`, link the `Customer` or `Order` model directly to Django's standard `User` model using a foreign key. This allows orders to be associated with authenticated accounts.

```python
# cafe/models.py
from django.db import models
from django.contrib.auth.models import User

class Customer(models.Model):
    # Optional link to User profile
    user = models.OneToOneField(User, on_delete=models.CASCADE, null=True, blank=True, related_name='customer_profile')
    name = models.CharField(max_length=100)
    phone = models.CharField(max_length=20)
    email = models.EmailField()
    address = models.TextField()
    city = models.CharField(max_length=100)
    postal_code = models.CharField(max_length=20)
```

---

## 4. Sample Serializers & Views

Add these views to `backend/cafe/views.py` and register their routes in `backend/cafe/urls.py`.

### A. Serializers
```python
# cafe/serializers.py
from rest_framework import serializers
from django.contrib.auth.models import User

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name']

class SignUpSerializer(serializers.ModelSerializer):
    name = serializers.CharField(write_only=True)
    password = serializers.CharField(write_only=True, min_length=6)

    class Meta:
        model = User
        fields = ['email', 'password', 'name']

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['email'],
            email=validated_data['email'],
            password=validated_data['password'],
            first_name=validated_data['name']
        )
        return user
```

### B. Views
```python
# cafe/views.py
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from django.contrib.auth import authenticate
from .serializers import SignUpSerializer, UserSerializer

@api_view(['POST'])
@permission_classes([AllowAny])
def signup_view(request):
    serializer = SignUpSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        token, created = Token.objects.get_or_create(user=user)
        return Response({
            "token": token.key,
            "user": {
                "name": user.first_name,
                "email": user.email
            }
        }, status=201)
    return Response(serializer.errors, status=400)

@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request):
    email = request.data.get('email')
    password = request.data.get('password')
    
    user = authenticate(username=email, password=password)
    if user is not None:
        token, created = Token.objects.get_or_create(user=user)
        return Response({
            "token": token.key,
            "user": {
                "name": user.first_name,
                "email": user.email
            }
        }, status=200)
    return Response({"error": "Invalid email or password"}, status=400)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout_view(request):
    request.user.auth_token.delete()
    return Response({"message": "Logged out successfully"}, status=200)
```

---

## 5. Connecting the React Frontend

Once the API endpoints are live, update `src/components/AuthForm.jsx` to fetch real API endpoints:

```javascript
// Replace the setTimeout block inside handleSubmit with a fetch/axios query:
try {
  const url = mode === "login" ? "http://127.0.0.1:8000/api/auth/login/" : "http://127.0.0.1:8000/api/auth/signup/";
  const payload = mode === "login" 
    ? { email: formData.email, password: formData.password }
    : { name: formData.name, email: formData.email, password: formData.password };

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  const data = await response.json();
  if (response.ok) {
    // Save token and user details to localStorage
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));
    
    triggerToast(mode === "login" ? `Welcome back, ${data.user.name}!` : `Welcome to Brew Haven, ${data.user.name}!`);
    onSuccess(data.user);
  } else {
    // Set validation or response errors
    setErrors({ general: data.error || "Authentication failed" });
  }
} catch (err) {
  setErrors({ general: "Server connection lost. Please try again." });
}
```
