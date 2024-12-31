from django.urls import path
from . import views
from django.http import JsonResponse
from django.contrib import admin

def test_view(request):
    return JsonResponse({"message": "This is a test view!"})

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/hospitals/', views.HospitalListAPIView, name='hospital-list-api'),
    # path('test/', test_view, name='test_view'),
    # path('api/', api_overview, name='api-overview'),
    path('signup/', views.signup_view, name='hospital_signup'),
    path('login/', views.login_view, name='hospital_login'),
    path('logout/', views.logout_view, name='hospital_logout'),
    # path('map/', views.HospitalListAPIView, name='hospital_map'),
    path('user-info/', views.user_info, name='user_info'),
    path('update_location/', views.update_location, name='hospital_update_location'),
]