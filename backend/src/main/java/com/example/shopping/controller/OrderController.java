package com.example.shopping.controller;

import com.example.shopping.model.Order;
import com.example.shopping.service.OrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/orders")
@CrossOrigin(origins = "*")
public class OrderController {

    @Autowired
    private OrderService orderService;

    @GetMapping
    public List<Order> getOrders(@RequestParam Long userId) {
        return orderService.getOrdersByUserId(userId);
    }

    @PostMapping("/checkout")
    public ResponseEntity<?> checkout(@RequestBody CheckoutRequest request) {
        try {
            Order order = orderService.checkout(
                    request.getUserId(),
                    request.getCustomerName(),
                    request.getCustomerEmail(),
                    request.getAddress(),
                    request.getCity(),
                    request.getZipCode(),
                    request.getPaymentMethod(),
                    request.getCreditCardType()
            );
            return ResponseEntity.ok(order);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    public static class CheckoutRequest {
        private Long userId;
        private String customerName;
        private String customerEmail;
        private String address;
        private String city;
        private String zipCode;
        private String paymentMethod;
        private String creditCardType;

        // Getters and Setters
        public Long getUserId() { return userId; }
        public void setUserId(Long userId) { this.userId = userId; }
        public String getCustomerName() { return customerName; }
        public void setCustomerName(String customerName) { this.customerName = customerName; }
        public String getCustomerEmail() { return customerEmail; }
        public void setCustomerEmail(String customerEmail) { this.customerEmail = customerEmail; }
        public String getAddress() { return address; }
        public void setAddress(String address) { this.address = address; }
        public String getCity() { return city; }
        public void setCity(String city) { this.city = city; }
        public String getZipCode() { return zipCode; }
        public void setZipCode(String zipCode) { this.zipCode = zipCode; }
        public String getPaymentMethod() { return paymentMethod; }
        public void setPaymentMethod(String paymentMethod) { this.paymentMethod = paymentMethod; }
        public String getCreditCardType() { return creditCardType; }
        public void setCreditCardType(String creditCardType) { this.creditCardType = creditCardType; }
    }
}
