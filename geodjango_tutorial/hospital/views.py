# from django.contrib.gis.geos import Point
# from django.http import JsonResponse, HttpResponse
# from django.views.decorators.csrf import csrf_exempt
# from django.shortcuts import render, redirect, resolve_url
# from django.contrib.auth import get_user_model, login, logout, authenticate
# from django.contrib.auth.forms import AuthenticationForm
# from .models import Hospital, Profile
# from django.core.serializers import serialize
# from django.contrib.auth.models import User
# from .forms import SignupForm
# from rest_framework.decorators import api_view
# from rest_framework.response import Response
# from rest_framework import generics
# from .models import Hospital
# from .serializers import HospitalSerializer
# from django.contrib.auth import authenticate, login
# from knox.auth import TokenAuthentication
# from knox.models import AuthToken
# from rest_framework_gis.serializers import GeoFeatureModelSerializer
# from django.contrib.auth.password_validation import validate_password
# from rest_framework.decorators import api_view, permission_classes
# from rest_framework.permissions import AllowAny, IsAuthenticated
# from rest_framework.exceptions import ValidationError

# class HospitalListAPIView(generics.ListAPIView):
#     queryset = Hospital.objects.all()
#     serializer_class = HospitalSerializer

# User = get_user_model()

# def set_user_location(user_id, latitude, longitude):
#     user = User.objects.get(id=user_id)
#     location = Point(longitude, latitude)  # Point takes (longitude, latitude)

#     # Create or update the user's profile
#     profile, created = Profile.objects.get_or_create(user=user)
#     profile.location = location
#     profile.save()

#     return profile

# # def signup_view(request):
# #     if request.method == 'POST':
# #         form = SignupForm(request.POST)
# #         if form.is_valid():
# #             user = form.save(commit=False)
# #             user.set_password(form.cleaned_data['password'])
# #             user.save()
# #             return redirect('hospital_login')  # Redirect to login page after signup
# #     else:
# #         form = SignupForm()
# #     return render(request, 'hospital/signup.html', {'form': form})

# @csrf_exempt
# def signup_view(request):
#     if request.method == 'POST':
#         form = SignupForm(request.POST)
#         if form.is_valid():
#             user = form.save(commit=False)
#             user.set_password(form.cleaned_data['password'])
#             user.save()
#             return JsonResponse({'message': 'Signup successful'}, status=200)
#         else:
#             return JsonResponse({'error': 'Invalid data'}, status=400)
#     return JsonResponse({'error': 'Invalid request'}, status=400)

# # def login_view(request):
# #     if request.method == 'POST':
# #         form = AuthenticationForm(request, data=request.POST)
# #         if form.is_valid():
# #             user = form.get_user()
# #             login(request, user)
# #             return redirect('hospital_map')  # Redirect to the main map view for hospitals
# #     else:
# #         form = AuthenticationForm()
# #     return render(request, 'hospital/login.html', {'form': form})

# @api_view(['POST'])
# @permission_classes([AllowAny])
# def login_view(request):
#     if request.method == 'POST':
#         username = request.POST.get('username')
#         password = request.POST.get('password')
#         user = authenticate(username=username, password=password)
#         if user:
#             login(request, user)
#             return JsonResponse({'message': 'Login successful'})
#         return JsonResponse({'error': 'Invalid credentials'}, status=401)
#     return JsonResponse({'error': 'Invalid request'}, status=400)

# def logout_view(request):
#     logout(request)
#     return redirect(resolve_url('hospital_login'))  # Redirect to the login page after logout

# def hospital_map_view(request):
#     if request.user.is_authenticated:
#         try:
#             user_profile = Profile.objects.get(user=request.user)
#             user_location = user_profile.location
#         except Profile.DoesNotExist:
#             user_location = None

#         hospitals = Hospital.objects.all()
#         hospitals_json = serialize('geojson', hospitals)  # Serialize to GeoJSON
#         return render(request, 'hospital/map.html', {
#             'user': request.user,
#             'user_location': user_location,
#             'hospitals': hospitals_json
#         })
#     else:
#         return redirect(resolve_url('hospital_login'))
    
# def update_location(request):
#     if request.method == 'POST' and request.user.is_authenticated:
#         latitude = request.POST.get('latitude')
#         longitude = request.POST.get('longitude')

#         if latitude and longitude:
#             try:
#                 latitude = float(latitude)
#                 longitude = float(longitude)
#                 location = Point(longitude, latitude)
                
#                 profile, created = Profile.objects.get_or_create(user=request.user)
#                 profile.location = location
#                 profile.save()

#                 return JsonResponse({'success': True})
#             except ValueError:
#                 return JsonResponse({'success': False, 'error': 'Invalid coordinates'})
#         else:
#             return JsonResponse({'success': False, 'error': 'Missing coordinates'})
#     return JsonResponse({'success': False, 'error': 'Invalid request'})

# def hospital_map_view(request):
#     if request.user.is_authenticated:
#         try:
#             user_profile = Profile.objects.get(user=request.user)
#             user_location = user_profile.location
#         except Profile.DoesNotExist:
#             user_location = None

#         hospitals = Hospital.objects.all()
#         hospitals_json = serialize('geojson', hospitals)  # Serialize to GeoJSON
#         return render(request, 'hospital/map.html', {
#             'user': request.user,
#             'user_location': user_location,
#             'hospitals': hospitals_json
#         })
#     else:
#         return redirect(resolve_url('hospital_login'))
    
# def update_location(request):
#     if request.method == 'POST' and request.user.is_authenticated:
#         latitude = request.POST.get('latitude')
#         longitude = request.POST.get('longitude')

#         if latitude and longitude:
#             try:
#                 latitude = float(latitude)
#                 longitude = float(longitude)
#                 location = Point(longitude, latitude)
                
#                 profile, created = Profile.objects.get_or_create(user=request.user)
#                 profile.location = location
#                 profile.save()

#                 return JsonResponse({'success': True})
#             except ValueError:
#                 return JsonResponse({'success': False, 'error': 'Invalid coordinates'})
#         else:
#             return JsonResponse({'success': False, 'error': 'Missing coordinates'})
#     return JsonResponse({'success': False, 'error': 'Invalid request'})

# @api_view(['GET'])
# def api_overview(request):
#     return Response({"message": "Welcome to the API!"})

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
from .models import Hospital, Profile
from rest_framework import generics
from .models import Hospital
from .serializers import HospitalSerializer

class HospitalListAPIView(generics.ListAPIView):
    queryset = Hospital.objects.all()
    serializer_class = HospitalSerializer

@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request):
    """
    Knox-based API endpoint for user login.
    """
    username = request.data.get('username')
    password = request.data.get('password')

    user = authenticate(username=username, password=password)
    if user:
        token = AuthToken.objects.create(user)[1]
        return Response({"success": "Logged in successfully", "token": token}, status=200)
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
    API endpoint for updating user location.
    """
    latitude = request.data.get("latitude")
    longitude = request.data.get("longitude")

    if latitude and longitude:
        profile, _ = Profile.objects.get_or_create(user=request.user)
        profile.location = Point(float(longitude), float(latitude))
        profile.save()
        return Response({"success": True}, status=200)
    return Response({"success": False, "error": "Invalid request"}, status=400)