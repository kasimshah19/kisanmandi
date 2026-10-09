package com.kisanmandi.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.kisanmandi.exception.ImageUploadException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

@Service
@SuppressWarnings("unchecked")
public class CloudinaryService {

    @Autowired
    private Cloudinary cloudinary;

    public Map<String, Object> uploadProductImage(MultipartFile file) {
        validateFile(file, true);
        try {
            Map<String, Object> options = new HashMap<>();
            options.put("folder", "kisanmandi/products");
            return cloudinary.uploader().upload(file.getBytes(), options);
        } catch (IOException e) {
            throw new ImageUploadException("Failed to upload product image", e);
        }
    }

    public Map<String, Object> uploadFarmerDocument(MultipartFile file) {
        validateFile(file, false);
        try {
            Map<String, Object> options = new HashMap<>();
            options.put("folder", "kisanmandi/farmer-docs");
            options.put("type", "authenticated"); // Private access
            options.put("resource_type", "auto");
            return cloudinary.uploader().upload(file.getBytes(), options);
        } catch (IOException e) {
            throw new ImageUploadException("Failed to upload farmer document", e);
        }
    }

    public String generateSignedDocumentUrl(String publicId, String resourceType, String format) {
        try {
            // Generate a signed URL that expires in 15 minutes
            long timestamp = (System.currentTimeMillis() / 1000L) + (15 * 60);
            return cloudinary.privateDownload(publicId, format, ObjectUtils.asMap(
                    "resource_type", resourceType,
                    "type", "authenticated",
                    "expires_at", timestamp
            ));
        } catch (Exception e) {
            throw new RuntimeException("Failed to generate document URL", e);
        }
    }

    public void delete(String publicId, String resourceType) {
        if (publicId == null) return;
        try {
            cloudinary.uploader().destroy(publicId, ObjectUtils.asMap("resource_type", resourceType));
        } catch (Exception e) {
            // Best effort, log it but don't crash
            System.err.println("Failed to delete from Cloudinary: " + publicId);
        }
    }

    private void validateFile(MultipartFile file, boolean imageOnly) {
        if (file == null || file.isEmpty()) {
            throw new ImageUploadException("File is empty");
        }
        
        long maxBytes = 5 * 1024 * 1024; // 5 MB
        if (file.getSize() > maxBytes) {
            throw new ImageUploadException("File too large, max 5 MB");
        }

        String contentType = file.getContentType();
        String filename = file.getOriginalFilename();
        if (contentType == null || filename == null) {
            throw new ImageUploadException("Invalid file");
        }

        filename = filename.toLowerCase();
        
        if (imageOnly) {
            if (!contentType.startsWith("image/") || (!filename.endsWith(".jpg") && !filename.endsWith(".jpeg") && !filename.endsWith(".png") && !filename.endsWith(".webp"))) {
                throw new ImageUploadException("Only JPG, PNG and WebP images are allowed");
            }
        } else {
            if (!contentType.startsWith("image/") && !contentType.equals("application/pdf") || 
                (!filename.endsWith(".jpg") && !filename.endsWith(".jpeg") && !filename.endsWith(".png") && !filename.endsWith(".webp") && !filename.endsWith(".pdf"))) {
                throw new ImageUploadException("Only JPG, PNG, WebP or PDF documents are allowed");
            }
        }
    }
}
