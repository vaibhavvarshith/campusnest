package com.campusnest.service;

import com.campusnest.dto.common.PagedResponse;
import com.campusnest.dto.transaction.IssueRequest;
import com.campusnest.dto.transaction.ReturnRequest;
import com.campusnest.dto.transaction.TransactionResponse;
import com.campusnest.entity.*;
import com.campusnest.exception.BadRequestException;
import com.campusnest.exception.ResourceNotFoundException;
import com.campusnest.repository.*;
import com.campusnest.security.UserPrincipal;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Service
public class BorrowService {

    private final BorrowTransactionRepository transactionRepository;
    private final BookRepository bookRepository;
    private final UserRepository userRepository;
    private final StudentRepository studentRepository;
    private final FacultyRepository facultyRepository;
    private final FineRepository fineRepository;
    private final LibrarySettingService settingService;
    private final NotificationService notificationService;

    public BorrowService(BorrowTransactionRepository transactionRepository,
                         BookRepository bookRepository,
                         UserRepository userRepository,
                         StudentRepository studentRepository,
                         FacultyRepository facultyRepository,
                         FineRepository fineRepository,
                         LibrarySettingService settingService,
                         NotificationService notificationService) {
        this.transactionRepository = transactionRepository;
        this.bookRepository = bookRepository;
        this.userRepository = userRepository;
        this.studentRepository = studentRepository;
        this.facultyRepository = facultyRepository;
        this.fineRepository = fineRepository;
        this.settingService = settingService;
        this.notificationService = notificationService;
    }

    @Transactional
    public TransactionResponse issueBook(IssueRequest request, UserPrincipal adminPrincipal) {
        User patron = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("Patron not found with id: " + request.getUserId()));

        if (!Boolean.TRUE.equals(patron.getIsActive())) {
            throw new BadRequestException("Patron account is inactive and cannot borrow books");
        }

        String roleName = patron.getRole().getName();
        int maxAllowed = settingService.getMaxBooksForRole(roleName);
        long activeCount = transactionRepository.countByUserIdAndStatus(patron.getId(), "ISSUED");
        if (activeCount >= maxAllowed) {
            throw new BadRequestException("Borrowing limit reached: This user already has " + activeCount + " active issued book(s)");
        }

        // Concurrency-safe pessimistic write lock on book entity
        Book book = bookRepository.findByIdWithLock(request.getBookId())
                .orElseThrow(() -> new ResourceNotFoundException("Book not found with id: " + request.getBookId()));

        if (book.getAvailableCopies() <= 0) {
            throw new BadRequestException("No available copies for book: '" + book.getTitle() + "'");
        }

        // Decrement available copies
        book.setAvailableCopies(book.getAvailableCopies() - 1);
        bookRepository.save(book);

        LocalDate issueDate = request.getIssueDate() != null ? request.getIssueDate() : LocalDate.now();
        LocalDate dueDate = request.getDueDate();
        if (dueDate == null) {
            int defaultDays = settingService.getBorrowDaysForRole(roleName);
            dueDate = issueDate.plusDays(defaultDays);
        }

        if (dueDate.isBefore(issueDate)) {
            throw new BadRequestException("Due date cannot be before issue date");
        }

        User admin = null;
        if (adminPrincipal != null) {
            admin = userRepository.findById(adminPrincipal.getId()).orElse(null);
        }

        BorrowTransaction transaction = new BorrowTransaction();
        transaction.setBook(book);
        transaction.setUser(patron);
        transaction.setIssueDate(issueDate);
        transaction.setDueDate(dueDate);
        transaction.setStatus("ISSUED");
        transaction.setIssuedByAdmin(admin);
        transaction.setFineAmount(BigDecimal.ZERO);
        transaction.setOverdueDays(0);
        transaction.setNotes(request.getNotes());

        BorrowTransaction saved = transactionRepository.save(transaction);
        return mapToResponse(saved);
    }

    @Transactional
    public TransactionResponse returnBook(Long transactionId, ReturnRequest request, UserPrincipal adminPrincipal) {
        BorrowTransaction transaction = transactionRepository.findById(transactionId)
                .orElseThrow(() -> new ResourceNotFoundException("Transaction not found with id: " + transactionId));

        if ("RETURNED".equalsIgnoreCase(transaction.getStatus())) {
            throw new BadRequestException("Book has already been returned for this transaction");
        }

        LocalDate returnDate = (request != null && request.getReturnDate() != null)
                ? request.getReturnDate()
                : LocalDate.now();

        // Increment book available copy
        Book book = bookRepository.findByIdWithLock(transaction.getBook().getId())
                .orElseThrow(() -> new ResourceNotFoundException("Book not found"));

        if (book.getAvailableCopies() < book.getTotalCopies()) {
            book.setAvailableCopies(book.getAvailableCopies() + 1);
            bookRepository.save(book);
        }

        // Calculate overdue days and fine
        int overdueDays = 0;
        BigDecimal fineAmount = BigDecimal.ZERO;

        if (returnDate.isAfter(transaction.getDueDate())) {
            overdueDays = (int) ChronoUnit.DAYS.between(transaction.getDueDate(), returnDate);
            BigDecimal rate = settingService.getDailyFineRate();
            fineAmount = rate.multiply(BigDecimal.valueOf(overdueDays));
        }

        transaction.setReturnDate(returnDate);
        transaction.setStatus("RETURNED");
        transaction.setOverdueDays(overdueDays);
        transaction.setFineAmount(fineAmount);

        if (request != null && request.getNotes() != null && !request.getNotes().isBlank()) {
            String existing = transaction.getNotes() != null ? transaction.getNotes() + "; " : "";
            transaction.setNotes(existing + request.getNotes());
        }

        BorrowTransaction saved = transactionRepository.save(transaction);

        // Record fine in fines table if overdue fine is assessed
        if (fineAmount.compareTo(BigDecimal.ZERO) > 0) {
            Fine fine = new Fine();
            fine.setTransaction(saved);
            fine.setUser(saved.getUser());
            fine.setOverdueDays(overdueDays);
            fine.setDailyRate(settingService.getDailyFineRate());
            fine.setFineAmount(fineAmount);
            fine.setPaidAmount(BigDecimal.ZERO);
            fine.setBalanceAmount(fineAmount);
            fine.setStatus("UNPAID");
            fineRepository.save(fine);

            notificationService.createNotification(
                    saved.getUser(),
                    "Overdue Fine Assessed",
                    "A late fine of INR " + fineAmount + " has been assessed for returning '" +
                            book.getTitle() + "' " + overdueDays + " day(s) late.",
                    "FINE_ASSESSED",
                    saved.getId(),
                    "BORROW_TRANSACTION"
            );
        }

        return mapToResponse(saved);
    }

    @Transactional(readOnly = true)
    public PagedResponse<TransactionResponse> searchTransactions(String status, String query, Pageable pageable) {
        Page<BorrowTransaction> page = transactionRepository.searchTransactions(status, query, pageable);
        List<TransactionResponse> responses = page.getContent().stream()
                .map(this::mapToResponse)
                .toList();

        return PagedResponse.of(responses, page);
    }

    @Transactional(readOnly = true)
    public PagedResponse<TransactionResponse> getUserTransactions(Long userId, Pageable pageable) {
        Page<BorrowTransaction> page = transactionRepository.findByUserId(userId, pageable);
        List<TransactionResponse> responses = page.getContent().stream()
                .map(this::mapToResponse)
                .toList();

        return PagedResponse.of(responses, page);
    }

    public TransactionResponse mapToResponse(BorrowTransaction t) {
        TransactionResponse r = new TransactionResponse();
        r.setId(t.getId());
        r.setBookId(t.getBook().getId());
        r.setBookTitle(t.getBook().getTitle());
        r.setBookIsbn(t.getBook().getIsbn());
        r.setBookAuthor(t.getBook().getAuthor());
        r.setUserId(t.getUser().getId());
        r.setUserName(t.getUser().getFullName());
        r.setUserRole(t.getUser().getRole().getName());
        r.setIssueDate(t.getIssueDate());
        r.setDueDate(t.getDueDate());
        r.setReturnDate(t.getReturnDate());
        r.setStatus(t.getStatus());
        r.setNotes(t.getNotes());
        r.setCreatedAt(t.getCreatedAt());

        // Resolve identifier
        if ("ROLE_STUDENT".equals(t.getUser().getRole().getName())) {
            studentRepository.findByUserId(t.getUser().getId())
                    .ifPresent(s -> r.setUserIdentifier(s.getRegistrationNumber()));
        } else if ("ROLE_FACULTY".equals(t.getUser().getRole().getName())) {
            facultyRepository.findByUserId(t.getUser().getId())
                    .ifPresent(f -> r.setUserIdentifier(f.getEmployeeId()));
        }

        LocalDate today = LocalDate.now();
        if ("ISSUED".equals(t.getStatus())) {
            long daysRem = ChronoUnit.DAYS.between(today, t.getDueDate());
            r.setDaysRemaining(daysRem);
            boolean isLate = today.isAfter(t.getDueDate());
            r.setIsOverdue(isLate);

            if (isLate) {
                int lateDays = (int) ChronoUnit.DAYS.between(t.getDueDate(), today);
                r.setOverdueDays(lateDays);
                BigDecimal estFine = settingService.getDailyFineRate().multiply(BigDecimal.valueOf(lateDays));
                r.setFineAmount(estFine);
            } else {
                r.setOverdueDays(0);
                r.setFineAmount(BigDecimal.ZERO);
            }
        } else {
            r.setDaysRemaining(0L);
            r.setIsOverdue(t.getOverdueDays() > 0);
            r.setOverdueDays(t.getOverdueDays());
            r.setFineAmount(t.getFineAmount());

            fineRepository.findByTransactionId(t.getId()).ifPresent(f -> {
                r.setFineId(f.getId());
                r.setFineStatus(f.getStatus());
            });
        }

        return r;
    }
}
