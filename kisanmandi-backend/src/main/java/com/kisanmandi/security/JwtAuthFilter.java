package com.kisanmandi.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

// This filter runs once per request and checks the JWT token in the Authorization header
@Component
public class JwtAuthFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;
    private final UserDetailsServiceImpl userDetailsService;

    public JwtAuthFilter(JwtUtil jwtUtil, UserDetailsServiceImpl userDetailsService) {
        this.jwtUtil = jwtUtil;
        this.userDetailsService = userDetailsService;
    }

    @Override
    protected void doFilterInternal(@NonNull HttpServletRequest request,
                                    @NonNull HttpServletResponse response,
                                    @NonNull FilterChain filterChain) throws ServletException, IOException {

        // Get the Authorization header
        String authHeader = request.getHeader("Authorization");

        // If no Bearer token, just continue (public endpoints won't need a token)
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        // Skip if already authenticated in this request
        if (SecurityContextHolder.getContext().getAuthentication() != null) {
            filterChain.doFilter(request, response);
            return;
        }

        String token = authHeader.substring(7); // Remove "Bearer " prefix

        // Validate the token signature and expiration
        if (jwtUtil.isTokenValid(token)) {
            String email = jwtUtil.extractEmail(token);
            Integer tokenVersion = jwtUtil.extractTokenVersion(token);

            // Load user details from DB (checks active status and account lockout)
            UserDetails userDetails = userDetailsService.loadUserByUsername(email);

            // Only set authentication if account is enabled and not locked
            if (userDetails.isEnabled() && userDetails.isAccountNonLocked()) {
                if (userDetails instanceof CustomUserDetails customUser) {
                    // Reject when token's tv differs from user's current tokenVersion
                    if (tokenVersion == null || tokenVersion != customUser.getTokenVersion()) {
                        // Token was revoked (user logged out, changed password, or bumped tokenVersion)
                        filterChain.doFilter(request, response);
                        return;
                    }
                    org.slf4j.MDC.put("userId", String.valueOf(customUser.getId()));
                }

                UsernamePasswordAuthenticationToken authToken =
                        new UsernamePasswordAuthenticationToken(
                                userDetails, null, userDetails.getAuthorities()
                        );
                authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

                // Set the user as authenticated in Spring Security context
                SecurityContextHolder.getContext().setAuthentication(authToken);
            }
        }

        // Continue the filter chain
        filterChain.doFilter(request, response);
    }
}
