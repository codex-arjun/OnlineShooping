package com.example.shopping.repository;

import com.example.shopping.model.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {
    List<Product> findByGender(String gender);
    List<Product> findByCategoryId(Long categoryId);
    List<Product> findByGenderAndCategoryId(String gender, Long categoryId);
}
