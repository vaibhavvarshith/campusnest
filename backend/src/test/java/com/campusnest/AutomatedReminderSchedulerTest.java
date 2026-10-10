package com.campusnest;

import com.campusnest.entity.*;
import com.campusnest.repository.BorrowTransactionRepository;
import com.campusnest.repository.ProjectRepository;
import com.campusnest.repository.StudentRepository;
import com.campusnest.scheduler.AutomatedReminderScheduler;
import com.campusnest.service.NotificationService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.List;

import static org.mockito.ArgumentMatchers.contains;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class AutomatedReminderSchedulerTest {

    @Mock
    private BorrowTransactionRepository transactionRepository;

    @Mock
    private ProjectRepository projectRepository;

    @Mock
    private StudentRepository studentRepository;

    @Mock
    private NotificationService notificationService;

    @InjectMocks
    private AutomatedReminderScheduler reminderScheduler;

    private User studentUser;
    private Book book;
    private BorrowTransaction transactionDueInTwoDays;
    private Project projectDueInTwoDays;
    private Student student;

    @BeforeEach
    void setUp() {
        Role role = new Role("ROLE_STUDENT", "Student");
        studentUser = new User();
        studentUser.setId(2L);
        studentUser.setUsername("STU2026001");
        studentUser.setFullName("Arjun Sharma");
        studentUser.setRole(role);

        book = new Book();
        book.setId(10L);
        book.setTitle("Introduction to Algorithms");

        LocalDate today = LocalDate.of(2026, 10, 10);

        transactionDueInTwoDays = new BorrowTransaction();
        transactionDueInTwoDays.setId(101L);
        transactionDueInTwoDays.setUser(studentUser);
        transactionDueInTwoDays.setBook(book);
        transactionDueInTwoDays.setDueDate(today.plusDays(2)); // Oct 12
        transactionDueInTwoDays.setStatus("ISSUED");

        Faculty faculty = new Faculty();
        faculty.setId(1L);
        User facultyUser = new User();
        facultyUser.setFullName("Dr. Rajesh Kumar");
        faculty.setUser(facultyUser);
        faculty.setEmployeeId("FAC2026001");

        projectDueInTwoDays = new Project();
        projectDueInTwoDays.setId(201L);
        projectDueInTwoDays.setTitle("Distributed Key-Value Store");
        projectDueInTwoDays.setFaculty(faculty);
        projectDueInTwoDays.setDepartment("Computer Science");
        projectDueInTwoDays.setCourse("B.Tech CSE");
        projectDueInTwoDays.setDueDate(today.plusDays(2)); // Oct 12
        projectDueInTwoDays.setStatus("ACTIVE");

        student = new Student();
        student.setId(1L);
        student.setUser(studentUser);
        student.setDepartment("Computer Science");
        student.setCourse("B.Tech CSE");
    }

    @Test
    @DisplayName("Should generate 2-day reminder notification for books due in exactly 2 days")
    void testTwoDayBookReturnReminder() {
        LocalDate testDate = LocalDate.of(2026, 10, 10);
        LocalDate dueDate = testDate.plusDays(2); // Oct 12

        when(transactionRepository.findActiveIssuedByDueDate(dueDate))
                .thenReturn(List.of(transactionDueInTwoDays));

        reminderScheduler.scanAndGenerateBookReminders(testDate);

        verify(notificationService, times(1)).createNotification(
                eq(studentUser),
                eq("Book Return Reminder: Due in 2 Days"),
                contains("due in 2 days"),
                eq("BOOK_RETURN_REMINDER_2DAYS"),
                eq(101L),
                eq("BORROW_TRANSACTION")
        );
    }

    @Test
    @DisplayName("Should generate 2-day project deadline reminder for enrolled students")
    void testTwoDayProjectDeadlineReminder() {
        LocalDate testDate = LocalDate.of(2026, 10, 10);
        LocalDate dueDate = testDate.plusDays(2); // Oct 12

        when(projectRepository.findActiveProjectsByDueDate(dueDate))
                .thenReturn(List.of(projectDueInTwoDays));
        when(studentRepository.findAll())
                .thenReturn(List.of(student));

        reminderScheduler.scanAndGenerateProjectReminders(testDate);

        verify(notificationService, times(1)).createNotification(
                eq(studentUser),
                eq("Academic Project Due in 2 Days"),
                contains("Distributed Key-Value Store"),
                eq("PROJECT_DEADLINE_2DAYS"),
                eq(201L),
                eq("PROJECT")
        );
    }
}
