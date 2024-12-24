from django.urls import path
from . import views
from .views import api_overview, HospitalListAPIView
from django.http import JsonResponse

def test_view(request):
    return JsonResponse({"message": "This is a test view!"})

urlpatterns = [
    path('api/hospitals/', HospitalListAPIView.as_view(), name='hospital-list-api'),
    path('test/', test_view, name='test_view'),
    path('api/', api_overview, name='api-overview'),
    path('signup/', views.signup_view, name='hospital_signup'),
    path('login/', views.login_view, name='hospital_login'),
    path('logout/', views.logout_view, name='hospital_logout'),
    path('map/', views.hospital_map_view, name='hospital_map'),
    path('update_location/', views.update_location, name='hospital_update_location'),
]