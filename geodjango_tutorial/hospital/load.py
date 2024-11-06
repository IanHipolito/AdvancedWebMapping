from pathlib import Path
from django.contrib.gis.utils import LayerMapping
from .models import Hospital

hospital_mapping = {
    'object_id': 'OBJECTID',
    'category': 'category',
    'subcategory': 'subcategory',
    'name': 'name',
    'address1': 'address1',
    'address2': 'address2',
    'address3': 'address3',
    'address4': 'address4',
    'eircode': 'Eircode',
    'point_x': 'POINT_X',
    'point_y': 'POINT_Y',
    'location': 'POINT',
}

hospital_geojson = Path(__file__).resolve().parent / 'data' / 'Hospitals_-_HSE_Ireland.geojson'

def run(verbose=True):
    lm = LayerMapping(Hospital, hospital_geojson, hospital_mapping, transform=False)
    lm.save(strict=True, verbose=verbose)
