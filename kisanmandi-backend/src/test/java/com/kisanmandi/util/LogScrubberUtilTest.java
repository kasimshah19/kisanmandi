package com.kisanmandi.util;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class LogScrubberUtilTest {

    @Test
    @DisplayName("maskEmail masks local part correctly")
    void testMaskEmail() {
        assertEquals("k***@example.com", LogScrubberUtil.maskEmail("kasim@example.com"));
        assertEquals("r***@kisanmandi.com", LogScrubberUtil.maskEmail("ramesh.patil@kisanmandi.com"));
        assertEquals("a***@test.org", LogScrubberUtil.maskEmail("a@test.org"));
        assertEquals("unknown", LogScrubberUtil.maskEmail(null));
        assertEquals("unknown", LogScrubberUtil.maskEmail("  "));
        assertEquals("***", LogScrubberUtil.maskEmail("notanemail"));
    }

    @Test
    @DisplayName("maskPhone masks leading digits preserving last 4")
    void testMaskPhone() {
        assertEquals("******3210", LogScrubberUtil.maskPhone("9876543210"));
        assertEquals("*********7890", LogScrubberUtil.maskPhone("+919876547890"));
        assertEquals("****", LogScrubberUtil.maskPhone("1234"));
        assertEquals("unknown", LogScrubberUtil.maskPhone(null));
        assertEquals("unknown", LogScrubberUtil.maskPhone("   "));
    }

    @Test
    @DisplayName("scrubUrl removes query params and hash fragments")
    void testScrubUrl() {
        assertEquals("https://kisanmandi.com/reset-password",
                LogScrubberUtil.scrubUrl("https://kisanmandi.com/reset-password?token=secret123"));
        assertEquals("https://kisanmandi.com/api/products",
                LogScrubberUtil.scrubUrl("https://kisanmandi.com/api/products?category=1#top"));
        assertEquals("https://kisanmandi.com/orders",
                LogScrubberUtil.scrubUrl("https://kisanmandi.com/orders#details"));
        assertEquals("", LogScrubberUtil.scrubUrl(null));
    }
}
