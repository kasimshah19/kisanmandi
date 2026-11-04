package com.kisanmandi.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.MediaType;
import org.springframework.lang.NonNull;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.ArrayDeque;
import java.util.Deque;
import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

// In-memory rate limiting filter to protect sensitive auth endpoints
@Component
public class RateLimitFilter extends OncePerRequestFilter {

    private static final int LOGIN_LIMIT = 10;       // max 10 requests per minute
    private static final int REGISTER_LIMIT = 5;      // max 5 requests per minute
    private static final int REFRESH_LIMIT = 30;     // max 30 requests per minute
    private static final int PASSWORD_LIMIT = 10;    // max 10 requests per minute
    private static final int FORGOT_PASSWORD_LIMIT = 10; // max 10 requests per minute per IP
    private static final int PAYMENT_VERIFY_LIMIT = 20;  // max 20 requests per minute per IP
    private static final int PAYMENT_RETRY_LIMIT = 20;   // max 20 requests per minute per IP
    private static final long WINDOW_MS = 60_000L;   // 1 minute window

    // Key: "ip:endpoint", Value: deque of request timestamps (epoch ms)
    private final ConcurrentHashMap<String, Deque<Long>> requestCounts = new ConcurrentHashMap<>();
    private final ObjectMapper objectMapper = new ObjectMapper();
    private final ClientIpResolver clientIpResolver;

    public RateLimitFilter(ClientIpResolver clientIpResolver) {
        this.clientIpResolver = clientIpResolver;
    }

    @Override
    protected void doFilterInternal(@NonNull HttpServletRequest request,
                                    @NonNull HttpServletResponse response,
                                    @NonNull FilterChain filterChain) throws ServletException, IOException {

        String path = request.getRequestURI();
        String method = request.getMethod();

        if ("POST".equalsIgnoreCase(method)) {
            if ("/api/auth/login".equals(path)) {
                if (isRateLimited(request, "login", LOGIN_LIMIT, response)) {
                    return;
                }
            } else if ("/api/auth/register".equals(path)) {
                if (isRateLimited(request, "register", REGISTER_LIMIT, response)) {
                    return;
                }
            } else if ("/api/auth/refresh".equals(path)) {
                if (isRateLimited(request, "refresh", REFRESH_LIMIT, response)) {
                    return;
                }
            } else if ("/api/auth/change-password".equals(path)) {
                if (isRateLimited(request, "password", PASSWORD_LIMIT, response)) {
                    return;
                }
            } else if ("/api/auth/forgot-password".equals(path)) {
                if (isRateLimited(request, "forgot-password", FORGOT_PASSWORD_LIMIT, response)) {
                    return;
                }
            } else if ("/api/customer/payments/verify".equals(path) || "/api/payment/verify".equals(path)) {
                if (isRateLimited(request, "payment-verify", PAYMENT_VERIFY_LIMIT, response)) {
                    return;
                }
            } else if (path.startsWith("/api/customer/payments/") && path.endsWith("/retry")) {
                if (isRateLimited(request, "payment-retry", PAYMENT_RETRY_LIMIT, response)) {
                    return;
                }
            }
        } else if ("PUT".equalsIgnoreCase(method)) {
            if ("/api/auth/password".equals(path)) {
                if (isRateLimited(request, "password", PASSWORD_LIMIT, response)) {
                    return;
                }
            }
        }

        filterChain.doFilter(request, response);
    }

    private boolean isRateLimited(HttpServletRequest request, String endpointKey, int maxRequests, HttpServletResponse response) throws IOException {
        String clientIp = clientIpResolver.resolveClientIp(request);
        String key = clientIp + ":" + endpointKey;
        long now = System.currentTimeMillis();

        Deque<Long> timestamps = requestCounts.computeIfAbsent(key, k -> new ArrayDeque<>());

        long retryAfterSeconds = 60;
        boolean limited = false;

        synchronized (timestamps) {
            // Evict timestamps older than 1 minute
            while (!timestamps.isEmpty() && now - timestamps.peekFirst() > WINDOW_MS) {
                timestamps.pollFirst();
            }

            if (timestamps.size() >= maxRequests) {
                limited = true;
                long oldest = timestamps.peekFirst() != null ? timestamps.peekFirst() : now;
                retryAfterSeconds = Math.max(1, (oldest + WINDOW_MS - now) / 1000);
            } else {
                timestamps.addLast(now);
            }
        }

        if (limited) {
            response.setStatus(429);
            response.setHeader("Retry-After", String.valueOf(retryAfterSeconds));
            response.setContentType(MediaType.APPLICATION_JSON_VALUE);

            Map<String, Object> body = new HashMap<>();
            body.put("timestamp", LocalDateTime.now().toString());
            body.put("status", 429);
            body.put("error", "Too Many Requests");
            body.put("message", "Too many requests. Please try again later.");
            body.put("retryAfterSeconds", retryAfterSeconds);
            String reqId = org.slf4j.MDC.get("requestId");
            body.put("requestId", reqId != null && !reqId.isBlank() ? reqId : "unknown");

            objectMapper.writeValue(response.getOutputStream(), body);
            return true;
        }

        return false;
    }

    // Periodic cleanup every 60 seconds to prevent memory leaks from stale IPs
    @Scheduled(fixedRate = 60000)
    public void cleanupOldEntries() {
        long now = System.currentTimeMillis();
        requestCounts.entrySet().removeIf(entry -> {
            Deque<Long> deque = entry.getValue();
            synchronized (deque) {
                while (!deque.isEmpty() && now - deque.peekFirst() > WINDOW_MS) {
                    deque.pollFirst();
                }
                return deque.isEmpty();
            }
        });
    }

    // For testing: reset all rate limit counters
    public void reset() {
        requestCounts.clear();
    }
}
