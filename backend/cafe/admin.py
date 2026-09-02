from django.contrib import admin
from .models import MenuItem, Customer, Order, OrderItem, Review


class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0
    raw_id_fields = ['menu_item']


@admin.register(Customer)
class CustomerAdmin(admin.ModelAdmin):
    list_display = ['name', 'phone', 'email', 'city', 'postal_code']
    search_fields = ['name', 'phone', 'email', 'city']
    list_filter = ['city']


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ['id', 'customer', 'total_price', 'status', 'created_at']
    list_editable = ['status']
    list_filter = ['status', 'created_at', 'customer__city']
    search_fields = ['id', 'customer__name', 'customer__phone', 'customer__email']
    inlines = [OrderItemInline]
    date_hierarchy = 'created_at'


@admin.register(MenuItem)
class MenuItemAdmin(admin.ModelAdmin):
    list_display = ['name', 'category', 'price']
    list_filter = ['category']
    search_fields = ['name', 'description']


@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display = ['name', 'rating', 'comment', 'created_at']
    list_filter = ['rating', 'created_at']
    search_fields = ['name', 'comment']