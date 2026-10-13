package com.kisanmandi.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springdoc.core.models.GroupedOpenApi;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

// OpenAPI 3.0 configuration with JWT security and route groups
@Configuration
public class OpenApiConfig {

    private static final String SECURITY_SCHEME_NAME = "bearerAuth";

    @Bean
    public OpenAPI kisanMandiOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("KisanMandi API")
                        .version("1.0")
                        .description("Direct-from-farm marketplace connecting local farmers and customers with real-time APMC Mandi rates. " +
                                "Supports role-based access control (CUSTOMER, FARMER, ADMIN) with JWT authentication."))
                .addSecurityItem(new SecurityRequirement().addList(SECURITY_SCHEME_NAME))
                .components(new Components()
                        .addSecuritySchemes(SECURITY_SCHEME_NAME, new SecurityScheme()
                                .name(SECURITY_SCHEME_NAME)
                                .type(SecurityScheme.Type.HTTP)
                                .scheme("bearer")
                                .bearerFormat("JWT")));
    }

    @Bean
    public GroupedOpenApi publicApi() {
        return GroupedOpenApi.builder()
                .group("1-Public")
                .pathsToMatch("/api/products/**", "/api/categories/**", "/api/mandi/**", "/api/nearby/**", "/api/farmers/**", "/api/reviews/**", "/api/health")
                .build();
    }

    @Bean
    public GroupedOpenApi authApi() {
        return GroupedOpenApi.builder()
                .group("2-Auth")
                .pathsToMatch("/api/auth/**")
                .build();
    }

    @Bean
    public GroupedOpenApi customerApi() {
        return GroupedOpenApi.builder()
                .group("3-Customer")
                .pathsToMatch("/api/customer/**")
                .build();
    }

    @Bean
    public GroupedOpenApi farmerApi() {
        return GroupedOpenApi.builder()
                .group("4-Farmer")
                .pathsToMatch("/api/farmer/**")
                .build();
    }

    @Bean
    public GroupedOpenApi adminApi() {
        return GroupedOpenApi.builder()
                .group("5-Admin")
                .pathsToMatch("/api/admin/**")
                .build();
    }
}
