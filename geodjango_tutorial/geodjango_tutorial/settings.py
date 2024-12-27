"""
Django settings for geodjango_tutorial project.

Generated by 'django-admin startproject' using Django 5.1.

For more information on this file, see
https://docs.djangoproject.com/en/5.1/topics/settings/

For the full list of settings and their values, see
https://docs.djangoproject.com/en/5.1/ref/settings/
"""

from pathlib import Path
import os
import socket

# DOCKER CONFIG VARIABLES HARD CODED
PROJECT_NAME = 'geodjango_tutorial'
POSTGIS_PORT = '5432'
DEPLOY_SECURE = True

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent
with open(os.path.join(BASE_DIR, 'secret_key.txt')) as f:
    SECRET_KEY = f.read().strip()

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = not DEPLOY_SECURE

# Quick-start development settings - unsuitable for production
# See https://docs.djangoproject.com/en/5.1/howto/deployment/checklist/

# SECURITY WARNING: keep the secret key used in production secret!
# SECRET_KEY = 'django-insecure-!fkibx#4-0yg!szzmiqj+*$i_z$fkx9$u8g!w^t50&6!4e=x)0'
GDAL_LIBRARY_PATH = os.getenv('GDAL_LIBRARY_PATH', '/opt/conda/envs/awm_env/lib/libgdal.so')


# # SECURITY WARNING: don't run with debug turned on in production!
# DEBUG = True
# ALLOWED_HOSTS = ['localhost','0.0.0.0', '127.0.0.1']


# Application definition

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'django.contrib.gis',
    'world.apps.WorldConfig',
    'rest_framework',
    'rest_framework.authtoken',
    'corsheaders',
    'hospital',
    # 'rest_framework_gis',
    'knox',
]

MIDDLEWARE = [
    'geodjango_tutorial.middleware.TestCORSMiddleware',
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

# CORS_ALLOW_ALL_ORIGINS = True

# CORS_ALLOWED_ORIGINS = [
#     "http://localhost:3000",
#     "http://127.0.0.1:3000",
#     "http://localhost:8001",
#     "http://127.0.0.1:8001",
#     "https://c21436494.xyz",
# ]

# CORS_TRUSTED_ORIGINS = [
#     "http://localhost:3000",
#     "http://127.0.0.1:3000",
#     "http://localhost:8001",
#     "http://127.0.0.1:8001",
#     "https://c21436494.xyz",
# ]

# REST Framework configuration
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'knox.auth.TokenAuthentication',  # Knox token authentication
        'rest_framework.authentication.BasicAuthentication',  # Optional
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticated',  # Require authentication by default
    ],
}


ROOT_URLCONF = 'geodjango_tutorial.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'geodjango_tutorial.wsgi.application'


# Database
# https://docs.djangoproject.com/en/5.1/ref/settings/#databases

DATABASES = {
    'default': {
        'ENGINE': 'django.contrib.gis.db.backends.postgis',
        'NAME': 'gis',
        'HOST': 'postgis',
        'USER': 'docker',
        'PASSWORD': 'docker',
        'PORT': 5432
    }
}


# Password validation
# https://docs.djangoproject.com/en/5.1/ref/settings/#auth-password-validators

AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]


# Internationalization
# https://docs.djangoproject.com/en/5.1/topics/i18n/

LANGUAGE_CODE = 'en-us'

TIME_ZONE = 'UTC'

USE_I18N = True

USE_TZ = True


# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/5.1/howto/static-files/
STATICFILES_STORAGE = "whitenoise.storage.CompressedManifestStaticFilesStorage"
STATIC_ROOT = os.path.join(BASE_DIR, 'static')


STATIC_URL = 'static/'

if socket.gethostname() == 'W-PF4AHNEN':
    DATABASES["default"]["HOST"] = "localhost"
    DATABASES["default"]["PORT"] = POSTGIS_PORT
else:
    DATABASES["default"]["HOST"] = "postgis"
    DATABASES["default"]["PORT"] = 5432


if DEPLOY_SECURE:

    DEBUG = False

    TEMPLATES[0]["OPTIONS"]["debug"] = False

    # Allow only specified hosts in production
    ALLOWED_HOSTS = ['*.c21436494.xyz', 'c21436494.xyz', 'localhost', '127.0.0.1']
    
    CORS_ALLOWED_ORIGINS = ['https://c21436494.xyz']
else:

    DEBUG = True

    TEMPLATES[0]["OPTIONS"]["debug"] = True

    # Allow all hosts in development
    ALLOWED_HOSTS = ['localhost', '127.0.0.1', '0.0.0.0']

    # Allow all origins during development
    CORS_ALLOWED_ALL_ORIGINS = True

# Default primary key field type
# https://docs.djangoproject.com/en/5.1/ref/settings/#default-auto-field

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'