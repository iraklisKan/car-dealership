from django.contrib import admin
from .models import ContactMessage


@admin.register(ContactMessage)
class ContactMessageAdmin(admin.ModelAdmin):
    """Admin interface for ContactMessage model."""
    
    list_display = [
        'name',
        'email',
        'subject',
        'car',
        'status',
        'created_at',
    ]
    
    list_filter = [
        'status',
        'created_at',
    ]
    
    search_fields = [
        'name',
        'email',
        'subject',
        'message',
    ]
    
    list_editable = ['status']
    
    readonly_fields = ['created_at', 'updated_at', 'ip_address']
    
    fieldsets = (
        ('Contact Information', {
            'fields': ('name', 'email', 'phone')
        }),
        ('Message', {
            'fields': ('subject', 'message', 'car')
        }),
        ('Status', {
            'fields': ('status',)
        }),
        ('Metadata', {
            'fields': ('ip_address', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def has_add_permission(self, request):
        """Disable adding messages through admin (only via API)."""
        return False
