from django.urls import path
from . import views

urlpatterns = [
    path('signup/', views.signup_view, name='hospital_signup'),
    path('login/', views.login_view, name='hospital_login'),
    path('logout/', views.logout_view, name='hospital_logout'),
    path('map/', views.hospital_map_view, name='hospital_map'),
    path('update_location/', views.update_location, name='hospital_update_location'),
]