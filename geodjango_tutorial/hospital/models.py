from django.contrib.gis.db import models
from django.contrib.gis.db import models as gis_models
from django.contrib.auth import get_user_model
from django.utils.timezone import now
from django.db.models.signals import post_save
from django.dispatch import receiver

User = get_user_model()

# Hospital model to store hospital data with location information
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

# Profile model to store user profile information
class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="hospital_profile")
    location = gis_models.PointField(geography=True, blank=True, null=True)
    updated_at = models.DateTimeField(default=now)  # Add timestamp

    def __str__(self):
        return self.user.username

# LocationHistory model to store user location history
class LocationHistory(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    location = gis_models.PointField(geography=True)
    timestamp = models.DateTimeField(default=now)

    def __str__(self):
        return f"{self.user.username} - {self.timestamp}"

# Signal to create a Profile when a new User is created
@receiver(post_save, sender=User)
def create_profile(sender, instance, created, **kwargs):
    """
    Automatically create a Profile when a new User is created.
    """
    if created:
        Profile.objects.create(user=instance)

# Signal to save the Profile when the User is saved
@receiver(post_save, sender=User)
def save_profile(sender, instance, **kwargs):
    """
    Automatically save the Profile when the User is saved.
    """
    instance.hospital_profile.save()
