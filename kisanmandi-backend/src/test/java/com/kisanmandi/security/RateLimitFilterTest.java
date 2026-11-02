package com.kisanmandi.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;

import java.io.IOException;
import java.util.concurrent.atomic.AtomicInteger;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;

class RateLimitFilterTest {

    private RateLimitFilter rateLimitFilter;
    private AtomicInteger chainCalls;
    private FilterChain filterChain;

    @BeforeEach
    void setUp() {
        rateLimitFilter = new RateLimitFilter(new ClientIpResolver());
        chainCalls = new AtomicInteger(0);
        filterChain = (req, res) -> chainCalls.incrementAndGet();
    }

    @Test
    void loginEndpoint_allows10Requests_blocks11thWith429() throws ServletException, IOException {
        String clientIp = "192.168.1.10";

        // First 10 requests should succeed (status 200, chain called)
        for (int i = 1; i <= 10; i++) {
            MockHttpServletRequest request = new MockHttpServletRequest("POST", "/api/auth/login");
            request.setRemoteAddr(clientIp);
            MockHttpServletResponse response = new MockHttpServletResponse();

            rateLimitFilter.doFilterInternal(request, response, filterChain);
            assertEquals(200, response.getStatus());
        }

        assertEquals(10, chainCalls.get());

        // 11th request must be blocked with HTTP 429
        MockHttpServletRequest request11 = new MockHttpServletRequest("POST", "/api/auth/login");
        request11.setRemoteAddr(clientIp);
        MockHttpServletResponse response11 = new MockHttpServletResponse();

        rateLimitFilter.doFilterInternal(request11, response11, filterChain);

        assertEquals(429, response11.getStatus());
        assertNotNull(response11.getHeader("Retry-After"));
        assertEquals(10, chainCalls.get());
    }

    @Test
    void registerEndpoint_allows5Requests_blocks6thWith429() throws ServletException, IOException {
        String clientIp = "192.168.1.20";

        for (int i = 1; i <= 5; i++) {
            MockHttpServletRequest request = new MockHttpServletRequest("POST", "/api/auth/register");
            request.setRemoteAddr(clientIp);
            MockHttpServletResponse response = new MockHttpServletResponse();

            rateLimitFilter.doFilterInternal(request, response, filterChain);
            assertEquals(200, response.getStatus());
        }

        assertEquals(5, chainCalls.get());

        // 6th request must be blocked
        MockHttpServletRequest request6 = new MockHttpServletRequest("POST", "/api/auth/register");
        request6.setRemoteAddr(clientIp);
        MockHttpServletResponse response6 = new MockHttpServletResponse();

        rateLimitFilter.doFilterInternal(request6, response6, filterChain);

        assertEquals(429, response6.getStatus());
        assertNotNull(response6.getHeader("Retry-After"));
        assertEquals(5, chainCalls.get());
    }

    @Test
    void refreshEndpoint_allows30Requests_blocks31stWith429() throws ServletException, IOException {
        String clientIp = "192.168.1.25";

        for (int i = 1; i <= 30; i++) {
            MockHttpServletRequest request = new MockHttpServletRequest("POST", "/api/auth/refresh");
            request.setRemoteAddr(clientIp);
            MockHttpServletResponse response = new MockHttpServletResponse();

            rateLimitFilter.doFilterInternal(request, response, filterChain);
            assertEquals(200, response.getStatus());
        }

        assertEquals(30, chainCalls.get());

        MockHttpServletRequest req31 = new MockHttpServletRequest("POST", "/api/auth/refresh");
        req31.setRemoteAddr(clientIp);
        MockHttpServletResponse res31 = new MockHttpServletResponse();

        rateLimitFilter.doFilterInternal(req31, res31, filterChain);

        assertEquals(429, res31.getStatus());
        assertNotNull(res31.getHeader("Retry-After"));
        assertEquals(30, chainCalls.get());
    }

    @Test
    void passwordEndpoint_allows10Requests_blocks11thWith429() throws ServletException, IOException {
        String clientIp = "192.168.1.35";

        for (int i = 1; i <= 10; i++) {
            MockHttpServletRequest request = new MockHttpServletRequest("PUT", "/api/auth/password");
            request.setRemoteAddr(clientIp);
            MockHttpServletResponse response = new MockHttpServletResponse();

            rateLimitFilter.doFilterInternal(request, response, filterChain);
            assertEquals(200, response.getStatus());
        }

        assertEquals(10, chainCalls.get());

        MockHttpServletRequest req11 = new MockHttpServletRequest("PUT", "/api/auth/password");
        req11.setRemoteAddr(clientIp);
        MockHttpServletResponse res11 = new MockHttpServletResponse();

        rateLimitFilter.doFilterInternal(req11, res11, filterChain);

        assertEquals(429, res11.getStatus());
        assertNotNull(res11.getHeader("Retry-After"));
        assertEquals(10, chainCalls.get());
    }

    @Test
    void otherEndpoints_notRateLimited() throws ServletException, IOException {
        String clientIp = "192.168.1.30";

        for (int i = 1; i <= 20; i++) {
            MockHttpServletRequest request = new MockHttpServletRequest("GET", "/api/products");
            request.setRemoteAddr(clientIp);
            MockHttpServletResponse response = new MockHttpServletResponse();

            rateLimitFilter.doFilterInternal(request, response, filterChain);
            assertEquals(200, response.getStatus());
        }

        assertEquals(20, chainCalls.get());
    }

    @Test
    @SuppressWarnings("unchecked")
    void rateLimit_resetsAfterWindow() throws ServletException, IOException {
        String clientIp = "192.168.1.40";
        for (int i = 1; i <= 10; i++) {
            MockHttpServletRequest req = new MockHttpServletRequest("POST", "/api/auth/login");
            req.setRemoteAddr(clientIp);
            rateLimitFilter.doFilterInternal(req, new MockHttpServletResponse(), filterChain);
        }

        // 11th request is blocked
        MockHttpServletRequest req11 = new MockHttpServletRequest("POST", "/api/auth/login");
        req11.setRemoteAddr(clientIp);
        MockHttpServletResponse res11 = new MockHttpServletResponse();
        rateLimitFilter.doFilterInternal(req11, res11, filterChain);
        assertEquals(429, res11.getStatus());

        // Simulate window expiry and cleanup
        var requestCounts = (java.util.concurrent.ConcurrentHashMap<String, java.util.Deque<Long>>)
                org.springframework.test.util.ReflectionTestUtils.getField(rateLimitFilter, "requestCounts");
        assertNotNull(requestCounts);
        var deque = requestCounts.get(clientIp + ":login");
        assertNotNull(deque);
        synchronized (deque) {
            deque.clear();
        }
        rateLimitFilter.cleanupOldEntries();

        // New request after window reset succeeds
        MockHttpServletResponse resAfterWindow = new MockHttpServletResponse();
        rateLimitFilter.doFilterInternal(req11, resAfterWindow, filterChain);
        assertEquals(200, resAfterWindow.getStatus());
    }
}
