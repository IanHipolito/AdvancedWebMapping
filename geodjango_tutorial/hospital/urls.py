from django.urls import path
from . import views

urlpatterns = [
    path('map/', views.hospital_map_view, name='hospital_map'),  # This should be correct now
    path('login/', views.login_view, name='hospital_login'),
    path('logout/', views.logout_view, name='hospital_logout'),
    path('update_location/', views.update_location, name='hospital_update_location'),
]