package com.kisanmandi.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.UUID;

// Utility class for creating and validating JWT tokens
@Component
public class JwtUtil {

    @Value("${app.jwt.secret}")
    private String secret;

    @Value("${app.jwt.expiration-ms:900000}")
    private long expirationMs;

    private SecretKey key;

    // Runs after the bean is created — validates the secret and builds the key
    @PostConstruct
    public void init() {
        if (secret == null || secret.isBlank() || secret.getBytes(StandardCharsets.UTF_8).length < 32) {
            throw new IllegalStateException(
                "app.jwt.secret must be at least 32 characters. Set it in application-local.properties."
            );
        }
        this.key = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
    }

    public long getExpirationMs() {
        return expirationMs;
    }

    // Create a JWT token with the user's email, role, token_version (tv), and jti
    public String generateToken(String email, String role, int tokenVersion) {
        String jti = UUID.randomUUID().toString();
        return Jwts.builder()
                .subject(email)
                .id(jti)
                .claim("role", role)
                .claim("tv", tokenVersion)
                .claim("tokenVersion", tokenVersion) // keep for backwards compatibility
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + expirationMs))
                .signWith(key)
                .compact();
    }

    // Overload for backward compatibility
    public String generateToken(String email, String role) {
        return generateToken(email, role, 1);
    }

    // Extract the email (subject) from a JWT token
    public String extractEmail(String token) {
        return Jwts.parser()
                .verifyWith(key)
                .build()
                .parseSignedClaims(token)
                .getPayload()
                .getSubject();
    }

    // Extract the token_version claim (tv or tokenVersion) from a JWT token
    public Integer extractTokenVersion(String token) {
        try {
            Claims claims = Jwts.parser()
                    .verifyWith(key)
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();
            Object tv = claims.get("tv");
            if (tv == null) {
                tv = claims.get("tokenVersion");
            }
            if (tv instanceof Number num) {
                return num.intValue();
            }
            return null;
        } catch (Exception e) {
            return null;
        }
    }

    // Check if a token is valid (not expired, not tampered)
    public boolean isTokenValid(String token) {
        try {
            Jwts.parser()
                .verifyWith(key)
                .build()
                .parseSignedClaims(token);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            // Token is invalid, expired, or tampered
            return false;
        }
    }
}
