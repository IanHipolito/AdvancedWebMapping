from rest_framework import serializers
from .models import Hospital

# Serializer for the Hospital model to convert to GeoJSON format
class HospitalSerializer(serializers.Serializer):
    type = serializers.SerializerMethodField()
    geometry = serializers.SerializerMethodField()
    properties = serializers.SerializerMethodField()

    # Define the fields to include in the GeoJSON output
    class Meta:
        model = Hospital
        fields = ('type', 'geometry', 'properties')

    # Define the methods to convert the model fields to GeoJSON format
    def get_type(self, obj):
        return "Feature"

    # Convert PointField to GeoJSON format
    def get_geometry(self, obj):
        # Convert PointField to GeoJSON format
        return {
            "type": "Point",
            "coordinates": [obj.location.x, obj.location.y]
        }

    # Define the properties to include in the GeoJSON output
    def get_properties(self, obj):
        return {
            "name": obj.name,
            "address1": obj.address1,
            "eircode": obj.eircode,
            "subcategory": obj.subcategory
        }
