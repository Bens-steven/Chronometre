from rest_framework import serializers
from .models import Timer, TimerPreset


class TimerSerializer(serializers.ModelSerializer):
    """Serializer pour le modèle Timer"""
    
    class Meta:
        model = Timer
        fields = ['id', 'mode', 'status', 'current_time', 'initial_time', 
                  'started_at', 'updated_at', 'created_at']
        read_only_fields = ['id', 'started_at', 'updated_at', 'created_at']


class TimerActionSerializer(serializers.Serializer):
    """Serializer pour les actions sur le timer"""
    action = serializers.ChoiceField(choices=['start', 'stop', 'reset', 'toggle_mode'])
    hours = serializers.IntegerField(min_value=0, max_value=99, required=False, default=0)
    minutes = serializers.IntegerField(min_value=0, max_value=59, required=False, default=0)
    seconds = serializers.IntegerField(min_value=0, max_value=59, required=False, default=0)


class TimerPresetSerializer(serializers.ModelSerializer):
    formatted_duration = serializers.ReadOnlyField()
    
    class Meta:
        model = TimerPreset
        fields = ['id', 'name', 'description', 'duration', 'color', 'icon', 'order', 'formatted_duration', 'created_at']
        
    def validate_duration(self, value):
        """Valider que la durée est positive et raisonnable"""
        if value <= 0:
            raise serializers.ValidationError("La durée doit être positive")
        if value > 24 * 60 * 60 * 1000:  # Max 24 heures
            raise serializers.ValidationError("La durée ne peut pas dépasser 24 heures")
        return value

