package com.campusnest.dto.project;

import java.time.LocalDate;
import java.time.LocalDateTime;

public class ProjectResponse {
    private Long id;
    private Long facultyId;
    private String facultyName;
    private String facultyEmployeeId;
    private String title;
    private String description;
    private String department;
    private String course;
    private LocalDate startDate;
    private LocalDate dueDate;
    private Long daysRemaining;
    private Boolean isOverdue;
    private String status;
    private Long totalSubmissions;
    private Long reviewedSubmissions;
    private Boolean studentSubmitted;
    private String studentSubmissionStatus;
    private LocalDateTime createdAt;

    public ProjectResponse() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getFacultyId() { return facultyId; }
    public void setFacultyId(Long facultyId) { this.facultyId = facultyId; }

    public String getFacultyName() { return facultyName; }
    public void setFacultyName(String facultyName) { this.facultyName = facultyName; }

    public String getFacultyEmployeeId() { return facultyEmployeeId; }
    public void setFacultyEmployeeId(String facultyEmployeeId) { this.facultyEmployeeId = facultyEmployeeId; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }

    public String getCourse() { return course; }
    public void setCourse(String course) { this.course = course; }

    public LocalDate getStartDate() { return startDate; }
    public void setStartDate(LocalDate startDate) { this.startDate = startDate; }

    public LocalDate getDueDate() { return dueDate; }
    public void setDueDate(LocalDate dueDate) { this.dueDate = dueDate; }

    public Long getDaysRemaining() { return daysRemaining; }
    public void setDaysRemaining(Long daysRemaining) { this.daysRemaining = daysRemaining; }

    public Boolean getIsOverdue() { return isOverdue; }
    public void setIsOverdue(Boolean overdue) { isOverdue = overdue; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public Long getTotalSubmissions() { return totalSubmissions; }
    public void setTotalSubmissions(Long totalSubmissions) { this.totalSubmissions = totalSubmissions; }

    public Long getReviewedSubmissions() { return reviewedSubmissions; }
    public void setReviewedSubmissions(Long reviewedSubmissions) { this.reviewedSubmissions = reviewedSubmissions; }

    public Boolean getStudentSubmitted() { return studentSubmitted; }
    public void setStudentSubmitted(Boolean studentSubmitted) { this.studentSubmitted = studentSubmitted; }

    public String getStudentSubmissionStatus() { return studentSubmissionStatus; }
    public void setStudentSubmissionStatus(String studentSubmissionStatus) { this.studentSubmissionStatus = studentSubmissionStatus; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
