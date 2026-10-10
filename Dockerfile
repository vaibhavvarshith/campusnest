# ==============================================================================
# CampusNest — Smart Library and Academic Management System
# Production Multi-Stage Dockerfile (Single-Origin Architecture)
# Frontend (React 18 / Vite) + Backend (Java 21 / Spring Boot 3.3.4)
# ==============================================================================

# ------------------------------------------------------------------------------
# Stage 1: Build React 18 / Vite Frontend
# ------------------------------------------------------------------------------
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend

COPY frontend/package*.json ./
RUN npm ci

COPY frontend/ ./
RUN npm run build

# ------------------------------------------------------------------------------
# Stage 2: Build Spring Boot 3.3.4 (Java 21) Fat JAR with Embedded Frontend
# ------------------------------------------------------------------------------
FROM maven:3.9.6-eclipse-temurin-21-alpine AS backend-builder
WORKDIR /app/backend

COPY backend/pom.xml ./
RUN mvn dependency:go-offline -B

COPY backend/src ./src
# Copy production React static build into Spring Boot static resources directory
COPY --from=frontend-builder /app/frontend/dist ./src/main/resources/static

RUN mvn clean package -DskipTests

# ------------------------------------------------------------------------------
# Stage 3: Minimal Production Eclipse Temurin Java 21 JRE Runtime
# ------------------------------------------------------------------------------
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Install runtime utilities, timezone data, and create unprivileged application user
RUN apk add --no-cache tzdata curl wget && \
    addgroup -S campusnest && adduser -S campusnest -G campusnest && \
    mkdir -p /app/uploads/submissions /app/uploads/projects && \
    chown -R campusnest:campusnest /app

USER campusnest:campusnest

# Copy executable Spring Boot Fat JAR
COPY --from=backend-builder --chown=campusnest:campusnest /app/backend/target/campusnest-backend-1.0.0.jar app.jar

ENV PORT=8080 \
    TZ=Asia/Kolkata \
    UPLOAD_DIR=/app/uploads/submissions

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=5s --start-period=60s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:${PORT:-8080}/api/health || exit 1

ENTRYPOINT ["java", "-XX:+UseContainerSupport", "-XX:MaxRAMPercentage=75.0", "-Djava.security.egd=file:/dev/./urandom", "-jar", "app.jar"]
