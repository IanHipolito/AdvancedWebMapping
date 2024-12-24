from django.contrib.gis.geos import Point
from django.http import JsonResponse, HttpResponse
from django.views.decorators.csrf import csrf_exempt
from django.shortcuts import render, redirect, resolve_url
from django.contrib.auth import get_user_model, login, logout, authenticate
from django.contrib.auth.forms import AuthenticationForm
from .models import Hospital, Profile
from django.core.serializers import serialize
from django.contrib.auth.models import User
from .forms import SignupForm
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import generics
from .models import Hospital
from .serializers import HospitalSerializer

class HospitalListAPIView(generics.ListAPIView):
    queryset = Hospital.objects.all()
    serializer_class = HospitalSerializer

User = get_user_model()

def set_user_location(user_id, latitude, longitude):
    user = User.objects.get(id=user_id)
    location = Point(longitude, latitude)  # Point takes (longitude, latitude)

    # Create or update the user's profile
    profile, created = Profile.objects.get_or_create(user=user)
    profile.location = location
    profile.save()

    return profile

def signup_view(request):
    if request.method == 'POST':
        form = SignupForm(request.POST)
        if form.is_valid():
            user = form.save(commit=False)
            user.set_password(form.cleaned_data['password'])
            user.save()
            return redirect('hospital_login')  # Redirect to login page after signup
    else:
        form = SignupForm()
    return render(request, 'hospital/signup.html', {'form': form})

def login_view(request):
    if request.method == 'POST':
        form = AuthenticationForm(request, data=request.POST)
        if form.is_valid():
            user = form.get_user()
            login(request, user)
            return redirect('hospital_map')  # Redirect to the main map view for hospitals
    else:
        form = AuthenticationForm()
    return render(request, 'hospital/login.html', {'form': form})

def logout_view(request):
    logout(request)
    return redirect(resolve_url('hospital_login'))  # Redirect to the login page after logout

def hospital_map_view(request):
    if request.user.is_authenticated:
        try:
            user_profile = Profile.objects.get(user=request.user)
            user_location = user_profile.location
        except Profile.DoesNotExist:
            user_location = None

        hospitals = Hospital.objects.all()
        hospitals_json = serialize('geojson', hospitals)  # Serialize to GeoJSON
        return render(request, 'hospital/map.html', {
            'user': request.user,
            'user_location': user_location,
            'hospitals': hospitals_json
        })
    else:
        return redirect(resolve_url('hospital_login'))
    
def update_location(request):
    if request.method == 'POST' and request.user.is_authenticated:
        latitude = request.POST.get('latitude')
        longitude = request.POST.get('longitude')

        if latitude and longitude:
            try:
                latitude = float(latitude)
                longitude = float(longitude)
                location = Point(longitude, latitude)
                
                profile, created = Profile.objects.get_or_create(user=request.user)
                profile.location = location
                profile.save()

                return JsonResponse({'success': True})
            except ValueError:
                return JsonResponse({'success': False, 'error': 'Invalid coordinates'})
        else:
            return JsonResponse({'success': False, 'error': 'Missing coordinates'})
    return JsonResponse({'success': False, 'error': 'Invalid request'})

def hospital_map_view(request):
    if request.user.is_authenticated:
        try:
            user_profile = Profile.objects.get(user=request.user)
            user_location = user_profile.location
        except Profile.DoesNotExist:
            user_location = None

        hospitals = Hospital.objects.all()
        hospitals_json = serialize('geojson', hospitals)  # Serialize to GeoJSON
        return render(request, 'hospital/map.html', {
            'user': request.user,
            'user_location': user_location,
            'hospitals': hospitals_json
        })
    else:
        return redirect(resolve_url('hospital_login'))
    
def update_location(request):
    if request.method == 'POST' and request.user.is_authenticated:
        latitude = request.POST.get('latitude')
        longitude = request.POST.get('longitude')

        if latitude and longitude:
            try:
                latitude = float(latitude)
                longitude = float(longitude)
                location = Point(longitude, latitude)
                
                profile, created = Profile.objects.get_or_create(user=request.user)
                profile.location = location
                profile.save()

                return JsonResponse({'success': True})
            except ValueError:
                return JsonResponse({'success': False, 'error': 'Invalid coordinates'})
        else:
            return JsonResponse({'success': False, 'error': 'Missing coordinates'})
    return JsonResponse({'success': False, 'error': 'Invalid request'})

@api_view(['GET'])
def api_overview(request):
    return Response({"message": "Welcome to the API!"})