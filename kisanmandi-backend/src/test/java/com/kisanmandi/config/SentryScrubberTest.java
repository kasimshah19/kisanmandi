package com.kisanmandi.config;

import com.kisanmandi.exception.DuplicateEmailException;
import com.kisanmandi.exception.ResourceNotFoundException;
import io.sentry.Breadcrumb;
import io.sentry.Hint;
import io.sentry.SentryEvent;
import io.sentry.protocol.Request;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.slf4j.MDC;

import java.util.HashMap;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

class SentryScrubberTest {

    private final SentryConfig sentryConfig = new SentryConfig();

    @Test
    @DisplayName("beforeSend drops expected 4xx exceptions")
    void testBeforeSendDrops4xxExceptions() {
        var beforeSend = sentryConfig.beforeSendCallback();

        SentryEvent event409 = new SentryEvent(new DuplicateEmailException("Email exists"));
        assertNull(beforeSend.execute(event409, new Hint()), "DuplicateEmailException should be dropped");

        SentryEvent event404 = new SentryEvent(new ResourceNotFoundException("Not found"));
        assertNull(beforeSend.execute(event404, new Hint()), "ResourceNotFoundException should be dropped");
    }

    @Test
    @DisplayName("beforeSend keeps unexpected 5xx / RuntimeException and attaches requestId")
    void testBeforeSendKeeps5xxAndTagsRequestId() {
        var beforeSend = sentryConfig.beforeSendCallback();

        MDC.put("requestId", "test-req-xyz123");
        try {
            SentryEvent event500 = new SentryEvent(new RuntimeException("Database deadlock"));
            Request req = new Request();
            req.setUrl("https://api.kisanmandi.com/api/products?foo=bar");
            req.setQueryString("foo=bar");
            req.setData("{\"secret\":\"data\"}");

            Map<String, String> headers = new HashMap<>();
            headers.put("Authorization", "Bearer secret-token");
            headers.put("Cookie", "session=123");
            headers.put("Accept", "application/json");
            req.setHeaders(headers);
            event500.setRequest(req);

            SentryEvent processed = beforeSend.execute(event500, new Hint());
            assertNotNull(processed);
            assertEquals("test-req-xyz123", processed.getTag("requestId"));

            // Assert headers and body scrubbed
            assertNull(processed.getRequest().getQueryString());
            assertNull(processed.getRequest().getData());
            assertFalse(processed.getRequest().getHeaders().containsKey("Authorization"));
            assertFalse(processed.getRequest().getHeaders().containsKey("Cookie"));
            assertTrue(processed.getRequest().getHeaders().containsKey("Accept"));
        } finally {
            MDC.clear();
        }
    }

    @Test
    @DisplayName("beforeBreadcrumb scrubs sensitive headers")
    void testBeforeBreadcrumbScrubsSensitiveHeaders() {
        var beforeBreadcrumb = sentryConfig.beforeBreadcrumbCallback();

        Breadcrumb breadcrumb = new Breadcrumb();
        breadcrumb.setData("authorization", "Bearer topsecret");
        breadcrumb.setData("cookie", "user_session=abc");
        breadcrumb.setData("other_key", "safe_value");

        Breadcrumb scrubbed = beforeBreadcrumb.execute(breadcrumb, new Hint());
        assertNotNull(scrubbed);
        assertNull(scrubbed.getData().get("authorization"));
        assertNull(scrubbed.getData().get("cookie"));
        assertEquals("safe_value", scrubbed.getData().get("other_key"));
    }
}
