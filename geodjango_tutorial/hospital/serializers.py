from rest_framework import serializers
from .models import Hospital

class HospitalSerializer(serializers.Serializer):
    type = serializers.SerializerMethodField()
    geometry = serializers.SerializerMethodField()
    properties = serializers.SerializerMethodField()

    class Meta:
        model = Hospital
        fields = ('type', 'geometry', 'properties')

    def get_type(self, obj):
        return "Feature"

    def get_geometry(self, obj):
        # Convert PointField to GeoJSON format
        return {
            "type": "Point",
            "coordinates": [obj.location.x, obj.location.y]
        }

    def get_properties(self, obj):
        return {
            "name": obj.name,
            "address1": obj.address1,
            "eircode": obj.eircode
        }
