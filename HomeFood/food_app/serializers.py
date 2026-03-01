from decimal import Decimal

from rest_framework import serializers

from .models import FoodItem, Order, User

# Inabadilisha data za chakula kuwa JSON
class FoodItemSerializer(serializers.ModelSerializer):
    # Hii inahakikisha picha inatoka na URL kamili (mfano: http://127.0.0.1:8000/media/...)
    image = serializers.ImageField(required=False)

    class Meta:
        model = FoodItem
        fields = '__all__'

# Inabadilisha data za oda kuwa JSON
class OrderSerializer(serializers.ModelSerializer):
    customer = serializers.CharField(source='customer.username', read_only=True)
    customer_id = serializers.IntegerField(source='customer.id', read_only=True)
    delivery_person_name = serializers.CharField(source='delivery_person.username', read_only=True)
    delivery_person_id = serializers.IntegerField(source='delivery_person.id', read_only=True)
    food = serializers.SerializerMethodField()
    order_type = serializers.SerializerMethodField()
    specialRequest = serializers.CharField(source='customer_note', required=False, allow_blank=True, allow_null=True)
    location = serializers.CharField(source='address', required=False, allow_blank=True, allow_null=True)
    email = serializers.EmailField(source='customer_email', required=False, allow_blank=True, allow_null=True)
    total_price = serializers.DecimalField(max_digits=10, decimal_places=2, required=False)

    class Meta:
        model = Order
        fields = [
            'id',
            'customer',
            'customer_id',
            'customer_name',
            'customer_email',
            'phone',
            'email',
            'location',
            'delivery_person',
            'delivery_person_id',
            'delivery_person_name',
            'items',
            'food',
            'order_type',
            'special_request_name',
            'special_request_description',
            'customer_note',
            'specialRequest',
            'total_price',
            'status',
            'created_at',
        ]
        read_only_fields = ['id', 'created_at', 'customer', 'customer_id', 'food']

    def get_food(self, obj):
        if obj.special_request_name:
            return f"SPECIAL: {obj.special_request_name}"
        item_names = [item.name for item in obj.items.all()]
        return ", ".join(item_names) if item_names else "-"

    def get_order_type(self, obj):
        if obj.special_request_name:
            return "special"
        return "menu"

    def create(self, validated_data):
        incoming_food = str(self.initial_data.get('food', '')).strip()
        incoming_note = self.initial_data.get('specialRequest')
        incoming_name = (
            self.initial_data.get('customer_name')
            or self.initial_data.get('customerName')
            or self.initial_data.get('customer')
            or ''
        )

        selected_items = list(validated_data.pop('items', []))

        if incoming_note is not None and not validated_data.get('customer_note'):
            validated_data['customer_note'] = incoming_note

        if incoming_name and not validated_data.get('customer_name'):
            validated_data['customer_name'] = str(incoming_name).strip()

        if incoming_food:
            if incoming_food.upper().startswith('SPECIAL:'):
                validated_data['special_request_name'] = incoming_food.split(':', 1)[1].strip()
                selected_items = []
            else:
                food_item = FoodItem.objects.filter(name__iexact=incoming_food).first()
                if food_item:
                    selected_items = [food_item]
                else:
                    validated_data['special_request_name'] = incoming_food
                    selected_items = []

        total_price_was_sent = 'total_price' in validated_data
        if not total_price_was_sent:
            validated_data['total_price'] = Decimal('0.00')

        order = Order.objects.create(**validated_data)

        if selected_items:
            order.items.set(selected_items)
            if not total_price_was_sent:
                order.total_price = sum((item.price for item in selected_items), Decimal('0.00'))
                order.save(update_fields=['total_price'])

        return order

# Inabadilisha data za mtumiaji kuwa JSON
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        # Nimesahihisha 'is_delivery_person' hapa ili ifanane na Model yako
        fields = ['id', 'username', 'email', 'is_customer', 'is_delivery_person', 'phone']
