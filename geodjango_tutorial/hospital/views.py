from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from django.contrib.auth.password_validation import validate_password
from django.contrib.gis.geos import Point
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.exceptions import ValidationError
from knox.models import AuthToken
from .models import Hospital, Profile, LocationHistory
from .serializers import HospitalSerializer
from rest_framework.permissions import IsAuthenticated
import logging
from django.utils.timezone import now
logger = logging.getLogger(__name__)

@api_view(['GET'])
@permission_classes([AllowAny])
def HospitalListAPIView(request):
    """
    Publicly accessible endpoint for listing hospitals.
    Supports optional filtering by subcategory.
    """
    subcategory_filter = request.GET.get('subcategory', None)

    # Fetch all hospitals or filter by subcategory
    hospitals = Hospital.objects.all()
    if subcategory_filter:
        hospitals = hospitals.filter(subcategory=subcategory_filter)

    serializer = HospitalSerializer(hospitals, many=True)

    # Convert to GeoJSON format
    geojson_response = {
        "type": "FeatureCollection",
        "features": serializer.data
    }
    return Response(geojson_response)

@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request):
    """
    Knox-based API endpoint for user login.
    """
    logger.info(f"Login attempt: {request.data}")
    username = request.data.get('username')
    password = request.data.get('password')

    # Authenticate user and generate token if successful login
    user = authenticate(username=username, password=password)
    if user:
        token = AuthToken.objects.create(user)[1]
        logger.info(f"Login success for {username}")
        return Response({"success": "Logged in successfully", "token": token}, status=200)
    logger.warning(f"Failed login attempt for {username}")
    return Response({"error": "Invalid username or password"}, status=401)


@api_view(['POST'])
def logout_view(request):
    """
    Knox-based API endpoint for user logout.
    """
    request._auth.delete()
    return Response({"success": "Logged out successfully"}, status=200)


@api_view(['POST'])
@permission_classes([AllowAny])
def signup_view(request):
    """
    API endpoint for user registration.
    """
    data = request.data
    username = data.get('username')
    email = data.get('email')
    password = data.get('password')
    confirm_password = data.get('confirm_password')

    # Validate input data and create user if successful registration attempt
    if not password or not confirm_password:
        return Response({"error": "Password and confirmation are required"}, status=400)

    # Check if passwords match
    if password != confirm_password:
        return Response({"error": "Passwords do not match"}, status=400)

    # Validate password strength and create user if successful registration attempt
    try:
        validate_password(password)
        user = User.objects.create_user(username=username, email=email, password=password)
        user.save()
        return Response({"success": "User registered successfully!"}, status=201)
    except ValidationError as e:
        return Response({"error": e.messages}, status=400)
    except Exception as e:
        return Response({"error": str(e)}, status=400)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_info(request):
    """
    API endpoint to fetch user info for authenticated users.
    """
    user = request.user
    return Response({
        "id": user.id,
        "username": user.username,
        "email": user.email,
    }, status=200)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def update_location(request):
    """
    Updates user location and logs the history.
    """
    latitude = request.data.get("latitude")
    longitude = request.data.get("longitude")

    # Validate input data and update user location if successful attempt is made
    if not latitude or not longitude:
        return Response({"success": False, "error": "Missing coordinates"}, status=400)

    # Update user location and log the history
    try:
        latitude = float(latitude)
        longitude = float(longitude)

        profile, _ = Profile.objects.get_or_create(user=request.user)
        profile.location = Point(longitude, latitude)
        profile.updated_at = now()
        profile.save()

        # Log the location history for the user
        LocationHistory.objects.create(
            user=request.user,
            location=Point(longitude, latitude),
        )

        return Response({"success": True}, status=200)

    except ValueError:
        return Response({"success": False, "error": "Invalid coordinates"}, status=400)
