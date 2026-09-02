from rest_framework import serializers
from .models import MenuItem, Customer, Order, OrderItem, Review


class MenuItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = MenuItem
        fields = '__all__'


class CustomerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Customer
        fields = '__all__'


class OrderItemSerializer(serializers.ModelSerializer):
    menu_item = MenuItemSerializer(read_only=True)
    menu_item_id = serializers.PrimaryKeyRelatedField(
        queryset=MenuItem.objects.all(), source='menu_item', write_only=True
    )

    class Meta:
        model = OrderItem
        fields = ['id', 'menu_item', 'menu_item_id', 'quantity', 'price']


class OrderSerializer(serializers.ModelSerializer):
    customer = CustomerSerializer()
    items = OrderItemSerializer(many=True)

    class Meta:
        model = Order
        fields = ['id', 'customer', 'items', 'notes', 'total_price', 'status', 'created_at']

    def create(self, validated_data):
        customer_data = validated_data.pop('customer')
        items_data = validated_data.pop('items')

        # Deduplicate customer: match by email or phone
        email = customer_data.get('email')
        phone = customer_data.get('phone')
        
        customer = None
        if email:
            customer = Customer.objects.filter(email=email).first()
        if not customer and phone:
            customer = Customer.objects.filter(phone=phone).first()

        if customer:
            # Update customer info if changed
            customer.name = customer_data.get('name', customer.name)
            customer.address = customer_data.get('address', customer.address)
            customer.city = customer_data.get('city', customer.city)
            customer.postal_code = customer_data.get('postal_code', customer.postal_code)
            customer.save()
        else:
            customer = Customer.objects.create(**customer_data)

        order = Order.objects.create(customer=customer, **validated_data)

        for item_data in items_data:
            OrderItem.objects.create(order=order, **item_data)

        return order


class ReviewSerializer(serializers.ModelSerializer):
    class Meta:
        model = Review
        fields = '__all__'