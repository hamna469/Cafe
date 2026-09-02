from django.db import transaction
from rest_framework.response import Response
from rest_framework.decorators import api_view
from .models import MenuItem, Order, Review
from .serializers import MenuItemSerializer, OrderSerializer, ReviewSerializer


# =========================
# MENU
# =========================
@api_view(['GET'])
def get_menu(request):
    items = MenuItem.objects.all()
    serializer = MenuItemSerializer(items, many=True)
    return Response(serializer.data)


# =========================
# CREATE ORDER (FIXED)
# =========================
@api_view(['POST'])
def create_order(request):
    serializer = OrderSerializer(data=request.data)

    if serializer.is_valid():
        try:
            with transaction.atomic():
                serializer.save()
            return Response(serializer.data, status=201)
        except Exception as e:
            return Response({"error": str(e)}, status=500)

    return Response(serializer.errors, status=400)


# =========================
# REVIEWS (FIXED)
# =========================
@api_view(['GET', 'POST'])
def reviews(request):

    if request.method == 'GET':
        data = Review.objects.all().order_by('-created_at')
        serializer = ReviewSerializer(data, many=True)
        return Response(serializer.data)

    if request.method == 'POST':
        serializer = ReviewSerializer(data=request.data)

        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=201)

        return Response(serializer.errors, status=400)


# =========================
# ORDERS
# =========================
@api_view(['GET'])
def get_orders(request):
    orders = Order.objects.all().order_by('-created_at')
    serializer = OrderSerializer(orders, many=True)
    return Response(serializer.data)