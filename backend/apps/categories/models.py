from django.db import models

class Category(models.Model):
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True)
    parent = models.ForeignKey('self', on_delete=models.CASCADE, null=True, blank=True, related_name='children')
    image_url = models.URLField(blank=True, null=True)
    is_active = models.BooleanField(default=True)
    sort_order = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['sort_order', 'name']
        verbose_name_plural = 'Categories'
    
    def __str__(self):
        return self.name
    
    @property
    def full_path(self):
        """Return the full category path (e.g., 'Electronics > Phones > Smartphones')"""
        if self.parent:
            return f"{self.parent.full_path} > {self.name}"
        return self.name

class CategoryParameter(models.Model):
    PARAMETER_TYPES = [
        ('text', 'Text'),
        ('number', 'Number'),
        ('boolean', 'Boolean'),
        ('choice', 'Choice'),
        ('multichoice', 'Multiple Choice'),
    ]
    
    category = models.ForeignKey(Category, on_delete=models.CASCADE, related_name='parameters')
    name = models.CharField(max_length=100)
    parameter_type = models.CharField(max_length=20, choices=PARAMETER_TYPES)
    is_required = models.BooleanField(default=False)
    choices = models.TextField(blank=True, help_text="For choice types, enter options separated by newlines")
    sort_order = models.PositiveIntegerField(default=0)
    
    class Meta:
        ordering = ['sort_order', 'name']
    
    def __str__(self):
        return f"{self.category.name} - {self.name}"
    
    @property
    def choice_list(self):
        """Return choices as a list for choice parameters"""
        if self.parameter_type in ['choice', 'multichoice'] and self.choices:
            return [choice.strip() for choice in self.choices.split('\n') if choice.strip()]
        return []
