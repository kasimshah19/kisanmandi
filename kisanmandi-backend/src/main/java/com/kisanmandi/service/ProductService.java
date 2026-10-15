package com.kisanmandi.service;

import com.kisanmandi.dto.PageResponse;
import com.kisanmandi.dto.ProductRequest;
import com.kisanmandi.dto.ProductResponse;
import com.kisanmandi.dto.ProductStatusRequest;
import com.kisanmandi.dto.StockUpdateRequest;
import com.kisanmandi.entity.ApprovalStatus;
import com.kisanmandi.entity.Category;
import com.kisanmandi.entity.FarmerProfile;
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
import java.math.BigDecimal;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final UserRepository userRepository;
    private final FarmerProfileRepository farmerProfileRepository;
    private final CloudinaryService cloudinaryService;
    private final NearbyService nearbyService;

    @Transactional(readOnly = true)
    public ProductResponse getMyProduct(Long farmerId, Long productId) {
        Product product = getFarmerProduct(farmerId, productId);
        return mapToResponse(product);
    }

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
    public PageResponse<ProductResponse> searchPublicProducts(Long categoryId, Long farmerId, String q, String district, String pincode, String sort, int page, int size) {
        return searchPublicProducts(categoryId, farmerId, q, district, pincode, sort, null, null, null, page, size);
    }

    @Transactional(readOnly = true)
    public PageResponse<ProductResponse> searchPublicProducts(Long categoryId, Long farmerId, String q, String district, String pincode, String sort, Double latitude, Double longitude, Double radius, int page, int size) {
        if (size > 50) size = 50;

        Map<Long, Double> farmerDistanceMap = new java.util.HashMap<>();
        if (latitude != null && longitude != null) {
            try {
                double rad = (radius != null && radius > 0) ? Math.min(radius, 100.0) : 25.0;
                var nearbyFarmers = nearbyService.findNearbyFarmers(latitude, longitude, rad);
                for (var nf : nearbyFarmers) {
                    if (nf.getFarmer() != null && nf.getFarmer().getId() != null) {
                        farmerDistanceMap.put(nf.getFarmer().getId(), nf.getDistanceKm());
                    }
                }
                if (farmerDistanceMap.isEmpty()) {
                    return PageResponse.<ProductResponse>builder()
                            .content(java.util.Collections.emptyList())
                            .page(page)
                            .size(size)
                            .totalElements(0)
                            .totalPages(0)
                            .build();
                }
            } catch (Exception e) {
                // Fallback to standard search if location error
            }
        }

        Sort finalSort;
        if ("priceAsc".equalsIgnoreCase(sort)) {
            finalSort = Sort.by(Sort.Direction.ASC, "pricePerUnit");
        } else if ("priceDesc".equalsIgnoreCase(sort)) {
            finalSort = Sort.by(Sort.Direction.DESC, "pricePerUnit");
        } else if ("rating".equalsIgnoreCase(sort)) {
            finalSort = Sort.by(Sort.Direction.DESC, "farmer.profile.ratingAvg")
                            .and(Sort.by(Sort.Direction.DESC, "farmer.profile.ratingCount"));
        } else {
            finalSort = Sort.by(Sort.Direction.DESC, "createdAt");
        }

        Pageable pageable = PageRequest.of(page, size, finalSort);
        Page<Product> productPage = productRepository.searchPublicProducts(categoryId, farmerId, q, district, pincode, pageable);
        
        List<ProductResponse> content = productPage.getContent().stream()
                .filter(p -> farmerDistanceMap.isEmpty() || farmerDistanceMap.containsKey(p.getFarmer().getId()))
                .map(this::mapToResponse)
                .peek(pr -> {
                    if (farmerDistanceMap.containsKey(pr.getFarmerId())) {
                        pr.setDistanceKm(farmerDistanceMap.get(pr.getFarmerId()));
                    }
                })
                .collect(Collectors.toList());

        if ("distanceAsc".equalsIgnoreCase(sort)) {
            content.sort(java.util.Comparator.comparing(p -> p.getDistanceKm() != null ? p.getDistanceKm() : Double.MAX_VALUE));
        }
                
        return PageResponse.<ProductResponse>builder()
                .content(content)
                .page(productPage.getNumber())
                .size(productPage.getSize())
                .totalElements(farmerDistanceMap.isEmpty() ? productPage.getTotalElements() : content.size())
                .totalPages(farmerDistanceMap.isEmpty() ? productPage.getTotalPages() : (content.isEmpty() ? 0 : 1))
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
        FarmerProfile profile = null;
        if (product.getFarmer() != null) {
            profile = product.getFarmer().getProfile();
            if (profile == null) {
                profile = farmerProfileRepository.findByUserId(product.getFarmer().getId()).orElse(null);
            }
        }
        
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
                .farmName(profile != null ? profile.getFarmName() : null)
                .village(profile != null ? profile.getVillage() : null)
                .district(profile != null ? profile.getDistrict() : null)
                .farmerRatingAvg(profile != null && profile.getRatingAvg() != null ? profile.getRatingAvg() : BigDecimal.ZERO)
                .farmerRatingCount(profile != null ? profile.getRatingCount() : 0)
                .adminHidden(product.isAdminHidden())
                .adminHiddenReason(product.getAdminHiddenReason())
                .build();
    }
}
