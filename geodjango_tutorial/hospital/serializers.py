from rest_framework_gis.serializers import GeoFeatureModelSerializer
from .models import Hospital

class HospitalSerializer(GeoFeatureModelSerializer):
    class Meta:
        model = Hospital
        geo_field = "location"
        fields = ('name', 'address1', 'eircode')