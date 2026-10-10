package com.campusnest.controller;

import com.campusnest.dto.common.ApiResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class HealthController {

    @GetMapping("/health")
    public ResponseEntity<ApiResponse<Map<String, Object>>> checkHealth() {
        Map<String, Object> status = Map.of(
                "application", "CampusNest - Smart Library & Academic Management System",
                "version", "1.0.0",
                "status", "UP",
                "serverTime", LocalDateTime.now(),
                "timezone", "Asia/Kolkata"
        );
        return ResponseEntity.ok(ApiResponse.ok("Service is healthy", status));
    }
}
