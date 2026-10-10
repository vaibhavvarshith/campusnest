package com.campusnest.dto.dashboard;

import com.campusnest.dto.project.ProjectResponse;
import com.campusnest.dto.transaction.TransactionResponse;
import com.campusnest.entity.Notification;

import java.math.BigDecimal;
import java.util.List;

public class StudentDashboardResponse {
    private String studentName;
    private String registrationNumber;
    private String department;
    private String course;
    private String academicYear;

    private long currentlyBorrowedCount;
    private long returnedBooksCount;
    private long overdueBooksCount;

    private BigDecimal currentEstimatedFine;
    private BigDecimal outstandingFineBalance;

    private List<TransactionResponse> currentlyBorrowed;
    private List<TransactionResponse> upcomingDeadlines;
    private List<TransactionResponse> overdueBooks;
    private List<ProjectResponse> upcomingProjects;
    private List<Notification> recentNotifications;

    public StudentDashboardResponse() {}

    public String getStudentName() { return studentName; }
    public void setStudentName(String studentName) { this.studentName = studentName; }

    public String getRegistrationNumber() { return registrationNumber; }
    public void setRegistrationNumber(String registrationNumber) { this.registrationNumber = registrationNumber; }

    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }

    public String getCourse() { return course; }
    public void setCourse(String course) { this.course = course; }

    public String getAcademicYear() { return academicYear; }
    public void setAcademicYear(String academicYear) { this.academicYear = academicYear; }

    public long getCurrentlyBorrowedCount() { return currentlyBorrowedCount; }
    public void setCurrentlyBorrowedCount(long currentlyBorrowedCount) { this.currentlyBorrowedCount = currentlyBorrowedCount; }

    public long getReturnedBooksCount() { return returnedBooksCount; }
    public void setReturnedBooksCount(long returnedBooksCount) { this.returnedBooksCount = returnedBooksCount; }

    public long getOverdueBooksCount() { return overdueBooksCount; }
    public void setOverdueBooksCount(long overdueBooksCount) { this.overdueBooksCount = overdueBooksCount; }

    public BigDecimal getCurrentEstimatedFine() { return currentEstimatedFine; }
    public void setCurrentEstimatedFine(BigDecimal currentEstimatedFine) { this.currentEstimatedFine = currentEstimatedFine; }

    public BigDecimal getOutstandingFineBalance() { return outstandingFineBalance; }
    public void setOutstandingFineBalance(BigDecimal outstandingFineBalance) { this.outstandingFineBalance = outstandingFineBalance; }

    public List<TransactionResponse> getCurrentlyBorrowed() { return currentlyBorrowed; }
    public void setCurrentlyBorrowed(List<TransactionResponse> currentlyBorrowed) { this.currentlyBorrowed = currentlyBorrowed; }

    public List<TransactionResponse> getUpcomingDeadlines() { return upcomingDeadlines; }
    public void setUpcomingDeadlines(List<TransactionResponse> upcomingDeadlines) { this.upcomingDeadlines = upcomingDeadlines; }

    public List<TransactionResponse> getOverdueBooks() { return overdueBooks; }
    public void setOverdueBooks(List<TransactionResponse> overdueBooks) { this.overdueBooks = overdueBooks; }

    public List<ProjectResponse> getUpcomingProjects() { return upcomingProjects; }
    public void setUpcomingProjects(List<ProjectResponse> upcomingProjects) { this.upcomingProjects = upcomingProjects; }

    public List<Notification> getRecentNotifications() { return recentNotifications; }
    public void setRecentNotifications(List<Notification> recentNotifications) { this.recentNotifications = recentNotifications; }
}
