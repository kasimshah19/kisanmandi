# ==========================================
# Multi-stage Dockerfile for KisanMandi Backend
# Optimized for Render Free Tier (512 MB RAM, 0.1 CPU)
# ==========================================

# Stage 1: Build & Package
FROM maven:3.9-eclipse-temurin-17 AS builder
WORKDIR /build

# Copy dependency manifest first for efficient Docker layer caching
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Copy application source code and package executable jar
COPY src ./src
RUN mvn -q -DskipTests package

# Stage 2: Minimal Production Runtime
FROM eclipse-temurin:17-jre
WORKDIR /app

# Run as non-root user for security hardening
RUN groupadd -r appgroup && useradd -r -g appgroup appuser

# Copy jar from build stage
COPY --from=builder --chown=appuser:appgroup /build/target/app.jar /app/app.jar

USER appuser

EXPOSE 8080

# Production timezone and JVM memory tuning for 512 MB container limit
ENV TZ=Asia/Kolkata
ENV JAVA_OPTS="-XX:MaxRAMPercentage=65 -XX:+UseSerialGC -XX:TieredStopAtLevel=1 -Xss512k -Duser.timezone=Asia/Kolkata -Dspring.profiles.active=prod"

ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar /app/app.jar"]
