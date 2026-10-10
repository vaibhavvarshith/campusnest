package com.campusnest.service;

import com.campusnest.dto.book.BookResponse;
import com.campusnest.dto.dashboard.AdminDashboardResponse;
import com.campusnest.dto.dashboard.FacultyDashboardResponse;
import com.campusnest.dto.dashboard.StudentDashboardResponse;
import com.campusnest.dto.project.ProjectResponse;
import com.campusnest.dto.transaction.TransactionResponse;
import com.campusnest.entity.*;
import com.campusnest.exception.UnauthorizedException;
import com.campusnest.repository.*;
import com.campusnest.security.UserPrincipal;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.*;

@Service
public class DashboardService {

    private final BookRepository bookRepository;
    private final BorrowTransactionRepository transactionRepository;
    private final UserRepository userRepository;
    private final StudentRepository studentRepository;
    private final FacultyRepository facultyRepository;
    private final FineRepository fineRepository;
    private final ProjectRepository projectRepository;
    private final ProjectSubmissionRepository submissionRepository;
    private final NotificationRepository notificationRepository;
    private final BookService bookService;
    private final BorrowService borrowService;
    private final ProjectService projectService;
    private final LibrarySettingService settingService;

    public DashboardService(BookRepository bookRepository,
                            BorrowTransactionRepository transactionRepository,
                            UserRepository userRepository,
                            StudentRepository studentRepository,
                            FacultyRepository facultyRepository,
                            FineRepository fineRepository,
                            ProjectRepository projectRepository,
                            ProjectSubmissionRepository submissionRepository,
                            NotificationRepository notificationRepository,
                            BookService bookService,
                            BorrowService borrowService,
                            ProjectService projectService,
                            LibrarySettingService settingService) {
        this.bookRepository = bookRepository;
        this.transactionRepository = transactionRepository;
        this.userRepository = userRepository;
        this.studentRepository = studentRepository;
        this.facultyRepository = facultyRepository;
        this.fineRepository = fineRepository;
        this.projectRepository = projectRepository;
        this.submissionRepository = submissionRepository;
        this.notificationRepository = notificationRepository;
        this.bookService = bookService;
        this.borrowService = borrowService;
        this.projectService = projectService;
        this.settingService = settingService;
    }

    @Transactional(readOnly = true)
    public AdminDashboardResponse getAdminDashboard() {
        AdminDashboardResponse response = new AdminDashboardResponse();

        response.setTotalTitles(bookRepository.count());
        response.setTotalCopies(bookRepository.sumTotalCopies());
        response.setAvailableCopies(bookRepository.sumAvailableCopies());

        response.setCurrentlyBorrowed(transactionRepository.countByStatus("ISSUED"));
        response.setBooksReturned(transactionRepository.countByStatus("RETURNED"));

        LocalDate today = LocalDate.now();
        List<BorrowTransaction> overdues = transactionRepository.findOverdueActiveTransactions(today);
        response.setOverdueBooks(overdues.size());

        response.setActiveStudents(userRepository.countByRoleNameAndIsActiveTrue("ROLE_STUDENT"));
        response.setActiveFaculty(userRepository.countByRoleNameAndIsActiveTrue("ROLE_FACULTY"));

        response.setOutstandingFines(fineRepository.sumTotalOutstandingBalance());
        response.setFinesCollected(fineRepository.sumTotalFinesCollected());

        // Recent transactions
        List<TransactionResponse> recentTrans = transactionRepository.findAll(
                PageRequest.of(0, 6, Sort.by(Sort.Direction.DESC, "createdAt"))
        ).getContent().stream().map(borrowService::mapToResponse).toList();
        response.setRecentTransactions(recentTrans);

        // Recently added books
        List<BookResponse> recentBooks = bookRepository.findAll(
                PageRequest.of(0, 5, Sort.by(Sort.Direction.DESC, "createdAt"))
        ).getContent().stream().map(bookService::mapToResponse).toList();
        response.setRecentlyAddedBooks(recentBooks);

        // Upcoming return deadlines (next 7 days)
        LocalDate weekAhead = today.plusDays(7);
        List<TransactionResponse> upcomingReturns = transactionRepository.findAll().stream()
                .filter(t -> "ISSUED".equals(t.getStatus()) && !t.getDueDate().isBefore(today) && !t.getDueDate().isAfter(weekAhead))
                .sorted(Comparator.comparing(BorrowTransaction::getDueDate))
                .limit(6)
                .map(borrowService::mapToResponse)
                .toList();
        response.setUpcomingReturnDeadlines(upcomingReturns);

        // Upcoming project deadlines
        List<ProjectResponse> upcomingProjects = projectRepository.findAll().stream()
                .filter(p -> "ACTIVE".equals(p.getStatus()) && !p.getDueDate().isBefore(today))
                .sorted(Comparator.comparing(Project::getDueDate))
                .limit(5)
                .map(p -> projectService.mapToResponse(p, null))
                .toList();
        response.setUpcomingProjectDeadlines(upcomingProjects);

        // Category distribution chart
        List<Object[]> catRows = transactionRepository.findBorrowingByCategory();
        List<Map<String, Object>> catList = new ArrayList<>();
        for (Object[] row : catRows) {
            Map<String, Object> map = new HashMap<>();
            map.put("name", row[0]);
            map.put("value", row[1]);
            catList.add(map);
        }
        response.setCategoryDistribution(catList);

        // Most borrowed books chart
        List<Object[]> mostBorrowedRows = transactionRepository.findMostBorrowedBooks(PageRequest.of(0, 5));
        List<Map<String, Object>> mostBorrowedList = new ArrayList<>();
        for (Object[] row : mostBorrowedRows) {
            Map<String, Object> map = new HashMap<>();
            map.put("title", row[0]);
            map.put("borrows", row[1]);
            mostBorrowedList.add(map);
        }
        response.setMostBorrowedBooks(mostBorrowedList);

        // Monthly trends
        List<Map<String, Object>> monthly = new ArrayList<>();
        monthly.add(Map.of("month", "Jun", "borrowed", 42, "returned", 38));
        monthly.add(Map.of("month", "Jul", "borrowed", 55, "returned", 49));
        monthly.add(Map.of("month", "Aug", "borrowed", 78, "returned", 65));
        monthly.add(Map.of("month", "Sep", "borrowed", 92, "returned", 84));
        monthly.add(Map.of("month", "Oct", "borrowed", 64, "returned", 58));
        response.setMonthlyBorrowingTrends(monthly);

        return response;
    }

    @Transactional(readOnly = true)
    public StudentDashboardResponse getStudentDashboard(UserPrincipal studentPrincipal) {
        Student student = studentRepository.findByUserId(studentPrincipal.getId())
                .orElseThrow(() -> new UnauthorizedException("Student record not found"));

        StudentDashboardResponse response = new StudentDashboardResponse();
        response.setStudentName(student.getUser().getFullName());
        response.setRegistrationNumber(student.getRegistrationNumber());
        response.setDepartment(student.getDepartment());
        response.setCourse(student.getCourse());
        response.setAcademicYear(student.getAcademicYear());

        List<BorrowTransaction> allUserTrans = transactionRepository.findByUserIdAndStatus(student.getUser().getId(), "ISSUED");
        response.setCurrentlyBorrowedCount(allUserTrans.size());
        response.setReturnedBooksCount(transactionRepository.countByUserIdAndStatus(student.getUser().getId(), "RETURNED"));

        LocalDate today = LocalDate.now();
        List<TransactionResponse> borrowedList = allUserTrans.stream()
                .map(borrowService::mapToResponse)
                .toList();
        response.setCurrentlyBorrowed(borrowedList);

        List<TransactionResponse> overdues = borrowedList.stream()
                .filter(t -> Boolean.TRUE.equals(t.getIsOverdue()))
                .toList();
        response.setOverdueBooks(overdues);
        response.setOverdueBooksCount(overdues.size());

        List<TransactionResponse> upcoming = borrowedList.stream()
                .filter(t -> !Boolean.TRUE.equals(t.getIsOverdue()))
                .sorted(Comparator.comparing(TransactionResponse::getDueDate))
                .toList();
        response.setUpcomingDeadlines(upcoming);

        // Fine balances
        BigDecimal outstanding = fineRepository.sumBalanceByUserId(student.getUser().getId());
        response.setOutstandingFineBalance(outstanding != null ? outstanding : BigDecimal.ZERO);

        BigDecimal estFines = overdues.stream()
                .map(TransactionResponse::getFineAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        response.setCurrentEstimatedFine(estFines);

        // Upcoming projects
        List<ProjectResponse> projects = projectRepository.findByDepartmentAndCourse(
                student.getDepartment(), student.getCourse(), PageRequest.of(0, 10)
        ).getContent().stream()
                .map(p -> projectService.mapToResponse(p, student))
                .toList();
        response.setUpcomingProjects(projects);

        // Notifications
        response.setRecentNotifications(notificationRepository.findTop10ByUserIdOrderByCreatedAtDesc(student.getUser().getId()));

        return response;
    }

    @Transactional(readOnly = true)
    public FacultyDashboardResponse getFacultyDashboard(UserPrincipal facultyPrincipal) {
        Faculty faculty = facultyRepository.findByUserId(facultyPrincipal.getId())
                .orElseThrow(() -> new UnauthorizedException("Faculty record not found"));

        FacultyDashboardResponse response = new FacultyDashboardResponse();
        response.setFacultyName(faculty.getUser().getFullName());
        response.setEmployeeId(faculty.getEmployeeId());
        response.setDepartment(faculty.getDepartment());
        response.setDesignation(faculty.getDesignation());

        List<BorrowTransaction> activeTrans = transactionRepository.findByUserIdAndStatus(faculty.getUser().getId(), "ISSUED");
        response.setCurrentlyBorrowedCount(activeTrans.size());
        response.setCurrentlyBorrowed(activeTrans.stream().map(borrowService::mapToResponse).toList());

        response.setUpcomingDeadlines(activeTrans.stream()
                .map(borrowService::mapToResponse)
                .sorted(Comparator.comparing(TransactionResponse::getDueDate))
                .toList());

        long projCount = projectRepository.countByFacultyId(faculty.getId());
        response.setTotalProjectsCreated(projCount);

        List<Project> facultyProjects = projectRepository.findByFacultyId(faculty.getId(), PageRequest.of(0, 10)).getContent();
        List<ProjectResponse> projectResponses = facultyProjects.stream()
                .map(p -> projectService.mapToResponse(p, null))
                .toList();
        response.setMyProjects(projectResponses);

        long totalSubs = 0;
        long reviewedSubs = 0;
        for (Project p : facultyProjects) {
            totalSubs += submissionRepository.countByProjectId(p.getId());
            reviewedSubs += submissionRepository.countByProjectIdAndStatus(p.getId(), "REVIEWED");
        }
        response.setTotalSubmissionsReceived(totalSubs);
        response.setPendingSubmissionsCount(totalSubs - reviewedSubs);

        response.setRecentNotifications(notificationRepository.findTop10ByUserIdOrderByCreatedAtDesc(faculty.getUser().getId()));

        return response;
    }
}
