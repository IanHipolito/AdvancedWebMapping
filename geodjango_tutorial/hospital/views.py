from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from django.contrib.auth.password_validation import validate_password
from django.contrib.gis.geos import Point
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.exceptions import ValidationError
from knox.auth import TokenAuthentication
from knox.models import AuthToken
from .models import Hospital, Profile, LocationHistory
from rest_framework import generics
from .serializers import HospitalSerializer
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
import logging
from django.utils.timezone import now
logger = logging.getLogger(__name__)

class HospitalListAPIView(APIView):
    permission_classes = [IsAuthenticated]  # Ensure token authentication

    def get(self, request, *args, **kwargs):
        # Fetch subcategory filter from query parameters
        subcategory_filter = request.GET.get('subcategory', None)

        # Fetch hospitals and filter by subcategory if provided
        hospitals = Hospital.objects.all()
        if subcategory_filter:
            hospitals = hospitals.filter(subcategory=subcategory_filter)  # Filter&#8203;:contentReference[oaicite:1]{index=1}

        serializer = HospitalSerializer(hospitals, many=True)

        # Return GeoJSON format
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
    request._auth.delete()  # Delete the token used for authentication
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

    if not password or not confirm_password:
        return Response({"error": "Password and confirmation are required"}, status=400)

    if password != confirm_password:
        return Response({"error": "Passwords do not match"}, status=400)

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


@api_view(['GET'])
@permission_classes([AllowAny])
def hospital_map_view(request):
    """
    API endpoint for fetching hospital points.
    """
    category = request.GET.get('category', 'all')
    if category == 'all':
        points = Hospital.objects.all()
    else:
        points = Hospital.objects.filter(category=category)

    data = [
        {"id": point.id, "name": point.name, "address": point.address1, "lat": point.point_y, "lon": point.point_x}
        for point in points
    ]
    return Response(data, status=200)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def update_location(request):
    """
    Updates user location and logs the history.
    """
    latitude = request.data.get("latitude")
    longitude = request.data.get("longitude")

    if not latitude or not longitude:
        return Response({"success": False, "error": "Missing coordinates"}, status=400)

    try:
        # Ensure valid data types
        latitude = float(latitude)
        longitude = float(longitude)

        # Update Profile with the latest location
        profile, _ = Profile.objects.get_or_create(user=request.user)
        profile.location = Point(longitude, latitude)  # GeoDjango uses (longitude, latitude)
        profile.updated_at = now()  # Update timestamp
        profile.save()

        # Log location history
        LocationHistory.objects.create(
            user=request.user,
            location=Point(longitude, latitude),
        )

        return Response({"success": True}, status=200)

    except ValueError:
        return Response({"success": False, "error": "Invalid coordinates"}, status=400)
