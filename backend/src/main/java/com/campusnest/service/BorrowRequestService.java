package com.campusnest.service;

import com.campusnest.dto.borrow.BorrowRequestCreateDto;
import com.campusnest.dto.borrow.BorrowRequestResponse;
import com.campusnest.dto.common.PagedResponse;
import com.campusnest.entity.*;
import com.campusnest.exception.BadRequestException;
import com.campusnest.exception.ResourceNotFoundException;
import com.campusnest.exception.UnauthorizedException;
import com.campusnest.repository.*;
import com.campusnest.security.UserPrincipal;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
public class BorrowRequestService {

    private final BorrowRequestRepository borrowRequestRepository;
    private final BookRepository bookRepository;
    private final UserRepository userRepository;
    private final StudentRepository studentRepository;
    private final FacultyRepository facultyRepository;
    private final BorrowTransactionRepository transactionRepository;
    private final LibrarySettingRepository settingRepository;
    private final NotificationService notificationService;

    public BorrowRequestService(BorrowRequestRepository borrowRequestRepository,
                                BookRepository bookRepository,
                                UserRepository userRepository,
                                StudentRepository studentRepository,
                                FacultyRepository facultyRepository,
                                BorrowTransactionRepository transactionRepository,
                                LibrarySettingRepository settingRepository,
                                NotificationService notificationService) {
        this.borrowRequestRepository = borrowRequestRepository;
        this.bookRepository = bookRepository;
        this.userRepository = userRepository;
        this.studentRepository = studentRepository;
        this.facultyRepository = facultyRepository;
        this.transactionRepository = transactionRepository;
        this.settingRepository = settingRepository;
        this.notificationService = notificationService;
    }

    /**
     * Creates a new borrow request for an authenticated student or faculty member.
     */
    @Transactional
    public BorrowRequestResponse createBorrowRequest(BorrowRequestCreateDto dto, UserPrincipal principal) {
        User user = userRepository.findById(principal.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (!user.getIsActive()) {
            throw new BadRequestException("Your account is currently inactive. Please contact the library administrator.");
        }

        Book book = bookRepository.findById(dto.getBookId())
                .orElseThrow(() -> new ResourceNotFoundException("Book not found with id: " + dto.getBookId()));

        if (book.getAvailableCopies() <= 0) {
            throw new BadRequestException("Currently Unavailable: All " + book.getTotalCopies() + " copies of \"" + book.getTitle() + "\" are currently issued.");
        }

        // Prevent duplicate pending requests for the same book
        boolean hasPending = borrowRequestRepository.existsByUserIdAndBookIdAndStatus(user.getId(), book.getId(), "PENDING");
        if (hasPending) {
            throw new BadRequestException("You already have a pending borrow request for \"" + book.getTitle() + "\".");
        }

        // Check if user already has this book borrowed and active
        boolean alreadyBorrowed = transactionRepository.existsByUserIdAndBookIdAndStatus(user.getId(), book.getId(), "ISSUED");
        if (alreadyBorrowed) {
            throw new BadRequestException("You currently have an active borrowed copy of \"" + book.getTitle() + "\".");
        }

        // Check borrowing quota limits
        int maxAllowed = "ROLE_FACULTY".equals(user.getRole().getName()) ? 6 : 3;
        try {
            String key = "ROLE_FACULTY".equals(user.getRole().getName()) ? "faculty_max_books" : "student_max_books";
            LibrarySetting setting = settingRepository.findBySettingKey(key).orElse(null);
            if (setting != null) {
                maxAllowed = Integer.parseInt(setting.getSettingValue());
            }
        } catch (Exception ignored) {}

        long activeLoans = transactionRepository.countActiveIssuedByUserId(user.getId());
        long pendingReqs = borrowRequestRepository.findByUserIdAndStatus(user.getId(), "PENDING").size();
        if ((activeLoans + pendingReqs) >= maxAllowed) {
            throw new BadRequestException("Borrowing limit reached: You have " + activeLoans + " active book(s) and " +
                    pendingReqs + " pending request(s). Maximum permitted is " + maxAllowed + ".");
        }

        BorrowRequest request = new BorrowRequest();
        request.setBook(book);
        request.setUser(user);
        request.setRequestDate(LocalDateTime.now());
        request.setStatus("PENDING");
        request.setAdminNotes(dto.getNotes());

        BorrowRequest saved = borrowRequestRepository.save(request);

        // Notify user
        notificationService.createNotification(
                user,
                "Borrow Request Submitted",
                "Your request for \"" + book.getTitle() + "\" has been submitted successfully. A librarian will review and issue your copy.",
                "BORROW_REQUEST_SUBMITTED",
                saved.getId(),
                "BORROW_REQUEST"
        );

        return mapToResponse(saved);
    }

    /**
     * Approves a borrow request, locks inventory, decrements copy count, creates BorrowTransaction.
     */
    @Transactional
    public BorrowRequestResponse approveAndIssueRequest(Long requestId, UserPrincipal librarianPrincipal) {
        BorrowRequest request = borrowRequestRepository.findById(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("Borrow request not found with id: " + requestId));

        if (!"PENDING".equals(request.getStatus())) {
            throw new BadRequestException("This request has already been processed with status: " + request.getStatus());
        }

        User librarian = userRepository.findById(librarianPrincipal.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Librarian user not found"));

        User borrower = request.getUser();
        if (!borrower.getIsActive()) {
            throw new BadRequestException("Borrower account is inactive. Cannot issue books.");
        }

        // Concurrency protection: Pessimistic write lock on the book
        Book book = bookRepository.findByIdWithLock(request.getBook().getId())
                .orElseThrow(() -> new ResourceNotFoundException("Book not found"));

        if (book.getAvailableCopies() <= 0) {
            throw new BadRequestException("No available copies of \"" + book.getTitle() + "\" to issue.");
        }

        // Decrement available copies
        book.setAvailableCopies(book.getAvailableCopies() - 1);
        bookRepository.save(book);

        // Determine borrow period (14 days for student, 30 days for faculty)
        int loanDays = "ROLE_FACULTY".equals(borrower.getRole().getName()) ? 30 : 14;
        try {
            String key = "ROLE_FACULTY".equals(borrower.getRole().getName()) ? "faculty_borrow_days" : "student_borrow_days";
            LibrarySetting setting = settingRepository.findBySettingKey(key).orElse(null);
            if (setting != null) {
                loanDays = Integer.parseInt(setting.getSettingValue());
            }
        } catch (Exception ignored) {}

        LocalDate issueDate = LocalDate.now();
        LocalDate dueDate = issueDate.plusDays(loanDays);

        // Create transaction
        BorrowTransaction transaction = new BorrowTransaction();
        transaction.setBook(book);
        transaction.setUser(borrower);
        transaction.setIssueDate(issueDate);
        transaction.setDueDate(dueDate);
        transaction.setStatus("ISSUED");
        transaction.setIssuedByAdmin(librarian);
        transaction.setNotes("Issued via online borrow request #" + request.getId());
        transactionRepository.save(transaction);

        // Update request status
        request.setStatus("APPROVED");
        request.setProcessedByAdmin(librarian);
        request.setProcessedAt(LocalDateTime.now());
        BorrowRequest updated = borrowRequestRepository.save(request);

        // Send confirmation notification
        DateTimeFormatter df = DateTimeFormatter.ofPattern("MMMM dd, yyyy");
        notificationService.createNotification(
                borrower,
                "Book Issued: " + book.getTitle(),
                "Your request for \"" + book.getTitle() + "\" has been approved and issued. Return due date: " + dueDate.format(df) + ".",
                "BOOK_ISSUED",
                transaction.getId(),
                "BORROW_TRANSACTION"
        );

        return mapToResponse(updated);
    }

    /**
     * Rejects a borrow request with an optional reason.
     */
    @Transactional
    public BorrowRequestResponse rejectRequest(Long requestId, String reason, UserPrincipal librarianPrincipal) {
        BorrowRequest request = borrowRequestRepository.findById(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("Borrow request not found with id: " + requestId));

        if (!"PENDING".equals(request.getStatus())) {
            throw new BadRequestException("Request is not pending. Current status: " + request.getStatus());
        }

        User librarian = userRepository.findById(librarianPrincipal.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Librarian user not found"));

        request.setStatus("REJECTED");
        request.setAdminNotes(reason != null && !reason.isBlank() ? reason : "Request declined by librarian.");
        request.setProcessedByAdmin(librarian);
        request.setProcessedAt(LocalDateTime.now());
        BorrowRequest updated = borrowRequestRepository.save(request);

        notificationService.createNotification(
                request.getUser(),
                "Borrow Request Declined",
                "Your borrow request for \"" + request.getBook().getTitle() + "\" was declined. " +
                        (reason != null && !reason.isBlank() ? "Reason: " + reason : "Please contact the circulation desk."),
                "BORROW_REQUEST_REJECTED",
                request.getId(),
                "BORROW_REQUEST"
        );

        return mapToResponse(updated);
    }

    @Transactional(readOnly = true)
    public PagedResponse<BorrowRequestResponse> getUserRequests(Long userId, Pageable pageable) {
        Page<BorrowRequest> page = borrowRequestRepository.findByUserId(userId, pageable);
        List<BorrowRequestResponse> list = page.getContent().stream().map(this::mapToResponse).toList();
        return PagedResponse.of(list, page);
    }

    @Transactional(readOnly = true)
    public PagedResponse<BorrowRequestResponse> getPendingRequests(Pageable pageable) {
        Page<BorrowRequest> page = borrowRequestRepository.findByStatus("PENDING", pageable);
        List<BorrowRequestResponse> list = page.getContent().stream().map(this::mapToResponse).toList();
        return PagedResponse.of(list, page);
    }

    @Transactional(readOnly = true)
    public PagedResponse<BorrowRequestResponse> searchRequests(String status, String query, Pageable pageable) {
        Page<BorrowRequest> page = borrowRequestRepository.searchRequests(status, query, pageable);
        List<BorrowRequestResponse> list = page.getContent().stream().map(this::mapToResponse).toList();
        return PagedResponse.of(list, page);
    }

    public BorrowRequestResponse mapToResponse(BorrowRequest r) {
        BorrowRequestResponse res = new BorrowRequestResponse();
        res.setId(r.getId());
        res.setBookId(r.getBook().getId());
        res.setBookTitle(r.getBook().getTitle());
        res.setBookAuthor(r.getBook().getAuthor());
        res.setBookIsbn(r.getBook().getIsbn());
        res.setCategoryName(r.getBook().getCategory().getName());
        res.setCoverImage(r.getBook().getCoverImage());
        res.setAvailableCopies(r.getBook().getAvailableCopies());
        res.setTotalCopies(r.getBook().getTotalCopies());

        res.setUserId(r.getUser().getId());
        res.setUserName(r.getUser().getFullName());
        res.setUserRole(r.getUser().getRole().getName());

        if ("ROLE_STUDENT".equals(r.getUser().getRole().getName())) {
            studentRepository.findByUserId(r.getUser().getId()).ifPresent(s -> {
                res.setUserIdentifier(s.getRegistrationNumber());
                res.setUserDepartment(s.getDepartment() + " (" + s.getAcademicYear() + ")");
            });
        } else if ("ROLE_FACULTY".equals(r.getUser().getRole().getName())) {
            facultyRepository.findByUserId(r.getUser().getId()).ifPresent(f -> {
                res.setUserIdentifier(f.getEmployeeId());
                res.setUserDepartment(f.getDepartment());
            });
        }

        res.setRequestDate(r.getRequestDate());
        res.setStatus(r.getStatus());
        res.setAdminNotes(r.getAdminNotes());

        if (r.getProcessedByAdmin() != null) {
            res.setProcessedByName(r.getProcessedByAdmin().getFullName());
            res.setProcessedAt(r.getProcessedAt());
        }

        return res;
    }
}
