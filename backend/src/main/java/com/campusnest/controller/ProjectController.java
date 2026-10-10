package com.campusnest.controller;

import com.campusnest.dto.common.ApiResponse;
import com.campusnest.dto.common.PagedResponse;
import com.campusnest.dto.project.*;
import com.campusnest.security.UserPrincipal;
import com.campusnest.service.ProjectService;
import jakarta.validation.Valid;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
public class ProjectController {

    private final ProjectService projectService;

    public ProjectController(ProjectService projectService) {
        this.projectService = projectService;
    }

    @PostMapping("/faculty/projects")
    @PreAuthorize("hasAnyRole('FACULTY', 'ADMIN')")
    public ResponseEntity<ApiResponse<ProjectResponse>> createProject(
            @Valid @RequestBody ProjectRequest request,
            @AuthenticationPrincipal UserPrincipal facultyPrincipal) {
        ProjectResponse response = projectService.createProject(request, facultyPrincipal);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok("Project created successfully", response));
    }

    @PutMapping("/faculty/projects/{id}")
    @PreAuthorize("hasAnyRole('FACULTY', 'ADMIN')")
    public ResponseEntity<ApiResponse<ProjectResponse>> updateProject(
            @PathVariable Long id,
            @Valid @RequestBody ProjectRequest request,
            @AuthenticationPrincipal UserPrincipal facultyPrincipal) {
        ProjectResponse response = projectService.updateProject(id, request, facultyPrincipal);
        return ResponseEntity.ok(ApiResponse.ok("Project updated successfully", response));
    }

    @GetMapping("/faculty/projects")
    @PreAuthorize("hasAnyRole('FACULTY', 'ADMIN')")
    public ResponseEntity<ApiResponse<PagedResponse<ProjectResponse>>> getFacultyProjects(
            @AuthenticationPrincipal UserPrincipal facultyPrincipal,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        PagedResponse<ProjectResponse> response = projectService.getFacultyProjects(
                facultyPrincipal, PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "dueDate"))
        );
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    @GetMapping("/student/projects")
    @PreAuthorize("hasAnyRole('STUDENT', 'ADMIN')")
    public ResponseEntity<ApiResponse<PagedResponse<ProjectResponse>>> getStudentProjects(
            @AuthenticationPrincipal UserPrincipal studentPrincipal,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        PagedResponse<ProjectResponse> response = projectService.getStudentAssignedProjects(
                studentPrincipal, PageRequest.of(page, size, Sort.by(Sort.Direction.ASC, "dueDate"))
        );
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    @GetMapping("/projects/{id}")
    public ResponseEntity<ApiResponse<ProjectResponse>> getProjectById(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal principal) {
        ProjectResponse response = projectService.getProjectById(id, principal);
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    @PostMapping("/student/projects/submit")
    @PreAuthorize("hasAnyRole('STUDENT', 'ADMIN')")
    public ResponseEntity<ApiResponse<SubmissionResponse>> submitProject(
            @Valid @RequestBody SubmissionRequest request,
            @AuthenticationPrincipal UserPrincipal studentPrincipal) {
        SubmissionResponse response = projectService.submitProject(request, studentPrincipal);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok("Assignment submitted successfully", response));
    }

    @GetMapping("/student/projects/my-submissions")
    @PreAuthorize("hasAnyRole('STUDENT', 'ADMIN')")
    public ResponseEntity<ApiResponse<List<SubmissionResponse>>> getMySubmissions(
            @AuthenticationPrincipal UserPrincipal studentPrincipal) {
        List<SubmissionResponse> responses = projectService.getStudentSubmissions(studentPrincipal);
        return ResponseEntity.ok(ApiResponse.ok(responses));
    }

    @PostMapping("/faculty/projects/submissions/{id}/grade")
    @PreAuthorize("hasAnyRole('FACULTY', 'ADMIN')")
    public ResponseEntity<ApiResponse<SubmissionResponse>> gradeSubmission(
            @PathVariable Long id,
            @Valid @RequestBody GradeSubmissionRequest request,
            @AuthenticationPrincipal UserPrincipal facultyPrincipal) {
        SubmissionResponse response = projectService.gradeSubmission(id, request, facultyPrincipal);
        return ResponseEntity.ok(ApiResponse.ok("Submission evaluated successfully", response));
    }

    @GetMapping("/faculty/projects/{id}/submissions")
    @PreAuthorize("hasAnyRole('FACULTY', 'ADMIN')")
    public ResponseEntity<ApiResponse<PagedResponse<SubmissionResponse>>> getProjectSubmissions(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal facultyPrincipal,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "15") int size) {
        PagedResponse<SubmissionResponse> response = projectService.getSubmissionsForProject(
                id, facultyPrincipal, PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "submissionDate"))
        );
        return ResponseEntity.ok(ApiResponse.ok(response));
    }
}
