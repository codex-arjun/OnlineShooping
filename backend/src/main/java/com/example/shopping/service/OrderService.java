package com.example.shopping.service;

import com.example.shopping.model.*;
import com.example.shopping.repository.CartItemRepository;
import com.example.shopping.repository.OrderRepository;
import com.example.shopping.repository.ProductRepository;
import com.example.shopping.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class OrderService {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private CartItemRepository cartItemRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private UserRepository userRepository;

    public List<Order> getOrdersByUserId(Long userId) {
        return orderRepository.findByUserId(userId);
    }

    public List<Order> getAllOrders() {
        return orderRepository.findAll();
    }

    @Transactional
    public Order checkout(Long userId, String customerName, String customerEmail, String address, String city, String zipCode, String paymentMethod, String creditCardType) {
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty()) {
            throw new IllegalArgumentException("User not found");
        }
        User user = userOpt.get();

        List<CartItem> cartItems = cartItemRepository.findByUserId(userId);
        if (cartItems.isEmpty()) {
            throw new IllegalStateException("Cart is empty");
        }

        double originalPriceTotal = 0;
        Order order = new Order(
                customerName,
                customerEmail,
                address,
                city,
                zipCode,
                0.0, // Final price
                0.0, // Original price
                0.0, // Discount amount
                paymentMethod,
                creditCardType,
                LocalDateTime.now(),
                user
        );

        for (CartItem cartItem : cartItems) {
            Product product = cartItem.getProduct();
            if (product.getStock() < cartItem.getQuantity()) {
                throw new IllegalStateException("Insufficient stock for product: " + product.getName());
            }

            // Deduct stock
            product.setStock(product.getStock() - cartItem.getQuantity());
            productRepository.save(product);

            double price = product.getPrice();
            originalPriceTotal += price * cartItem.getQuantity();

            OrderItem orderItem = new OrderItem(product, cartItem.getQuantity(), price);
            order.addOrderItem(orderItem);
        }

        // Calculate card discount only if paymentMethod is 'Card'
        double discountRate = 0.0;
        if ("Card".equalsIgnoreCase(paymentMethod) && creditCardType != null) {
            String cardTypeUpper = creditCardType.toUpperCase();
            if (cardTypeUpper.contains("VISA")) {
                discountRate = 0.10; // 10% Off
            } else if (cardTypeUpper.contains("MASTERCARD")) {
                discountRate = 0.15; // 15% Off
            } else if (cardTypeUpper.contains("AMEX") || cardTypeUpper.contains("AMERICAN EXPRESS")) {
                discountRate = 0.20; // 20% Off
            }
        }

        double discountAmount = originalPriceTotal * discountRate;
        double finalPrice = originalPriceTotal - discountAmount;

        order.setOriginalPrice(originalPriceTotal);
        order.setDiscountAmount(discountAmount);
        order.setTotalPrice(finalPrice); // totalPrice is the final discounted price

        Order savedOrder = orderRepository.save(order);

        // Clear cart for this specific user
        cartItemRepository.deleteAll(cartItems);

        return savedOrder;
    }
}
