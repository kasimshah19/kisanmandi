package com.kisanmandi.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;

import java.io.IOException;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.Mockito.*;

class RateLimitFilterTest {

    private RateLimitFilter rateLimitFilter;
    private FilterChain filterChain;

    @BeforeEach
    void setUp() {
        rateLimitFilter = new RateLimitFilter();
        filterChain = mock(FilterChain.class);
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

        verify(filterChain, times(10)).doFilter(any(), any());

        // 11th request must be blocked with HTTP 429
        MockHttpServletRequest request11 = new MockHttpServletRequest("POST", "/api/auth/login");
        request11.setRemoteAddr(clientIp);
        MockHttpServletResponse response11 = new MockHttpServletResponse();

        rateLimitFilter.doFilterInternal(request11, response11, filterChain);

        assertEquals(429, response11.getStatus());
        assertNotNull(response11.getHeader("Retry-After"));
        // FilterChain should NOT have been invoked on 11th request
        verify(filterChain, times(10)).doFilter(any(), any());
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

        verify(filterChain, times(5)).doFilter(any(), any());

        // 6th request must be blocked
        MockHttpServletRequest request6 = new MockHttpServletRequest("POST", "/api/auth/register");
        request6.setRemoteAddr(clientIp);
        MockHttpServletResponse response6 = new MockHttpServletResponse();

        rateLimitFilter.doFilterInternal(request6, response6, filterChain);

        assertEquals(429, response6.getStatus());
        assertNotNull(response6.getHeader("Retry-After"));
        verify(filterChain, times(5)).doFilter(any(), any());
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

        verify(filterChain, times(20)).doFilter(any(), any());
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
