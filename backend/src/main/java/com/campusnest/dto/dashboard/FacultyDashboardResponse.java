package com.campusnest.dto.dashboard;

import com.campusnest.dto.project.ProjectResponse;
import com.campusnest.dto.transaction.TransactionResponse;
import com.campusnest.entity.Notification;

import java.util.List;

public class FacultyDashboardResponse {
    private String facultyName;
    private String employeeId;
    private String department;
    private String designation;

    private long currentlyBorrowedCount;
    private long totalProjectsCreated;
    private long totalSubmissionsReceived;
    private long pendingSubmissionsCount;

    private List<TransactionResponse> currentlyBorrowed;
    private List<TransactionResponse> upcomingDeadlines;
    private List<ProjectResponse> myProjects;
    private List<Notification> recentNotifications;

    public FacultyDashboardResponse() {}

    public String getFacultyName() { return facultyName; }
    public void setFacultyName(String facultyName) { this.facultyName = facultyName; }

    public String getEmployeeId() { return employeeId; }
    public void setEmployeeId(String employeeId) { this.employeeId = employeeId; }

    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }

    public String getDesignation() { return designation; }
    public void setDesignation(String designation) { this.designation = designation; }

    public long getCurrentlyBorrowedCount() { return currentlyBorrowedCount; }
    public void setCurrentlyBorrowedCount(long currentlyBorrowedCount) { this.currentlyBorrowedCount = currentlyBorrowedCount; }

    public long getTotalProjectsCreated() { return totalProjectsCreated; }
    public void setTotalProjectsCreated(long totalProjectsCreated) { this.totalProjectsCreated = totalProjectsCreated; }

    public long getTotalSubmissionsReceived() { return totalSubmissionsReceived; }
    public void setTotalSubmissionsReceived(long totalSubmissionsReceived) { this.totalSubmissionsReceived = totalSubmissionsReceived; }

    public long getPendingSubmissionsCount() { return pendingSubmissionsCount; }
    public void setPendingSubmissionsCount(long pendingSubmissionsCount) { this.pendingSubmissionsCount = pendingSubmissionsCount; }

    public List<TransactionResponse> getCurrentlyBorrowed() { return currentlyBorrowed; }
    public void setCurrentlyBorrowed(List<TransactionResponse> currentlyBorrowed) { this.currentlyBorrowed = currentlyBorrowed; }

    public List<TransactionResponse> getUpcomingDeadlines() { return upcomingDeadlines; }
    public void setUpcomingDeadlines(List<TransactionResponse> upcomingDeadlines) { this.upcomingDeadlines = upcomingDeadlines; }

    public List<ProjectResponse> getMyProjects() { return myProjects; }
    public void setMyProjects(List<ProjectResponse> myProjects) { this.myProjects = myProjects; }

    public List<Notification> getRecentNotifications() { return recentNotifications; }
    public void setRecentNotifications(List<Notification> recentNotifications) { this.recentNotifications = recentNotifications; }
}
