from django.contrib.gis import admin
from .models import Hospital, Profile

@admin.register(Hospital)
class HospitalAdmin(admin.GISModelAdmin):
    list_display = ('name', 'category', 'subcategory', 'address1', 'eircode', 'added_by')
    search_fields = ('name', 'category', 'subcategory', 'eircode')
    list_filter = ('category', 'subcategory')
    readonly_fields = ('location',)

@admin.register(Profile)
class ProfileAdmin(admin.GISModelAdmin):
    list_display = ('user', 'location')
    search_fields = ('user__username',)
    readonly_fields = ('location',)
