from django.contrib.gis.db import models
from django.contrib.auth import get_user_model

User = get_user_model()

class Hospital(models.Model):
    object_id = models.IntegerField()
    category = models.CharField(max_length=100)
    subcategory = models.CharField(max_length=100)
    name = models.CharField(max_length=255)
    address1 = models.CharField(max_length=255, blank=True, null=True)
    address2 = models.CharField(max_length=255, blank=True, null=True)
    address3 = models.CharField(max_length=255, blank=True, null=True)
    address4 = models.CharField(max_length=255, blank=True, null=True)
    eircode = models.CharField(max_length=10, blank=True, null=True)
    point_x = models.FloatField()
    point_y = models.FloatField()
    location = models.PointField(geography=True, srid=4326)
    added_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name="hospitals", null=True, blank=True)

    def __str__(self):
        return self.name
    
class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="hospital_profile")
    location = models.PointField(null=True, blank=True)

    def __str__(self):
        return self.user.username
