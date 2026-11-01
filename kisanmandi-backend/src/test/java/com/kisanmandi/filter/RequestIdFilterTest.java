package com.kisanmandi.filter;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.slf4j.MDC;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class RequestIdFilterTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    @DisplayName("Valid X-Request-Id is preserved and returned in response header")
    void testValidRequestIdPreserved() throws Exception {
        String validId = "req-custom-trace-123456";

        mockMvc.perform(get("/api/health").header("X-Request-Id", validId))
                .andExpect(status().isOk())
                .andExpect(header().string("X-Request-Id", validId));

        // Ensure MDC was cleared after request finished
        assertNull(MDC.get("requestId"), "MDC must be cleared in finally block");
    }

    @Test
    @DisplayName("Invalid X-Request-Id (too short / special chars) is replaced with a generated UUID-based ID")
    void testInvalidRequestIdReplaced() throws Exception {
        String invalidId = "bad<id>";

        MvcResult result = mockMvc.perform(get("/api/health").header("X-Request-Id", invalidId))
                .andExpect(status().isOk())
                .andReturn();

        String responseHeader = result.getResponse().getHeader("X-Request-Id");
        assertNotNull(responseHeader);
        assertNotEquals(invalidId, responseHeader);
        assertTrue(RequestIdFilter.VALID_REQUEST_ID_PATTERN.matcher(responseHeader).matches(),
                "Generated requestId must match valid pattern: " + responseHeader);
        assertNull(MDC.get("requestId"));
    }

    @Test
    @DisplayName("Missing X-Request-Id is generated and returned")
    void testMissingRequestIdGenerated() throws Exception {
        MvcResult result = mockMvc.perform(get("/api/health"))
                .andExpect(status().isOk())
                .andReturn();

        String responseHeader = result.getResponse().getHeader("X-Request-Id");
        assertNotNull(responseHeader);
        assertTrue(RequestIdFilter.VALID_REQUEST_ID_PATTERN.matcher(responseHeader).matches());
        assertNull(MDC.get("requestId"));
    }

    @Test
    @DisplayName("Error JSON contains requestId for 401 Unauthorized")
    void testRequestIdIncludedIn401Error() throws Exception {
        String customId = "trace-401-error-check";

        mockMvc.perform(get("/api/customer/orders").header("X-Request-Id", customId))
                .andExpect(status().isUnauthorized())
                .andExpect(header().string("X-Request-Id", customId))
                .andExpect(jsonPath("$.status").value(401))
                .andExpect(jsonPath("$.requestId").value(customId));
    }
}
