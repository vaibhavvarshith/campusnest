package com.campusnest.controller;

import com.campusnest.dto.common.ApiResponse;
import com.campusnest.dto.user.UserResponse;
import com.campusnest.entity.Role;
import com.campusnest.entity.User;
import com.campusnest.exception.BadRequestException;
import com.campusnest.exception.ResourceNotFoundException;
import com.campusnest.repository.RoleRepository;
import com.campusnest.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/librarians")
@PreAuthorize("hasRole('ADMIN')")
public class LibrarianManagementController {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;

    public LibrarianManagementController(UserRepository userRepository,
                                         RoleRepository roleRepository,
                                         PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @GetMapping
    @Transactional(readOnly = true)
    public ResponseEntity<ApiResponse<List<UserResponse>>> getLibrarians() {
        List<UserResponse> list = userRepository.findAll().stream()
                .filter(u -> u.getRole() != null && "ROLE_LIBRARIAN".equals(u.getRole().getName()))
                .map(this::mapToResponse)
                .toList();
        return ResponseEntity.ok(ApiResponse.ok(list));
    }

    @PostMapping
    @Transactional
    public ResponseEntity<ApiResponse<UserResponse>> createLibrarian(@RequestBody Map<String, String> payload) {
        String username = payload.get("username");
        String fullName = payload.get("fullName");
        String email = payload.get("email");
        String phone = payload.get("phone");
        String initialPassword = payload.getOrDefault("initialPassword", "LIB2026");

        if (username == null || username.isBlank()) {
            throw new BadRequestException("Username is required");
        }
        if (fullName == null || fullName.isBlank()) {
            throw new BadRequestException("Full name is required");
        }
        if (email == null || email.isBlank()) {
            throw new BadRequestException("Email is required");
        }
        if (userRepository.existsByUsernameIgnoreCase(username)) {
            throw new BadRequestException("Username already in use");
        }
        if (userRepository.existsByEmailIgnoreCase(email)) {
            throw new BadRequestException("Email already in use");
        }

        Role librarianRole = roleRepository.findByName("ROLE_LIBRARIAN")
                .orElseThrow(() -> new ResourceNotFoundException("ROLE_LIBRARIAN not found"));

        User user = new User();
        user.setUsername(username.trim());
        user.setFullName(fullName.trim());
        user.setEmail(email.trim());
        user.setPhone(phone != null ? phone.trim() : null);
        user.setRole(librarianRole);
        user.setPasswordHash(passwordEncoder.encode(initialPassword.trim()));
        user.setIsActive(true);
        user.setFirstLogin(false);

        User saved = userRepository.save(user);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Librarian registered successfully", mapToResponse(saved)));
    }

    @PatchMapping("/{id}/toggle-status")
    @Transactional
    public ResponseEntity<ApiResponse<Void>> toggleStatus(@PathVariable Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Librarian not found with id: " + id));
        user.setIsActive(!Boolean.TRUE.equals(user.getIsActive()));
        userRepository.save(user);
        return ResponseEntity.ok(ApiResponse.ok("Librarian status updated", null));
    }

    @PostMapping("/{id}/reset-password")
    @Transactional
    public ResponseEntity<ApiResponse<Void>> resetPassword(@PathVariable Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Librarian not found with id: " + id));
        user.setPasswordHash(passwordEncoder.encode("LIB2026"));
        user.setFirstLogin(false);
        userRepository.save(user);
        return ResponseEntity.ok(ApiResponse.ok("Password reset to LIB2026", null));
    }

    private UserResponse mapToResponse(User user) {
        UserResponse response = new UserResponse();
        response.setId(user.getId());
        response.setUsername(user.getUsername());
        response.setFullName(user.getFullName());
        response.setEmail(user.getEmail());
        response.setPhone(user.getPhone());
        response.setRole(user.getRole() != null ? user.getRole().getName() : "ROLE_LIBRARIAN");
        response.setIsActive(user.getIsActive());
        response.setFirstLogin(user.getFirstLogin());
        response.setCreatedAt(user.getCreatedAt());
        return response;
    }
}
