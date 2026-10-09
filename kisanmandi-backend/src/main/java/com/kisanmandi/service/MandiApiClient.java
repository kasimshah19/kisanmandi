package com.kisanmandi.service;

import com.kisanmandi.dto.mandi.MandiApiResponse;
import com.kisanmandi.exception.MandiApiException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;
import reactor.core.publisher.Mono;
import reactor.util.retry.Retry;

import java.time.Duration;

@Service
public class MandiApiClient {

    private final WebClient webClient;
    
    @Value("${mandi.api.base-url}")
    private String baseUrl;
    
    @Value("${mandi.api.resource-id}")
    private String resourceId;
    
    @Value("${mandi.api.key}")
    private String apiKey;

    public MandiApiClient(WebClient.Builder webClientBuilder) {
        this.webClient = webClientBuilder
                .codecs(configurer -> configurer
                        .defaultCodecs()
                        .maxInMemorySize(10 * 1024 * 1024)) // 10MB
                .build();
    }

    public MandiApiResponse fetchPage(String state, int offset, int limit) {
        try {
            return webClient.get()
                    .uri(baseUrl + "/" + resourceId, uriBuilder -> uriBuilder
                            .queryParam("api-key", apiKey)
                            .queryParam("format", "json")
                            .queryParam("limit", limit)
                            .queryParam("offset", offset)
                            .queryParam("filters[state]", state)
                            .build())
                    .accept(MediaType.APPLICATION_JSON)
                    .retrieve()
                    .onStatus(status -> status.is4xxClientError() || status.is5xxServerError(),
                            response -> response.bodyToMono(String.class)
                                    .flatMap(errorBody -> Mono.error(new MandiApiException("API returned error: " + response.statusCode()))))
                    .bodyToMono(MandiApiResponse.class)
                    .retryWhen(Retry.backoff(2, Duration.ofSeconds(2))
                            .filter(throwable -> {
                                if (throwable instanceof WebClientResponseException wce) {
                                    return wce.getStatusCode().is5xxServerError();
                                }
                                return throwable instanceof java.util.concurrent.TimeoutException || 
                                       throwable instanceof java.net.ConnectException;
                            }))
                    .timeout(Duration.ofSeconds(60))
                    .block();
        } catch (Exception e) {
            throw new MandiApiException("Failed to fetch mandi data: " + sanitize(e.getMessage()), e);
        }
    }

    private String sanitize(String message) {
        if (message == null) return "Unknown error";
        if (apiKey != null && !apiKey.isEmpty()) {
            return message.replace(apiKey, "***");
        }
        return message;
    }
}
