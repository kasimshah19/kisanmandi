package com.kisanmandi.service;

import com.kisanmandi.dto.*;
import com.kisanmandi.entity.ApprovalStatus;
import com.kisanmandi.entity.Category;
import com.kisanmandi.entity.Product;
import com.kisanmandi.entity.User;
import com.kisanmandi.exception.FarmerNotApprovedException;
import com.kisanmandi.exception.ResourceNotFoundException;
import com.kisanmandi.repository.CategoryRepository;
import com.kisanmandi.repository.FarmerProfileRepository;
import com.kisanmandi.repository.ProductRepository;
import com.kisanmandi.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final UserRepository userRepository;
    private final FarmerProfileRepository farmerProfileRepository;
    private final CloudinaryService cloudinaryService;

    @Transactional
    public ProductResponse createProduct(Long farmerId, ProductRequest request, MultipartFile image) {
        checkFarmerApproved(farmerId);

        User farmer = userRepository.findById(farmerId)
                .orElseThrow(() -> new ResourceNotFoundException("Farmer not found"));

        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category not found"));

        if (!category.isActive()) {
            throw new IllegalArgumentException("Selected category is disabled");
        }

        Product product = Product.builder()
                .farmer(farmer)
                .category(category)
                .name(request.getName().trim())
                .description(request.getDescription() != null ? request.getDescription().trim() : null)
                .pricePerUnit(request.getPricePerUnit())
                .unit(request.getUnit())
                .quantityAvailable(request.getQuantityAvailable())
                .active(true)
                .deleted(false)
                .build();

        if (image != null && !image.isEmpty()) {
            Map<String, Object> uploadResult = cloudinaryService.uploadProductImage(image);
            product.setImageUrl((String) uploadResult.get("secure_url"));
            product.setImagePublicId((String) uploadResult.get("public_id"));
        }

        return mapToResponse(productRepository.save(product));
    }

    @Transactional
    public ProductResponse updateProduct(Long farmerId, Long productId, ProductRequest request, MultipartFile image) {
        checkFarmerApproved(farmerId);
        Product product = getFarmerProduct(farmerId, productId);

        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category not found"));

        if (!category.isActive() && !category.getId().equals(product.getCategory().getId())) {
            throw new IllegalArgumentException("Selected category is disabled");
        }

        product.setCategory(category);
        product.setName(request.getName().trim());
        product.setDescription(request.getDescription() != null ? request.getDescription().trim() : null);
        product.setPricePerUnit(request.getPricePerUnit());
        product.setUnit(request.getUnit());
        product.setQuantityAvailable(request.getQuantityAvailable());

        if (image != null && !image.isEmpty()) {
            Map<String, Object> uploadResult = cloudinaryService.uploadProductImage(image);
            
            // Delete old image
            if (product.getImagePublicId() != null) {
                cloudinaryService.delete(product.getImagePublicId(), "image");
            }
            
            product.setImageUrl((String) uploadResult.get("secure_url"));
            product.setImagePublicId((String) uploadResult.get("public_id"));
        }

        return mapToResponse(productRepository.save(product));
    }

    @Transactional
    public ProductResponse updateStock(Long farmerId, Long productId, StockUpdateRequest request) {
        checkFarmerApproved(farmerId);
        Product product = getFarmerProduct(farmerId, productId);
        product.setQuantityAvailable(request.getQuantityAvailable());
        return mapToResponse(productRepository.save(product));
    }

    @Transactional
    public ProductResponse updateStatus(Long farmerId, Long productId, ProductStatusRequest request) {
        checkFarmerApproved(farmerId);
        Product product = getFarmerProduct(farmerId, productId);
        product.setActive(request.getActive());
        return mapToResponse(productRepository.save(product));
    }

    @Transactional
    public void softDelete(Long farmerId, Long productId) {
        checkFarmerApproved(farmerId);
        Product product = getFarmerProduct(farmerId, productId);
        product.setDeleted(true);
        product.setActive(false);
        productRepository.save(product);
    }

    @Transactional(readOnly = true)
    public List<ProductResponse> getMyProducts(Long farmerId) {
        return productRepository.findByFarmerIdAndDeletedFalse(farmerId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public PageResponse<ProductResponse> searchPublicProducts(Long categoryId, String q, String district, String pincode, String sort, int page, int size) {
        if (size > 50) size = 50;

        Sort.Direction direction = Sort.Direction.DESC;
        String sortBy = "createdAt";
        if ("priceAsc".equalsIgnoreCase(sort)) {
            direction = Sort.Direction.ASC;
            sortBy = "pricePerUnit";
        } else if ("priceDesc".equalsIgnoreCase(sort)) {
            direction = Sort.Direction.DESC;
            sortBy = "pricePerUnit";
        }

        Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sortBy));
        Page<Product> productPage = productRepository.searchPublicProducts(categoryId, q, district, pincode, pageable);
        
        List<ProductResponse> content = productPage.getContent().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
                
        return PageResponse.<ProductResponse>builder()
                .content(content)
                .page(productPage.getNumber())
                .size(productPage.getSize())
                .totalElements(productPage.getTotalElements())
                .totalPages(productPage.getTotalPages())
                .build();
    }

    @Transactional(readOnly = true)
    public ProductResponse getPublicProduct(Long id) {
        Product product = productRepository.findPublicById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));
        return mapToResponse(product);
    }

    private Product getFarmerProduct(Long farmerId, Long productId) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));
        if (!product.getFarmer().getId().equals(farmerId)) {
            throw new ResourceNotFoundException("Product not found or access denied");
        }
        if (product.isDeleted()) {
            throw new ResourceNotFoundException("Product not found");
        }
        return product;
    }

    private void checkFarmerApproved(Long farmerId) {
        boolean isApproved = farmerProfileRepository.existsByUserIdAndApprovalStatus(farmerId, ApprovalStatus.APPROVED);
        if (!isApproved) {
            throw new FarmerNotApprovedException("Your farmer profile is not approved yet");
        }
    }

    private ProductResponse mapToResponse(Product product) {
        // Needs a fetch join or lazy loading within transaction. Here we rely on Hibernate loading the lazy fields.
        var profileOpt = farmerProfileRepository.findByUserId(product.getFarmer().getId());
        
        return ProductResponse.builder()
                .id(product.getId())
                .name(product.getName())
                .description(product.getDescription())
                .categoryId(product.getCategory().getId())
                .categoryName(product.getCategory().getName())
                .pricePerUnit(product.getPricePerUnit())
                .unit(product.getUnit())
                .quantityAvailable(product.getQuantityAvailable())
                .imageUrl(product.getImageUrl())
                .active(product.isActive())
                .createdAt(product.getCreatedAt())
                .farmerId(product.getFarmer().getId())
                .farmerName(product.getFarmer().getName())
                .farmName(profileOpt.map(p -> p.getFarmName()).orElse(null))
                .village(profileOpt.map(p -> p.getVillage()).orElse(null))
                .district(profileOpt.map(p -> p.getDistrict()).orElse(null))
                .build();
    }
}
