from django.contrib.gis import admin
from .models import Hospital, Profile, LocationHistory

@admin.register(Hospital)
class HospitalAdmin(admin.GISModelAdmin):
    list_display = ('name', 'category', 'subcategory', 'address1', 'eircode', 'added_by')
    search_fields = ('name', 'category', 'subcategory', 'eircode')
    list_filter = ('category', 'subcategory')
    readonly_fields = ('location',)

@admin.register(Profile)
class ProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'latitude', 'longitude', 'updated_at')
    search_fields = ('user__username',)

    def latitude(self, obj):
        return obj.location.y if obj.location else None  # Latitude

    def longitude(self, obj):
        return obj.location.x if obj.location else None  # Longitude


@admin.register(LocationHistory)
class LocationHistoryAdmin(admin.ModelAdmin):
    list_display = ('user', 'latitude', 'longitude', 'timestamp')

    def latitude(self, obj):
        return obj.location.y if obj.location else None  # Latitude

    def longitude(self, obj):
        return obj.location.x if obj.location else None  # Longitude