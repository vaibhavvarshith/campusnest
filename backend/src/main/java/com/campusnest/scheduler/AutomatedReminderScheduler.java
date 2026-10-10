package com.campusnest.scheduler;

import com.campusnest.entity.BorrowTransaction;
import com.campusnest.entity.Project;
import com.campusnest.entity.Student;
import com.campusnest.repository.BorrowTransactionRepository;
import com.campusnest.repository.ProjectRepository;
import com.campusnest.repository.ProjectSubmissionRepository;
import com.campusnest.repository.StudentRepository;
import com.campusnest.service.NotificationService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Component
public class AutomatedReminderScheduler {

    private static final Logger log = LoggerFactory.getLogger(AutomatedReminderScheduler.class);
    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("MMMM dd, yyyy");

    private final BorrowTransactionRepository transactionRepository;
    private final ProjectRepository projectRepository;
    private final ProjectSubmissionRepository submissionRepository;
    private final StudentRepository studentRepository;
    private final NotificationService notificationService;

    public AutomatedReminderScheduler(BorrowTransactionRepository transactionRepository,
                                      ProjectRepository projectRepository,
                                      ProjectSubmissionRepository submissionRepository,
                                      StudentRepository studentRepository,
                                      NotificationService notificationService) {
        this.transactionRepository = transactionRepository;
        this.projectRepository = projectRepository;
        this.submissionRepository = submissionRepository;
        this.studentRepository = studentRepository;
        this.notificationService = notificationService;
    }

    /**
     * Daily automated scheduled scan for book return deadlines and project deadlines.
     * Scheduled at 8:00 AM daily in Asia/Kolkata timezone.
     */
    @Scheduled(cron = "${app.scheduler.cron:0 0 8 * * ?}", zone = "Asia/Kolkata")
    public void runDailyReminders() {
        log.info("Starting automated daily deadline and reminder scan in Asia/Kolkata...");
        scanAndGenerateBookReminders(LocalDate.now());
        scanAndGenerateProjectReminders(LocalDate.now());
        log.info("Completed automated daily deadline scan successfully.");
    }

    /**
     * Scans and generates 2-day, due-today, and overdue notifications for book borrow transactions.
     */
    @Transactional
    public void scanAndGenerateBookReminders(LocalDate currentDate) {
        log.info("Scanning book return transactions for date: {}", currentDate);

        // 1. Two-day reminder (due in 2 days: dueDate == currentDate + 2)
        LocalDate twoDaysFromNow = currentDate.plusDays(2);
        List<BorrowTransaction> dueInTwoDays = transactionRepository.findActiveIssuedByDueDate(twoDaysFromNow);
        for (BorrowTransaction t : dueInTwoDays) {
            String title = "Book Return Reminder: Due in 2 Days";
            String message = String.format("Your borrowed book \"%s\" is due in 2 days, on %s. Please return it by the due date to avoid overdue fines.",
                    t.getBook().getTitle(), t.getDueDate().format(DATE_FORMATTER));

            notificationService.createNotification(
                    t.getUser(), title, message, "BOOK_RETURN_REMINDER_2DAYS", t.getId(), "BORROW_TRANSACTION"
            );
        }

        // 2. Due-today reminder (dueDate == currentDate)
        List<BorrowTransaction> dueToday = transactionRepository.findActiveIssuedByDueDate(currentDate);
        for (BorrowTransaction t : dueToday) {
            String title = "Book Return Reminder: Due Today";
            String message = String.format("Your borrowed book \"%s\" is due today (%s). Please return it to the library circulation desk today to prevent overdue fines.",
                    t.getBook().getTitle(), t.getDueDate().format(DATE_FORMATTER));

            notificationService.createNotification(
                    t.getUser(), title, message, "BOOK_DUE_TODAY", t.getId(), "BORROW_TRANSACTION"
            );
        }

        // 3. Overdue transactions (dueDate < currentDate and still ISSUED)
        List<BorrowTransaction> overdues = transactionRepository.findOverdueActiveTransactions(currentDate);
        for (BorrowTransaction t : overdues) {
            String title = "Overdue Book Alert";
            String message = String.format("Your borrowed book \"%s\" was due on %s and is now overdue. Overdue fines accumulate daily at the standard library rate.",
                    t.getBook().getTitle(), t.getDueDate().format(DATE_FORMATTER));

            notificationService.createNotification(
                    t.getUser(), title, message, "BOOK_OVERDUE", t.getId(), "BORROW_TRANSACTION"
            );
        }
    }

    /**
     * Scans and generates 2-day, due-today, and overdue reminders for academic project deadlines
     * targeting assigned academic groups who have not yet submitted.
     */
    @Transactional
    public void scanAndGenerateProjectReminders(LocalDate currentDate) {
        log.info("Scanning academic project deadlines for date: {}", currentDate);

        // 1. Two-day project deadline reminder (dueDate == currentDate + 2)
        LocalDate twoDaysFromNow = currentDate.plusDays(2);
        List<Project> projectsDueInTwoDays = projectRepository.findActiveProjectsByDueDate(twoDaysFromNow);

        for (Project project : projectsDueInTwoDays) {
            List<Student> targetStudents = getAssignedUnsubmittedStudents(project);
            for (Student student : targetStudents) {
                String title = "Academic Project Due in 2 Days";
                String message = String.format("Reminder: Your submission for project \"%s\" is due in 2 days, on %s. Please submit before the deadline.",
                        project.getTitle(), project.getDueDate().format(DATE_FORMATTER));

                notificationService.createNotification(
                        student.getUser(), title, message, "PROJECT_DEADLINE_2DAYS", project.getId(), "PROJECT"
                );
            }
        }

        // 2. Due-today project reminder (dueDate == currentDate)
        List<Project> projectsDueToday = projectRepository.findActiveProjectsByDueDate(currentDate);
        for (Project project : projectsDueToday) {
            List<Student> targetStudents = getAssignedUnsubmittedStudents(project);
            for (Student student : targetStudents) {
                String title = "Academic Project Due Today";
                String message = String.format("Final Reminder: Project \"%s\" is due today (%s). Please submit your work before midnight.",
                        project.getTitle(), project.getDueDate().format(DATE_FORMATTER));

                notificationService.createNotification(
                        student.getUser(), title, message, "PROJECT_DUE_TODAY", project.getId(), "PROJECT"
                );
            }
        }
    }

    private List<Student> getAssignedUnsubmittedStudents(Project project) {
        return studentRepository.findAll().stream()
                .filter(s -> project.getDepartment() == null || project.getDepartment().equalsIgnoreCase("All") || s.getDepartment().equalsIgnoreCase(project.getDepartment()))
                .filter(s -> s.getAcademicYear() == null ||
                             project.getAcademicYear() == null ||
                             project.getAcademicYear().equalsIgnoreCase("All") ||
                             project.getAcademicYear().equalsIgnoreCase("All Years") ||
                             project.getAcademicYear().equalsIgnoreCase(s.getAcademicYear()))
                .filter(s -> s.getSemester() == null ||
                             project.getSemester() == null ||
                             project.getSemester() == 0 ||
                             project.getSemester().equals(s.getSemester()))
                .filter(s -> s.getSection() == null ||
                             project.getSection() == null ||
                             project.getSection().equalsIgnoreCase("All") ||
                             project.getSection().equalsIgnoreCase("All Sections") ||
                             project.getSection().equalsIgnoreCase(s.getSection()))
                .filter(s -> !submissionRepository.existsByProjectIdAndStudentId(project.getId(), s.getId()))
                .toList();
    }
}
