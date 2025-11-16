from django.contrib import admin
from .models import Timer, TimerPreset


@admin.register(Timer)
class TimerAdmin(admin.ModelAdmin):
    list_display = ['id', 'mode', 'status', 'current_time', 'initial_time', 'updated_at']
    list_filter = ['mode', 'status']
    readonly_fields = ['created_at', 'updated_at']


@admin.register(TimerPreset)
class TimerPresetAdmin(admin.ModelAdmin):
    list_display = ['name', 'formatted_duration_display', 'color', 'order', 'created_at']
    list_filter = ['created_at']
    list_editable = ['order']
    search_fields = ['name', 'description']
    readonly_fields = ['created_at', 'updated_at']
    
    def formatted_duration_display(self, obj):
        duration = obj.formatted_duration
        if duration['hours'] > 0:
            return f"{duration['hours']}h {duration['minutes']:02d}m {duration['seconds']:02d}s"
        elif duration['minutes'] > 0:
            return f"{duration['minutes']}m {duration['seconds']:02d}s"
        else:
            return f"{duration['seconds']}s"
    formatted_duration_display.short_description = 'Durée'

