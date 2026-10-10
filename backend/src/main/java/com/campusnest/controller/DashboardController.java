package com.campusnest.controller;

import com.campusnest.dto.common.ApiResponse;
import com.campusnest.dto.dashboard.AdminDashboardResponse;
import com.campusnest.dto.dashboard.FacultyDashboardResponse;
import com.campusnest.dto.dashboard.StudentDashboardResponse;
import com.campusnest.security.UserPrincipal;
import com.campusnest.service.DashboardService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class DashboardController {

    private final DashboardService dashboardService;

    public DashboardController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    @GetMapping("/admin/dashboard")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<AdminDashboardResponse>> getAdminDashboard() {
        AdminDashboardResponse response = dashboardService.getAdminDashboard();
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    @GetMapping("/student/dashboard")
    @PreAuthorize("hasAnyRole('STUDENT', 'ADMIN')")
    public ResponseEntity<ApiResponse<StudentDashboardResponse>> getStudentDashboard(
            @AuthenticationPrincipal UserPrincipal studentPrincipal) {
        StudentDashboardResponse response = dashboardService.getStudentDashboard(studentPrincipal);
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    @GetMapping("/faculty/dashboard")
    @PreAuthorize("hasAnyRole('FACULTY', 'ADMIN')")
    public ResponseEntity<ApiResponse<FacultyDashboardResponse>> getFacultyDashboard(
            @AuthenticationPrincipal UserPrincipal facultyPrincipal) {
        FacultyDashboardResponse response = dashboardService.getFacultyDashboard(facultyPrincipal);
        return ResponseEntity.ok(ApiResponse.ok(response));
    }
}
