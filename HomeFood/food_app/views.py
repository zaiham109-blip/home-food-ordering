from rest_framework import generics, status
from .models import FoodItem, Order, User  # Nimeongeza User hapa
from .serializers import FoodItemSerializer, OrderSerializer
from rest_framework.authtoken.views import ObtainAuthToken
from rest_framework.authtoken.models import Token
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from django.db.models import Count, Max, Q
from django.shortcuts import get_object_or_404

# 1. ADDED: Hii ni kwa ajili ya SIGNUP (Ili iondoe ile Network Error)
@api_view(['POST'])
@permission_classes([AllowAny])
def register_user(request):
    data = request.data
    try:
        # Tunatengeneza User mpya
        user = User.objects.create_user(
            username=data['username'],
            password=data['password'],
            email=data.get('email', '')
        )
        # Tunahifadhi namba ya simu na kumfanya kuwa Customer
        user.phone = data.get('phone', '')
        user.is_customer = True
        user.delivery_request_pending = bool(data.get('request_delivery', False))
        user.save()
        return Response({"message": "User created successfully"}, status=status.HTTP_201_CREATED)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

# 2. EXISTING: Kodi yako ya vyakula
class FoodListCreateAPIView(generics.ListCreateAPIView):
    queryset = FoodItem.objects.all()
    serializer_class = FoodItemSerializer

class FoodRetrieveUpdateDestroyAPIView(generics.RetrieveUpdateDestroyAPIView):
    queryset = FoodItem.objects.all()
    serializer_class = FoodItemSerializer

# 3. EXISTING: Kodi yako ya Oda
class OrderListCreateAPIView(generics.ListCreateAPIView):
    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        base_qs = (
            Order.objects.select_related('customer', 'delivery_person')
            .prefetch_related('items')
            .order_by('-created_at')
        )
        if user.is_superuser or user.is_staff:
            return base_qs
        if user.is_delivery_person:
            return base_qs.filter(delivery_person=user, status__in=['Approved', 'Ready', 'Delivering'])
        return base_qs.filter(customer=user)

    def perform_create(self, serializer):
        user = self.request.user
        if user.is_superuser or user.is_staff:
            customer_id = self.request.data.get('customer_id')
            customer = User.objects.filter(id=customer_id).first() if customer_id else user
            serializer.save(customer=customer)
            return

        serializer.save(customer=user)

    def create(self, request, *args, **kwargs):
        response = super().create(request, *args, **kwargs)
        if response.status_code == status.HTTP_201_CREATED:
            response.data = {
                'message': 'Order yako imepokelewa kikamilifu.',
                'order': response.data,
            }
        return response


class OrderRetrieveUpdateDestroyAPIView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        base_qs = Order.objects.select_related('customer', 'delivery_person').prefetch_related('items')
        if user.is_superuser or user.is_staff:
            return base_qs
        if user.is_delivery_person:
            return base_qs.filter(delivery_person=user, status__in=['Approved', 'Ready', 'Delivering', 'Delivered'])
        return base_qs.filter(customer=user)

    def patch(self, request, *args, **kwargs):
        user = request.user
        order = self.get_object()
        incoming_status = request.data.get('status')

        if user.is_superuser or user.is_staff:
            return self.partial_update(request, *args, **kwargs)

        if user.is_delivery_person:
            if set(request.data.keys()) - {'status'}:
                return Response({'detail': 'Delivery person can only update status.'}, status=status.HTTP_403_FORBIDDEN)
            delivery_allowed_statuses = {'Ready', 'Delivering', 'Delivered'}
            if incoming_status and incoming_status not in delivery_allowed_statuses:
                return Response({'detail': 'Delivery person cannot set this status.'}, status=status.HTTP_403_FORBIDDEN)
            return self.partial_update(request, *args, **kwargs)

        if user == order.customer:
            if set(request.data.keys()) != {'status'}:
                return Response({'detail': 'Customer can only update status.'}, status=status.HTTP_403_FORBIDDEN)
            if incoming_status == 'Received' and order.status == 'Delivered':
                return self.partial_update(request, *args, **kwargs)
            return Response({'detail': 'Customer can only confirm delivered order as received.'}, status=status.HTTP_403_FORBIDDEN)

        return Response({'detail': 'Unauthorized action.'}, status=status.HTTP_403_FORBIDDEN)

        return Response({'detail': 'Unauthorized action.'}, status=status.HTTP_403_FORBIDDEN)

    def delete(self, request, *args, **kwargs):
        if not (request.user.is_superuser or request.user.is_staff):
            return Response({'detail': 'Only admin can delete orders.'}, status=status.HTTP_403_FORBIDDEN)
        return self.destroy(request, *args, **kwargs)


class DeliveryPersonListAPIView(generics.ListAPIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        if not (request.user.is_superuser or request.user.is_staff):
            return Response({'detail': 'Unauthorized action.'}, status=status.HTTP_403_FORBIDDEN)
        users = User.objects.filter(is_delivery_person=True).values('id', 'username', 'phone', 'email')
        return Response(list(users))


class AdminUserActivityListAPIView(generics.ListAPIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        if not (request.user.is_superuser or request.user.is_staff):
            return Response({'detail': 'Unauthorized action.'}, status=status.HTTP_403_FORBIDDEN)

        users = (
            User.objects.all()
            .annotate(
                total_orders=Count('orders', distinct=True),
                pending_orders=Count('orders', filter=Q(orders__status='Pending'), distinct=True),
                delivered_orders=Count('orders', filter=Q(orders__status='Delivered'), distinct=True),
                last_order_at=Max('orders__created_at'),
            )
            .values(
                'id',
                'username',
                'email',
                'phone',
                'is_staff',
                'is_superuser',
                'is_delivery_person',
                'is_customer',
                'delivery_request_pending',
                'total_orders',
                'pending_orders',
                'delivered_orders',
                'last_order_at',
            )
            .order_by('-date_joined')
        )
        return Response(list(users))


class AdminUserRoleUpdateAPIView(generics.GenericAPIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, *args, **kwargs):
        if not (request.user.is_superuser or request.user.is_staff):
            return Response({'detail': 'Unauthorized action.'}, status=status.HTTP_403_FORBIDDEN)

        user = get_object_or_404(User, id=kwargs.get('pk'))
        if user.is_superuser or user.is_staff:
            return Response({'detail': 'Cannot change admin role here.'}, status=status.HTTP_400_BAD_REQUEST)

        make_delivery = bool(request.data.get('make_delivery', True))
        if make_delivery:
            user.is_delivery_person = True
            user.is_customer = False
            user.delivery_request_pending = False
            message = 'User amepewa role ya delivery person.'
        else:
            user.is_delivery_person = False
            user.is_customer = True
            user.delivery_request_pending = False
            message = 'User amerudishwa kuwa customer.'

        user.save(update_fields=['is_delivery_person', 'is_customer', 'delivery_request_pending'])
        return Response({
            'message': message,
            'user': {
                'id': user.id,
                'username': user.username,
                'is_customer': user.is_customer,
                'is_delivery_person': user.is_delivery_person,
                'delivery_request_pending': user.delivery_request_pending,
            }
        })


class CustomerDeliveryRequestAPIView(generics.GenericAPIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        user = request.user
        if user.is_staff or user.is_superuser:
            return Response({'detail': 'Admin cannot request this role.'}, status=status.HTTP_400_BAD_REQUEST)
        if user.is_delivery_person:
            return Response({'detail': 'You are already a delivery person.'}, status=status.HTTP_400_BAD_REQUEST)
        if user.delivery_request_pending:
            return Response({'detail': 'Request already pending approval.'}, status=status.HTTP_400_BAD_REQUEST)

        user.delivery_request_pending = True
        user.save(update_fields=['delivery_request_pending'])
        return Response({'message': 'Ombi lako la kuwa delivery person limetumwa kwa admin.'})

# 4. IMPROVED: Login inayotuma Role kwenda React
class CustomAuthToken(ObtainAuthToken):
    def post(self, request, *args, **kwargs):
        serializer = self.serializer_class(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data['user']
        token, created = Token.objects.get_or_create(user=user)
        
        # Tunatafuta Role ya mtumiaji
        role = 'customer'
        if user.is_superuser or user.is_staff:
            role = 'admin'
        elif user.is_delivery_person:
            role = 'delivery'
        
        return Response({
            'token': token.key,
            'user_id': user.pk,
            'username': user.username,
            'email': user.email,
            'phone': user.phone,
            'is_customer': user.is_customer,
            'is_delivery_person': user.is_delivery_person,
            'delivery_request_pending': user.delivery_request_pending,
            'role': role  # React itatumia hii kumpeleka dashboard sahihi
        })
