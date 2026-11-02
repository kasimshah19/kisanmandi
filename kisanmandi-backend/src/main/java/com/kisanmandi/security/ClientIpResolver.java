package com.kisanmandi.security;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.stereotype.Component;

/**
 * Resolves trustworthy client IP.
 * With server.forward-headers-strategy=native, Tomcat's RemoteIpValve automatically
 * inspects X-Forwarded-For only when the request originates from a trusted internal proxy
 * and updates request.getRemoteAddr() with the legitimate client IP.
 * Untrusted direct clients forging X-Forwarded-For will NOT bypass this because
 * request.getRemoteAddr() is used directly.
 */
@Component
public class ClientIpResolver {

    public String resolveClientIp(HttpServletRequest request) {
        if (request == null) {
            return "unknown";
        }
        String remoteAddr = request.getRemoteAddr();
        return (remoteAddr != null && !remoteAddr.isBlank()) ? remoteAddr : "unknown";
    }
}

