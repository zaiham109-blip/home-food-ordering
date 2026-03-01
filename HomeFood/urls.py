"""
URL configuration for HomeFood project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/6.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
"""
URL configuration for HomeFood project.
"""
from django.contrib import admin 
from django.urls import path
from django.conf import settings
from django.conf.urls.static import static

# Nimeongeza register_user hapa kwenye import
from food_app.views import (
    FoodListCreateAPIView,
    FoodRetrieveUpdateDestroyAPIView,
    OrderListCreateAPIView,
    OrderRetrieveUpdateDestroyAPIView,
    DeliveryPersonListAPIView,
    AdminUserActivityListAPIView,
    AdminUserRoleUpdateAPIView,
    CustomerDeliveryRequestAPIView,
    CustomAuthToken,
    register_user,
)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/foods/', FoodListCreateAPIView.as_view(), name='food-list'),
    path('api/foods/<int:pk>/', FoodRetrieveUpdateDestroyAPIView.as_view(), name='food-detail'),
    path('api/orders/', OrderListCreateAPIView.as_view(), name='order-list'),
    path('api/orders/<int:pk>/', OrderRetrieveUpdateDestroyAPIView.as_view(), name='order-detail'),
    path('api/delivery-users/', DeliveryPersonListAPIView.as_view(), name='delivery-users'),
    path('api/admin-users/', AdminUserActivityListAPIView.as_view(), name='admin-users'),
    path('api/admin-users/<int:pk>/role/', AdminUserRoleUpdateAPIView.as_view(), name='admin-user-role'),
    path('api/customer/request-delivery/', CustomerDeliveryRequestAPIView.as_view(), name='customer-request-delivery'),
    path('api/login/', CustomAuthToken.as_view(), name='api-login'),
    
    # HII NDIO MSTARI ULIOKUWA UNAKOSA:
    path('api/register/', register_user, name='api-register'),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
