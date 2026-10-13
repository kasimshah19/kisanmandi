package com.kisanmandi.service;

import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.reactive.function.client.WebClient;

import static org.junit.jupiter.api.Assertions.*;

class MandiApiClientTest {

    @Test
    void sanitize_masksApiKeyWhenPresent() {
        MandiApiClient client = new MandiApiClient(WebClient.builder());
        ReflectionTestUtils.setField(client, "apiKey", "secret-test-key-12345");

        String original = "Error connecting with api-key=secret-test-key-12345 on remote server";
        String sanitized = client.sanitize(original);

        assertFalse(sanitized.contains("secret-test-key-12345"));
        assertTrue(sanitized.contains("***"));
    }

    @Test
    void sanitize_handlesNullOrEmptyGracefully() {
        MandiApiClient client = new MandiApiClient(WebClient.builder());
        ReflectionTestUtils.setField(client, "apiKey", "my-key");

        assertEquals("Unknown error", client.sanitize(null));
        assertEquals("Standard error occurred", client.sanitize("Standard error occurred"));
    }
}
