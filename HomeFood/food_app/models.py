from django.db import models
from django.contrib.auth.models import AbstractUser

class User(AbstractUser):
    is_customer = models.BooleanField(default=False)
    is_delivery_person = models.BooleanField(default=False)
    delivery_request_pending = models.BooleanField(default=False)
    phone = models.CharField(max_length=15, blank=True, null=True)

class FoodItem(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField()
    # Maelezo ya ziada ya bidhaa (specs)
    extra_details = models.TextField(blank=True, null=True)
    # Sehemu ya picha ya chakula/bidhaa
    image = models.ImageField(upload_to='products/', blank=True, null=True)
    price = models.DecimalField(max_digits=10, decimal_places=2)

    def __str__(self):
        return self.name

class Order(models.Model):
    STATUS_CHOICES = (
        ('Pending', 'Pending'),
        ('Approved', 'Approved'),
        ('Rejected', 'Rejected'),
        ('Processing', 'Processing'),
        ('Ready', 'Ready'),
        ('Delivering', 'Delivering'),
        ('Delivered', 'Delivered'),
        ('Received', 'Received'),
    )
    customer = models.ForeignKey(User, on_delete=models.CASCADE, related_name='orders')
    customer_name = models.CharField(max_length=255, blank=True, null=True)
    customer_email = models.EmailField(blank=True, null=True)
    phone = models.CharField(max_length=20, blank=True, null=True)
    address = models.CharField(max_length=255, blank=True, null=True)
    delivery_person = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='deliveries')
    items = models.ManyToManyField(FoodItem, blank=True)
    
    # --- MAENEO MAPYA NILIYOONGEZA KWENYE ORDER ---
    # 1. Maelezo ya ziada ya mteja kwa oda hii (mfano: "Punguza pilipili")
    customer_note = models.TextField(blank=True, null=True)
    
    # 2. Maelezo ya chakula ambacho HAKIPO kwenye menu (Special Request)
    special_request_name = models.CharField(max_length=255, blank=True, null=True)
    special_request_description = models.TextField(blank=True, null=True)
    # ----------------------------------------------

    total_price = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Pending')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Order {self.id} - {self.customer.username}"
