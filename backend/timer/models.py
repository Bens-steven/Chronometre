from django.db import models
from django.utils import timezone


class Timer(models.Model):
    """Modèle pour stocker l'état d'un timer"""
    MODE_CHOICES = [
        ('stopwatch', 'Chronomètre'),
        ('countdown', 'Minuteur'),
    ]
    
    STATUS_CHOICES = [
        ('stopped', 'Arrêté'),
        ('running', 'En cours'),
        ('paused', 'En pause'),
    ]
    
    mode = models.CharField(max_length=10, choices=MODE_CHOICES, default='stopwatch')
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='stopped')
    
    # Temps actuel (en millisecondes)
    current_time = models.BigIntegerField(default=0)
    
    # Temps initial pour le minuteur (en millisecondes)
    initial_time = models.BigIntegerField(default=0)
    
    # Timestamp de démarrage
    started_at = models.DateTimeField(null=True, blank=True)
    
    # Timestamp de dernière mise à jour
    updated_at = models.DateTimeField(auto_now=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Timer {self.id} - {self.mode} - {self.status}"


class TimerPreset(models.Model):
    """Modèle pour stocker des presets de minuteurs (ex: Sport 15min, Travail 25min)"""
    name = models.CharField(max_length=100, help_text="Nom du preset (ex: Sport, Travail, Pause)")
    description = models.TextField(blank=True, help_text="Description optionnelle")
    
    # Durée en millisecondes
    duration = models.BigIntegerField(help_text="Durée en millisecondes")
    
    # Couleur/icône pour personnaliser (optionnel)
    color = models.CharField(max_length=7, default="#14a085", help_text="Couleur hex du preset")
    icon = models.CharField(max_length=50, blank=True, help_text="Nom de l'icône (optionnel)")
    
    # Ordre d'affichage
    order = models.IntegerField(default=0)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['order', 'name']
    
    def __str__(self):
        hours = self.duration // (1000 * 60 * 60)
        minutes = (self.duration % (1000 * 60 * 60)) // (1000 * 60)
        seconds = (self.duration % (1000 * 60)) // 1000
        
        if hours > 0:
            time_str = f"{hours}h{minutes:02d}m"
        elif minutes > 0:
            time_str = f"{minutes}m"
        else:
            time_str = f"{seconds}s"
            
        return f"{self.name} ({time_str})"
    
    @property
    def formatted_duration(self):
        """Retourne la durée formatée"""
        hours = self.duration // (1000 * 60 * 60)
        minutes = (self.duration % (1000 * 60 * 60)) // (1000 * 60)
        seconds = (self.duration % (1000 * 60)) // 1000
        
        return {
            'hours': hours,
            'minutes': minutes,
            'seconds': seconds,
            'total_seconds': self.duration // 1000
        }

