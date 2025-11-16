from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from datetime import timedelta
from .models import Timer, TimerPreset
from .serializers import TimerSerializer, TimerActionSerializer, TimerPresetSerializer


class TimerViewSet(viewsets.ModelViewSet):
    """ViewSet pour gérer les timers"""
    queryset = Timer.objects.all()
    serializer_class = TimerSerializer
    
    def get_queryset(self):
        # Pour cette application simple, on utilise un seul timer
        # En production, vous pourriez ajouter une authentification
        Timer.objects.get_or_create(
            id=1,
            defaults={
                'mode': 'stopwatch',
                'status': 'stopped',
                'current_time': 0,
                'initial_time': 0
            }
        )
        return Timer.objects.filter(id=1)
    
    def get_object(self):
        """Récupère ou crée le timer avec l'ID 1"""
        timer, created = Timer.objects.get_or_create(
            id=1,
            defaults={
                'mode': 'stopwatch',
                'status': 'stopped',
                'current_time': 0,
                'initial_time': 0
            }
        )
        return timer
    
    @action(methods=['post'], detail=True, url_path='action')
    def perform_action(self, request, pk=None):
        """Endpoint pour les actions (start, stop, reset, toggle_mode)"""
        timer = self.get_object()
        serializer = TimerActionSerializer(data=request.data)
        
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        action_type = serializer.validated_data['action']
        
        if action_type == 'start':
            if timer.status != 'running':
                timer.status = 'running'
                if timer.mode == 'stopwatch':
                    # Pour le chronomètre, on continue depuis le temps actuel
                    timer.started_at = timezone.now()
                else:
                    # Pour le minuteur, on démarre depuis le temps initial
                    if timer.current_time == 0:
                        timer.current_time = timer.initial_time
                    timer.started_at = timezone.now()
                timer.save()
        
        elif action_type == 'stop':
            if timer.status == 'running':
                # Calculer le temps écoulé depuis le démarrage
                if timer.started_at:
                    elapsed = timezone.now() - timer.started_at
                    elapsed_ms = int(elapsed.total_seconds() * 1000)
                    
                    if timer.mode == 'stopwatch':
                        timer.current_time += elapsed_ms
                    else:
                        timer.current_time = max(0, timer.current_time - elapsed_ms)
                        if timer.current_time == 0:
                            timer.status = 'stopped'
                
                timer.status = 'paused'
                timer.started_at = None
                timer.save()
        
        elif action_type == 'reset':
            timer.status = 'stopped'
            timer.started_at = None
            if timer.mode == 'stopwatch':
                timer.current_time = 0
            else:
                timer.current_time = timer.initial_time
            timer.save()
        
        elif action_type == 'toggle_mode':
            timer.status = 'stopped'
            timer.started_at = None
            if timer.mode == 'stopwatch':
                timer.mode = 'countdown'
                timer.current_time = timer.initial_time
            else:
                timer.mode = 'stopwatch'
                timer.current_time = 0
            timer.save()
        
        # Mettre à jour le temps si le timer est en cours
        if timer.status == 'running' and timer.started_at:
            elapsed = timezone.now() - timer.started_at
            elapsed_ms = int(elapsed.total_seconds() * 1000)
            
            if timer.mode == 'stopwatch':
                current = timer.current_time + elapsed_ms
            else:
                current = max(0, timer.current_time - elapsed_ms)
                if current == 0:
                    timer.status = 'stopped'
                    timer.started_at = None
                    timer.save()
        else:
            current = timer.current_time
        
        response_data = TimerSerializer(timer).data
        response_data['calculated_time'] = current
        response_data['is_running'] = timer.status == 'running'
        
        return Response(response_data)
    
    @action(detail=True, methods=['post'])
    def set_time(self, request, pk=None):
        """Endpoint pour définir le temps initial du minuteur"""
        timer = self.get_object()
        hours = request.data.get('hours', 0)
        minutes = request.data.get('minutes', 0)
        seconds = request.data.get('seconds', 0)
        
        # Convertir en millisecondes
        total_ms = (hours * 3600 + minutes * 60 + seconds) * 1000
        timer.initial_time = total_ms
        if timer.mode == 'countdown':
            timer.current_time = total_ms
        timer.save()
        
        return Response(TimerSerializer(timer).data)
    
    def list(self, request, *args, **kwargs):
        """Surcharge pour créer le timer s'il n'existe pas"""
        self.get_object()  # Crée le timer s'il n'existe pas
        return super().list(request, *args, **kwargs)
    
    @action(detail=True, methods=['get'])
    def current(self, request, pk=None):
        """Endpoint pour obtenir l'état actuel du timer avec calcul en temps réel"""
        timer = self.get_object()  # Crée le timer s'il n'existe pas
        
        # Calculer le temps actuel si le timer est en cours
        if timer.status == 'running' and timer.started_at:
            elapsed = timezone.now() - timer.started_at
            elapsed_ms = int(elapsed.total_seconds() * 1000)
            
            if timer.mode == 'stopwatch':
                current = timer.current_time + elapsed_ms
            else:
                current = max(0, timer.current_time - elapsed_ms)
                if current == 0:
                    timer.status = 'stopped'
                    timer.started_at = None
                    timer.save()
        else:
            current = timer.current_time
        
        response_data = TimerSerializer(timer).data
        response_data['calculated_time'] = current
        response_data['is_running'] = timer.status == 'running'
        
        return Response(response_data)


class TimerPresetViewSet(viewsets.ModelViewSet):
    """ViewSet pour gérer les presets de minuteurs"""
    queryset = TimerPreset.objects.all()
    serializer_class = TimerPresetSerializer
    
    def create(self, request, *args, **kwargs):
        """Créer un nouveau preset"""
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    
    @action(detail=True, methods=['post'])
    def apply_to_timer(self, request, pk=None):
        """Appliquer ce preset au timer principal"""
        preset = self.get_object()
        
        # Récupérer ou créer le timer principal
        timer, created = Timer.objects.get_or_create(
            id=1,
            defaults={
                'mode': 'countdown',
                'status': 'stopped',
                'current_time': 0,
                'initial_time': 0
            }
        )
        
        # Appliquer le preset
        timer.mode = 'countdown'
        timer.status = 'stopped'
        timer.initial_time = preset.duration
        timer.current_time = preset.duration
        timer.started_at = None
        timer.save()
        
        # Retourner l'état du timer mis à jour
        timer_serializer = TimerSerializer(timer)
        return Response({
            'message': f'Preset "{preset.name}" appliqué au timer',
            'preset': TimerPresetSerializer(preset).data,
            'timer': timer_serializer.data
        })
    
    @action(detail=False, methods=['post'])
    def create_from_current_timer(self, request):
        """Créer un preset à partir du timer actuel"""
        try:
            timer = Timer.objects.get(id=1)
        except Timer.DoesNotExist:
            return Response(
                {'error': 'Aucun timer actif trouvé'}, 
                status=status.HTTP_404_NOT_FOUND
            )
        
        if timer.mode != 'countdown' or timer.initial_time == 0:
            return Response(
                {'error': 'Le timer doit être en mode minuteur avec une durée définie'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        name = request.data.get('name')
        if not name:
            return Response(
                {'error': 'Le nom du preset est requis'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Créer le preset
        preset_data = {
            'name': name,
            'description': request.data.get('description', ''),
            'duration': timer.initial_time,
            'color': request.data.get('color', '#14a085'),
            'icon': request.data.get('icon', ''),
            'order': request.data.get('order', 0)
        }
        
        serializer = TimerPresetSerializer(data=preset_data)
        serializer.is_valid(raise_exception=True)
        preset = serializer.save()
        
        return Response(serializer.data, status=status.HTTP_201_CREATED)

