from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.contrib.auth.models import User


# Unregister the default User admin
admin.site.unregister(User)


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    """Custom User admin with bulk delete safety."""
    
    actions = ['delete_selected']
    
    def delete_selected(self, request, queryset):
        """Custom delete action with safety check."""
        # Get total user count
        total_users = User.objects.count()
        selected_count = queryset.count()
        
        # Safety check: ensure at least one user remains
        if selected_count >= total_users:
            self.message_user(
                request, 
                'Cannot delete all users! At least one user must remain in the system.',
                level='error'
            )
            return
        
        if total_users - selected_count < 1:
            self.message_user(
                request, 
                'Cannot delete selected users! At least one user must remain in the system.',
                level='error'
            )
            return
        
        # Proceed with deletion
        deleted_count = queryset.count()
        queryset.delete()
        self.message_user(request, f'Successfully deleted {deleted_count} user(s).')
    
    delete_selected.short_description = "Delete selected users"
