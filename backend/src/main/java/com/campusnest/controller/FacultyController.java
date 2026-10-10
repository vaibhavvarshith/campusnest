package com.campusnest.controller;

import com.campusnest.dto.common.ApiResponse;
import com.campusnest.dto.common.PagedResponse;
import com.campusnest.dto.user.FacultyRegistrationRequest;
import com.campusnest.dto.user.UserResponse;
import com.campusnest.service.FacultyService;
import jakarta.validation.Valid;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/faculty")
@PreAuthorize("hasRole('ADMIN')")
public class FacultyController {

    private final FacultyService facultyService;

    public FacultyController(FacultyService facultyService) {
        this.facultyService = facultyService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<PagedResponse<UserResponse>>> getFaculty(
            @RequestParam(required = false) String query,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        PagedResponse<UserResponse> facultyList = facultyService.searchFaculty(
                query, PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"))
        );
        return ResponseEntity.ok(ApiResponse.ok(facultyList));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<UserResponse>> getFacultyById(@PathVariable Long id) {
        UserResponse response = facultyService.getFacultyById(id);
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<UserResponse>> registerFaculty(
            @Valid @RequestBody FacultyRegistrationRequest request) {
        UserResponse created = facultyService.registerFaculty(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok("Faculty member registered successfully", created));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<UserResponse>> updateFaculty(
            @PathVariable Long id,
            @Valid @RequestBody FacultyRegistrationRequest request) {
        UserResponse updated = facultyService.updateFaculty(id, request);
        return ResponseEntity.ok(ApiResponse.ok("Faculty member updated successfully", updated));
    }

    @PatchMapping("/{id}/toggle-status")
    public ResponseEntity<ApiResponse<Void>> toggleStatus(@PathVariable Long id) {
        facultyService.toggleFacultyStatus(id);
        return ResponseEntity.ok(ApiResponse.ok("Faculty status toggled successfully", null));
    }

    @PostMapping("/{id}/reset-password")
    public ResponseEntity<ApiResponse<Void>> resetPassword(@PathVariable Long id) {
        facultyService.resetFacultyPassword(id);
        return ResponseEntity.ok(ApiResponse.ok("Faculty credentials reset to default password", null));
    }
}
