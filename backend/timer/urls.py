from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'timers', views.TimerViewSet)
router.register(r'presets', views.TimerPresetViewSet)

urlpatterns = [
    path('', include(router.urls)),
]

