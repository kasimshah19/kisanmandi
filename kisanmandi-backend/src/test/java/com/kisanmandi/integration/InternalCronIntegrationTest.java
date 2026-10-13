package com.kisanmandi.integration;

import com.kisanmandi.controller.InternalMandiSyncController;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class InternalCronIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private InternalMandiSyncController syncController;

    @Test
    void cronSync_noTokenHeader_returns403() throws Exception {
        mockMvc.perform(post("/api/internal/mandi/sync"))
                .andExpect(status().isForbidden());
    }

    @Test
    void cronSync_wrongToken_returns403() throws Exception {
        mockMvc.perform(post("/api/internal/mandi/sync")
                        .header("X-Cron-Token", "wrong-secret-token"))
                .andExpect(status().isForbidden());
    }

    @Test
    void cronSync_correctToken_returns202() throws Exception {
        mockMvc.perform(post("/api/internal/mandi/sync")
                        .header("X-Cron-Token", "test-mandi-cron-secret-token"))
                .andExpect(status().isAccepted());
    }

    @Test
    void cronSync_tokenPropertyEmpty_returns404() throws Exception {
        // Temporarily clear the configured cron token to verify 404 response
        String originalToken = (String) ReflectionTestUtils.getField(syncController, "configuredCronToken");
        try {
            ReflectionTestUtils.setField(syncController, "configuredCronToken", "");
            mockMvc.perform(post("/api/internal/mandi/sync")
                            .header("X-Cron-Token", "any-token"))
                    .andExpect(status().isNotFound());
        } finally {
            ReflectionTestUtils.setField(syncController, "configuredCronToken", originalToken);
        }
    }
}
