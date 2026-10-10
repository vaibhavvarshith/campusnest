package com.campusnest.controller;

import com.campusnest.dto.common.ApiResponse;
import com.campusnest.dto.project.ProjectRequest;
import com.campusnest.dto.project.ProjectResponse;
import com.campusnest.dto.subjecthead.SubjectHeadDashboardResponse;
import com.campusnest.security.UserPrincipal;
import com.campusnest.service.SubjectHeadService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/subject-head")
@PreAuthorize("hasAnyRole('SUBJECT_HEAD', 'ADMIN')")
public class SubjectHeadController {

    private final SubjectHeadService subjectHeadService;

    public SubjectHeadController(SubjectHeadService subjectHeadService) {
        this.subjectHeadService = subjectHeadService;
    }

    @GetMapping("/dashboard")
    public ResponseEntity<ApiResponse<SubjectHeadDashboardResponse>> getDashboard(
            @AuthenticationPrincipal UserPrincipal principal) {
        SubjectHeadDashboardResponse response = subjectHeadService.getDashboard(principal);
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    @PostMapping({"/projects", "/allocate"})
    public ResponseEntity<ApiResponse<ProjectResponse>> allocateProject(
            @Valid @RequestBody ProjectRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        ProjectResponse response = subjectHeadService.allocateProject(request, principal);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok("Assignment successfully allocated", response));
    }

    @RequestMapping(value = {"/projects/{id}/reassign", "/reassign/{id}"}, method = {RequestMethod.POST, RequestMethod.PUT})
    public ResponseEntity<ApiResponse<ProjectResponse>> reassignProject(
            @PathVariable Long id,
            @RequestParam(required = false) Long newFacultyId,
            @RequestParam(required = false) String priority,
            @RequestParam(required = false) Integer priorityRank,
            @AuthenticationPrincipal UserPrincipal principal) {
        ProjectResponse response = subjectHeadService.reassignProject(id, newFacultyId, priority, priorityRank, principal);
        return ResponseEntity.ok(ApiResponse.ok("Assignment successfully reassigned", response));
    }

    @PostMapping({"/projects/{id}/publish", "/publish/{id}"})
    public ResponseEntity<ApiResponse<ProjectResponse>> publishProject(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal principal) {
        ProjectResponse response = subjectHeadService.publishProject(id, principal);
        return ResponseEntity.ok(ApiResponse.ok("Assignment published for enrolled students", response));
    }

    @PutMapping({"/update-status/{id}", "/projects/{id}/status"})
    public ResponseEntity<ApiResponse<ProjectResponse>> updateStatus(
            @PathVariable Long id,
            @RequestParam String status,
            @AuthenticationPrincipal UserPrincipal principal) {
        ProjectResponse response = subjectHeadService.updateStatus(id, status, principal);
        return ResponseEntity.ok(ApiResponse.ok("Assignment status updated to " + status, response));
    }
}
