from django.contrib import admin
from .models import User, FoodItem, Order

# 1. Sajili User kama kawaida
admin.site.register(User)

# 2. Boresha muonekano wa Vyakula (Food Items)
@admin.register(FoodItem)
class FoodItemAdmin(admin.ModelAdmin):
    # Hapa utaona jina na bei moja kwa moja kwenye list
    list_display = ('name', 'price')
    # Unaweza kutafuta chakula kwa jina
    search_fields = ('name',)

# 3. Boresha muonekano wa Oda (Orders) - HAPA NDIPO MUHIMU
@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    # Hapa utaona taarifa muhimu za oda bila kuifungua
    list_display = ('id', 'customer', 'status', 'total_price', 'created_at')
    
    # Inaongeza sehemu ya pembeni ya kuchuja oda (mfano: kuona oda za 'Pending' tu)
    list_filter = ('status', 'created_at')
    
    # Inapanga oda kulingana na muundo ufuatao ili uone Special Requests kwa urahisi
    fieldsets = (
        ('Taarifa za Mteja', {
            'fields': ('customer', 'delivery_person')
        }),
        ('Bidhaa za Menu', {
            'fields': ('items', 'customer_note')
        }),
        ('Oda Maalum (Special Request)', {
            'fields': ('special_request_name', 'special_request_description'),
            'description': 'Hapa ni kama mteja kaagiza kitu ambacho hakipo kwenye menu'
        }),
        ('Hali ya Oda na Malipo', {
            'fields': ('status', 'total_price')
        }),
    )