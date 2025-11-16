"""
URL configuration for timer_project project.
"""
from django.contrib import admin
from django.urls import path, include
from django.http import JsonResponse

def api_root(request):
    """Page d'accueil de l'API"""
    return JsonResponse({
        'message': 'Timer API - Django REST Framework',
        'endpoints': {
            'current_timer': '/api/timers/1/current/',
            'timer_actions': '/api/timers/1/action/',
            'set_time': '/api/timers/1/set_time/',
            'admin': '/admin/',
        },
        'usage': {
            'GET /api/timers/1/current/': 'Obtenir l\'état actuel du timer',
            'POST /api/timers/1/action/': 'Effectuer une action (start, stop, reset, toggle_mode)',
            'POST /api/timers/1/set_time/': 'Définir le temps initial du minuteur',
        }
    })

urlpatterns = [
    path('', api_root, name='api-root'),
    path('admin/', admin.site.urls),
    path('api/', include('timer.urls')),
]

