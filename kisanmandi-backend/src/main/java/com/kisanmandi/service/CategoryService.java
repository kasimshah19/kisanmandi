package com.kisanmandi.service;

import com.kisanmandi.dto.CategoryRequest;
import com.kisanmandi.dto.CategoryResponse;
import com.kisanmandi.entity.Category;
import com.kisanmandi.exception.ResourceNotFoundException;
import com.kisanmandi.repository.CategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CategoryService {

    private final CategoryRepository categoryRepository;

    @Transactional(readOnly = true)
    public List<CategoryResponse> getActiveCategories() {
        return categoryRepository.findByActiveTrue().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<CategoryResponse> getAllCategories() {
        return categoryRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public CategoryResponse createCategory(CategoryRequest request) {
        if (categoryRepository.existsByNameIgnoreCase(request.getName().trim())) {
            throw new DataIntegrityViolationException("Category already exists");
        }
        Category category = Category.builder()
                .name(request.getName().trim())
                .active(true)
                .build();
        return mapToResponse(categoryRepository.save(category));
    }

    @Transactional
    public CategoryResponse updateCategory(Long id, CategoryRequest request) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found"));
        
        String newName = request.getName().trim();
        if (!category.getName().equalsIgnoreCase(newName) && categoryRepository.existsByNameIgnoreCase(newName)) {
             throw new DataIntegrityViolationException("Category already exists");
        }
        
        category.setName(newName);
        return mapToResponse(categoryRepository.save(category));
    }

    @Transactional
    public CategoryResponse setCategoryStatus(Long id, boolean active) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found"));
        category.setActive(active);
        return mapToResponse(categoryRepository.save(category));
    }

    private CategoryResponse mapToResponse(Category category) {
        return CategoryResponse.builder()
                .id(category.getId())
                .name(category.getName())
                .active(category.isActive())
                .build();
    }
}
