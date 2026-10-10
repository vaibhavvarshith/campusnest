package com.campusnest.controller;

import com.campusnest.dto.common.ApiResponse;
import com.campusnest.dto.common.PagedResponse;
import com.campusnest.dto.user.StudentRegistrationRequest;
import com.campusnest.dto.user.UserResponse;
import com.campusnest.service.StudentService;
import jakarta.validation.Valid;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/students")
@PreAuthorize("hasRole('ADMIN')")
public class StudentController {

    private final StudentService studentService;

    public StudentController(StudentService studentService) {
        this.studentService = studentService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<PagedResponse<UserResponse>>> getStudents(
            @RequestParam(required = false) String query,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        PagedResponse<UserResponse> students = studentService.searchStudents(
                query, PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"))
        );
        return ResponseEntity.ok(ApiResponse.ok(students));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<UserResponse>> getStudentById(@PathVariable Long id) {
        UserResponse response = studentService.getStudentById(id);
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<UserResponse>> registerStudent(
            @Valid @RequestBody StudentRegistrationRequest request) {
        UserResponse created = studentService.registerStudent(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok("Student registered successfully", created));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<UserResponse>> updateStudent(
            @PathVariable Long id,
            @Valid @RequestBody StudentRegistrationRequest request) {
        UserResponse updated = studentService.updateStudent(id, request);
        return ResponseEntity.ok(ApiResponse.ok("Student updated successfully", updated));
    }

    @PatchMapping("/{id}/toggle-status")
    public ResponseEntity<ApiResponse<Void>> toggleStatus(@PathVariable Long id) {
        studentService.toggleStudentStatus(id);
        return ResponseEntity.ok(ApiResponse.ok("Student status toggled successfully", null));
    }

    @PostMapping("/{id}/reset-password")
    public ResponseEntity<ApiResponse<Void>> resetPassword(@PathVariable Long id) {
        studentService.resetStudentPassword(id);
        return ResponseEntity.ok(ApiResponse.ok("Student credentials reset to initial DOB password", null));
    }
}
