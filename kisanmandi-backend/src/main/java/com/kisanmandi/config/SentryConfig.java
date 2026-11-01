package com.kisanmandi.config;

import io.sentry.Hint;
import io.sentry.SentryEvent;
import io.sentry.SentryOptions;
import io.sentry.protocol.Request;
import org.slf4j.MDC;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.Map;
import java.util.Set;

@Configuration
public class SentryConfig {

    private static final Set<String> SENSITIVE_HEADERS = Set.of(
            "authorization", "cookie", "set-cookie", "proxy-authorization"
    );

    @Bean
    public SentryOptions.BeforeSendCallback beforeSendCallback() {
        return (SentryEvent event, Hint hint) -> {
            // Tag requestId from MDC if present
            String requestId = MDC.get("requestId");
            if (requestId != null && !requestId.isBlank()) {
                event.setTag("requestId", requestId);
            }

            // Filter out expected 4xx business exceptions
            Throwable throwable = event.getThrowable();
            if (isExpected4xxException(throwable)) {
                return null; // Drop event
            }

            // Scrub request details
            Request request = event.getRequest();
            if (request != null) {
                // Strip query string and body
                request.setQueryString(null);
                request.setData(null);

                // Strip sensitive headers
                Map<String, String> headers = request.getHeaders();
                if (headers != null) {
                    headers.keySet().removeIf(k -> SENSITIVE_HEADERS.contains(k.toLowerCase()));
                }
            }

            return event;
        };
    }

    @Bean
    public SentryOptions.BeforeBreadcrumbCallback beforeBreadcrumbCallback() {
        return (breadcrumb, hint) -> {
            Map<String, Object> data = breadcrumb.getData();
            if (data != null) {
                data.keySet().removeIf(k -> SENSITIVE_HEADERS.contains(k.toLowerCase()));
            }
            return breadcrumb;
        };
    }

    public static boolean isExpected4xxException(Throwable throwable) {
        if (throwable == null) return false;
        String name = throwable.getClass().getName();
        return name.contains("MethodArgumentNotValidException")
                || name.contains("DuplicateEmailException")
                || name.contains("BadCredentialsException")
                || name.contains("DisabledException")
                || name.contains("LockedException")
                || name.contains("AccessDeniedException")
                || name.contains("ResourceNotFoundException")
                || name.contains("FarmerNotApprovedException")
                || name.contains("InsufficientStockException")
                || name.contains("ProductUnavailableException")
                || name.contains("CartEmptyException")
                || name.contains("InvalidStatusTransitionException")
                || name.contains("IllegalArgumentException")
                || name.contains("IllegalStateException")
                || name.contains("DataIntegrityViolationException")
                || name.contains("HttpMessageNotReadableException")
                || name.contains("MaxUploadSizeExceededException")
                || name.contains("NoResourceFoundException");
    }
}
