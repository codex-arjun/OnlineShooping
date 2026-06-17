package com.example.shopping.service;

import com.example.shopping.model.Category;
import com.example.shopping.model.Product;
import com.example.shopping.repository.CategoryRepository;
import com.example.shopping.repository.ProductRepository;
import com.example.shopping.repository.CartItemRepository;
import com.example.shopping.repository.OrderRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import jakarta.annotation.PostConstruct;
import java.util.List;
import java.util.Optional;

@Service
public class ProductService {

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private CartItemRepository cartItemRepository;

    @Autowired
    private OrderRepository orderRepository;

    // Categories
    public List<Category> getAllCategories() {
        return categoryRepository.findAll();
    }

    public Category createCategory(Category category) {
        return categoryRepository.save(category);
    }

    // Products CRUD
    public List<Product> getAllProducts() {
        return productRepository.findAll();
    }

    public Optional<Product> getProductById(Long id) {
        return productRepository.findById(id);
    }

    public List<Product> getProductsByGender(String gender) {
        return productRepository.findByGender(gender);
    }

    public List<Product> getProductsByCategory(Long categoryId) {
        return productRepository.findByCategoryId(categoryId);
    }

    public List<Product> getProductsByGenderAndCategory(String gender, Long categoryId) {
        return productRepository.findByGenderAndCategoryId(gender, categoryId);
    }

    public Product saveProduct(Product product) {
        return productRepository.save(product);
    }

    public void deleteProduct(Long id) {
        productRepository.deleteById(id);
    }

    @PostConstruct
    public void populateSampleData() {
        if (categoryRepository.count() == 0 || productRepository.count() < 18) {
            // Start clean to ensure all expanded items load correctly
            cartItemRepository.deleteAll();
            orderRepository.deleteAll();
            productRepository.deleteAll();
            categoryRepository.deleteAll();

            Category shirts = categoryRepository.save(new Category("Shirts"));
            Category pants = categoryRepository.save(new Category("Pants"));
            Category dresses = categoryRepository.save(new Category("Dresses"));
            Category jackets = categoryRepository.save(new Category("Jackets"));

            // Men's Products (8 items)
            productRepository.save(new Product(
                    "Classic Men's Oxford Shirt",
                    "A premium cotton oxford button-down shirt, perfect for formal and casual wear.",
                    49.99,
                    "Male",
                    "M",
                    "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&q=80&w=400",
                    50,
                    shirts
            ));
            productRepository.save(new Product(
                    "Slim-Fit Men's Denim Jeans",
                    "Classic blue slim-fit denim jeans with subtle stretch for comfort.",
                    59.99,
                    "Male",
                    "L",
                    "https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&q=80&w=400",
                    40,
                    pants
            ));
            productRepository.save(new Product(
                    "Men's Casual Bomber Jacket",
                    "Water-resistant bomber jacket in olive green with ribbed cuffs and collar.",
                    79.99,
                    "Male",
                    "XL",
                    "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&q=80&w=400",
                    25,
                    jackets
            ));
            productRepository.save(new Product(
                    "Men's Premium Linen Shirt",
                    "Lightweight, breathable 100% linen shirt ideal for warm weather.",
                    45.00,
                    "Male",
                    "M",
                    "https://images.unsplash.com/photo-1620012253295-c05518e99309?auto=format&fit=crop&q=80&w=400",
                    30,
                    shirts
            ));
            productRepository.save(new Product(
                    "Men's Cotton Chino Shorts",
                    "Comfortable knee-length chino shorts in navy blue with a relaxed fit.",
                    34.99,
                    "Male",
                    "L",
                    "https://images.unsplash.com/photo-1591195853828-11db59a44f6b?auto=format&fit=crop&q=80&w=400",
                    35,
                    pants
            ));
            productRepository.save(new Product(
                    "Men's Cable Knit Sweater",
                    "Cozy heavy-weight cable-knit crewneck sweater in charcoal gray.",
                    64.99,
                    "Male",
                    "L",
                    "https://images.unsplash.com/photo-1614975058789-41316d0e2e9c?auto=format&fit=crop&q=80&w=400",
                    20,
                    jackets
            ));
            productRepository.save(new Product(
                    "Men's Smart Comfort Blazer",
                    "Unstructured navy blazer offering structured looks with cardigan-like stretch.",
                    120.00,
                    "Male",
                    "M",
                    "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&q=80&w=400",
                    15,
                    jackets
            ));
            productRepository.save(new Product(
                    "Men's Graphic Print Tee",
                    "Casual soft cotton graphic print t-shirt featuring modern abstract art.",
                    24.99,
                    "Male",
                    "M",
                    "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&q=80&w=400",
                    60,
                    shirts
            ));

            // Women's Products (8 items)
            productRepository.save(new Product(
                    "Women's Floral Summer Dress",
                    "Flowy A-line summer dress featuring a beautiful floral print and waist-tie.",
                    69.99,
                    "Female",
                    "S",
                    "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&q=80&w=400",
                    35,
                    dresses
            ));
            productRepository.save(new Product(
                    "Women's High-Rise Skinny Pants",
                    "Stretch skinny trousers suitable for work and smart-casual outings.",
                    49.99,
                    "Female",
                    "M",
                    "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&q=80&w=400",
                    45,
                    pants
            ));
            productRepository.save(new Product(
                    "Women's Oversized Leather Jacket",
                    "Stylish faux leather jacket with metal hardware and belt detail.",
                    99.99,
                    "Female",
                    "S",
                    "https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&q=80&w=400",
                    15,
                    jackets
            ));
            productRepository.save(new Product(
                    "Women's Elegant Silk Blouse",
                    "Luxurious silk blouse in champagne white with a sophisticated drape.",
                    89.99,
                    "Female",
                    "M",
                    "https://images.unsplash.com/photo-1548624149-f7b316688538?auto=format&fit=crop&q=80&w=400",
                    20,
                    shirts
            ));
            productRepository.save(new Product(
                    "Women's Satin Evening Gown",
                    "Stunning floor-length satin evening gown in emerald green.",
                    149.99,
                    "Female",
                    "M",
                    "https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&q=80&w=400",
                    10,
                    dresses
            ));
            productRepository.save(new Product(
                    "Women's Pleated Midi Skirt",
                    "Lightweight pleated midi skirt with an elastic waistband in soft blush pink.",
                    39.99,
                    "Female",
                    "S",
                    "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&q=80&w=400",
                    25,
                    pants
            ));
            productRepository.save(new Product(
                    "Women's Classic Denim Jacket",
                    "Vintage wash button-up denim jacket with two chest pockets.",
                    59.99,
                    "Female",
                    "M",
                    "https://images.unsplash.com/photo-1576995853123-5a10305d93c0?auto=format&fit=crop&q=80&w=400",
                    30,
                    jackets
            ));
            productRepository.save(new Product(
                    "Women's Cozy Knit Sweater",
                    "Oversized chunky knit pullover sweater in warm cream beige.",
                    54.99,
                    "Female",
                    "S",
                    "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&q=80&w=400",
                    40,
                    jackets
            ));

            // Unisex Products (3 items)
            productRepository.save(new Product(
                    "Unisex Cozy Fleece Hoodie",
                    "A relaxed-fit fleece hoodie featuring a double-lined hood and spacious kangaroo pocket.",
                    59.99,
                    "Unisex",
                    "L",
                    "https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&q=80&w=400",
                    30,
                    jackets
            ));
            productRepository.save(new Product(
                    "Unisex Knit Winter Beanie",
                    "A warm, rib-knit winter beanie hat, designed for optimal comfort and stretch.",
                    19.99,
                    "Unisex",
                    "S",
                    "https://images.unsplash.com/photo-1576871337622-98d48d4aa53e?auto=format&fit=crop&q=80&w=400",
                    50,
                    jackets
            ));
            productRepository.save(new Product(
                    "Unisex Graphic Canvas Tote Bag",
                    "Eco-friendly heavyweight cotton canvas tote bag with a minimalist line art print.",
                    14.99,
                    "Unisex",
                    "M",
                    "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&q=80&w=400",
                    40,
                    shirts
            ));
        }
    }
}
