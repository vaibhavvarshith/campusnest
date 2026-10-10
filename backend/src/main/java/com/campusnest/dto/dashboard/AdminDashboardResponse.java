package com.campusnest.dto.dashboard;

import com.campusnest.dto.book.BookResponse;
import com.campusnest.dto.project.ProjectResponse;
import com.campusnest.dto.transaction.TransactionResponse;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

public class AdminDashboardResponse {
    private long totalTitles;
    private long totalCopies;
    private long availableCopies;
    private long currentlyBorrowed;
    private long booksReturned;
    private long overdueBooks;
    private long activeStudents;
    private long activeFaculty;
    private BigDecimal outstandingFines;
    private BigDecimal finesCollected;

    private List<TransactionResponse> recentTransactions;
    private List<BookResponse> recentlyAddedBooks;
    private List<TransactionResponse> upcomingReturnDeadlines;
    private List<ProjectResponse> upcomingProjectDeadlines;

    // Charts Data
    private List<Map<String, Object>> categoryDistribution;
    private List<Map<String, Object>> mostBorrowedBooks;
    private List<Map<String, Object>> monthlyBorrowingTrends;

    public AdminDashboardResponse() {}

    public long getTotalTitles() { return totalTitles; }
    public void setTotalTitles(long totalTitles) { this.totalTitles = totalTitles; }

    public long getTotalCopies() { return totalCopies; }
    public void setTotalCopies(long totalCopies) { this.totalCopies = totalCopies; }

    public long getAvailableCopies() { return availableCopies; }
    public void setAvailableCopies(long availableCopies) { this.availableCopies = availableCopies; }

    public long getCurrentlyBorrowed() { return currentlyBorrowed; }
    public void setCurrentlyBorrowed(long currentlyBorrowed) { this.currentlyBorrowed = currentlyBorrowed; }

    public long getBooksReturned() { return booksReturned; }
    public void setBooksReturned(long booksReturned) { this.booksReturned = booksReturned; }

    public long getOverdueBooks() { return overdueBooks; }
    public void setOverdueBooks(long overdueBooks) { this.overdueBooks = overdueBooks; }

    public long getActiveStudents() { return activeStudents; }
    public void setActiveStudents(long activeStudents) { this.activeStudents = activeStudents; }

    public long getActiveFaculty() { return activeFaculty; }
    public void setActiveFaculty(long activeFaculty) { this.activeFaculty = activeFaculty; }

    public BigDecimal getOutstandingFines() { return outstandingFines; }
    public void setOutstandingFines(BigDecimal outstandingFines) { this.outstandingFines = outstandingFines; }

    public BigDecimal getFinesCollected() { return finesCollected; }
    public void setFinesCollected(BigDecimal finesCollected) { this.finesCollected = finesCollected; }

    public List<TransactionResponse> getRecentTransactions() { return recentTransactions; }
    public void setRecentTransactions(List<TransactionResponse> recentTransactions) { this.recentTransactions = recentTransactions; }

    public List<BookResponse> getRecentlyAddedBooks() { return recentlyAddedBooks; }
    public void setRecentlyAddedBooks(List<BookResponse> recentlyAddedBooks) { this.recentlyAddedBooks = recentlyAddedBooks; }

    public List<TransactionResponse> getUpcomingReturnDeadlines() { return upcomingReturnDeadlines; }
    public void setUpcomingReturnDeadlines(List<TransactionResponse> upcomingReturnDeadlines) { this.upcomingReturnDeadlines = upcomingReturnDeadlines; }

    public List<ProjectResponse> getUpcomingProjectDeadlines() { return upcomingProjectDeadlines; }
    public void setUpcomingProjectDeadlines(List<ProjectResponse> upcomingProjectDeadlines) { this.upcomingProjectDeadlines = upcomingProjectDeadlines; }

    public List<Map<String, Object>> getCategoryDistribution() { return categoryDistribution; }
    public void setCategoryDistribution(List<Map<String, Object>> categoryDistribution) { this.categoryDistribution = categoryDistribution; }

    public List<Map<String, Object>> getMostBorrowedBooks() { return mostBorrowedBooks; }
    public void setMostBorrowedBooks(List<Map<String, Object>> mostBorrowedBooks) { this.mostBorrowedBooks = mostBorrowedBooks; }

    public List<Map<String, Object>> getMonthlyBorrowingTrends() { return monthlyBorrowingTrends; }
    public void setMonthlyBorrowingTrends(List<Map<String, Object>> monthlyBorrowingTrends) { this.monthlyBorrowingTrends = monthlyBorrowingTrends; }
}
