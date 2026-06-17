package com.example.shopping.controller;

import com.example.shopping.model.CartItem;
import com.example.shopping.service.CartService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/cart")
@CrossOrigin(origins = "*")
public class CartController {

    @Autowired
    private CartService cartService;

    @GetMapping
    public List<CartItem> getCartItems(@RequestParam Long userId) {
        return cartService.getCartItems(userId);
    }

    @PostMapping
    public CartItem addToCart(@RequestParam Long userId, @RequestParam Long productId, @RequestParam Integer quantity) {
        return cartService.addToCart(userId, productId, quantity);
    }

    @PutMapping("/{id}")
    public CartItem updateCartItemQuantity(@PathVariable Long id, @RequestParam Integer quantity) {
        return cartService.updateCartItemQuantity(id, quantity);
    }

    @DeleteMapping("/{id}")
    public void removeFromCart(@PathVariable Long id) {
        cartService.removeFromCart(id);
    }

    @DeleteMapping
    public void clearCart(@RequestParam Long userId) {
        cartService.clearCart(userId);
    }
}
