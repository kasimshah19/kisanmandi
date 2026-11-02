package com.kisanmandi.security;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletRequest;

import static org.junit.jupiter.api.Assertions.assertEquals;

class ClientIpResolverTest {

    private final ClientIpResolver resolver = new ClientIpResolver();

    @Test
    @DisplayName("Resolves direct remote address")
    void resolveClientIp_directPeer() {
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.setRemoteAddr("203.0.113.195");

        String ip = resolver.resolveClientIp(request);
        assertEquals("203.0.113.195", ip);
    }

    @Test
    @DisplayName("Direct client forging X-Forwarded-For does not trick resolver because getRemoteAddr() is used")
    void resolveClientIp_forgedHeaderIgnoredWithoutTrustedProxyValve() {
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.setRemoteAddr("198.51.100.12"); // Direct peer
        request.addHeader("X-Forwarded-For", "1.1.1.1, 2.2.2.2");

        String ip = resolver.resolveClientIp(request);
        assertEquals("198.51.100.12", ip);
    }

    @Test
    @DisplayName("Handles null request gracefully")
    void resolveClientIp_nullRequest() {
        assertEquals("unknown", resolver.resolveClientIp(null));
    }
}

