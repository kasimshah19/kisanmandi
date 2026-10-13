package com.kisanmandi.integration;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class PublicEndpointsIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void healthEndpoint_accessibleWithoutToken() throws Exception {
        mockMvc.perform(get("/api/health"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("UP"))
                .andExpect(jsonPath("$.database").value("CONNECTED"))
                .andExpect(jsonPath("$.profile").value("test"));
    }

    @Test
    void categoriesEndpoint_accessibleWithoutToken() throws Exception {
        mockMvc.perform(get("/api/categories"))
                .andExpect(status().isOk());
    }

    @Test
    void productsEndpoint_accessibleWithoutToken() throws Exception {
        mockMvc.perform(get("/api/products"))
                .andExpect(status().isOk());
    }

    @Test
    void mandiStatesEndpoint_accessibleWithoutToken() throws Exception {
        mockMvc.perform(get("/api/mandi/states"))
                .andExpect(status().isOk());
    }
}
