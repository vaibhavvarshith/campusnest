package com.campusnest.controller;

import com.campusnest.dto.auth.*;
import com.campusnest.dto.common.ApiResponse;
import com.campusnest.dto.user.UserResponse;
import com.campusnest.security.UserPrincipal;
import com.campusnest.service.AuthService;
import com.campusnest.service.PasswordResetService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;
    private final PasswordResetService passwordResetService;

    public AuthController(AuthService authService, PasswordResetService passwordResetService) {
        this.authService = authService;
        this.passwordResetService = passwordResetService;
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody LoginRequest loginRequest) {
        AuthResponse response = authService.login(loginRequest);
        return ResponseEntity.ok(ApiResponse.ok("Login successful", response));
    }

    @PostMapping({"/login/{portal}", "/{portal}/login"})
    public ResponseEntity<ApiResponse<AuthResponse>> portalLogin(
            @PathVariable String portal,
            @Valid @RequestBody LoginRequest loginRequest) {
        AuthResponse response = authService.portalLogin(loginRequest, portal);
        return ResponseEntity.ok(ApiResponse.ok("Login successful", response));
    }

    @PostMapping("/change-password")
    public ResponseEntity<ApiResponse<Void>> changePassword(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody PasswordChangeRequest request) {
        authService.changePassword(principal, request);
        return ResponseEntity.ok(ApiResponse.ok("Password updated successfully", null));
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<UserResponse>> getCurrentUser(
            @AuthenticationPrincipal UserPrincipal principal) {
        UserResponse response = authService.getCurrentUser(principal);
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<ApiResponse<String>> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        String message = passwordResetService.initiatePasswordReset(request);
        return ResponseEntity.ok(ApiResponse.ok(message, message));
    }

    @GetMapping("/reset-password/validate-token")
    public ResponseEntity<ApiResponse<PasswordResetVerifyResponse>> validateResetToken(@RequestParam String token) {
        PasswordResetVerifyResponse response = passwordResetService.validateToken(token);
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<ApiResponse<String>> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        passwordResetService.resetPassword(request);
        return ResponseEntity.ok(ApiResponse.ok("Password has been successfully reset. You may now sign in with your new password.", null));
    }
}
