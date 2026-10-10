package com.campusnest.service;

import com.campusnest.dto.common.PagedResponse;
import com.campusnest.dto.fine.FineResponse;
import com.campusnest.dto.fine.PaymentRequest;
import com.campusnest.entity.Fine;
import com.campusnest.entity.FinePayment;
import com.campusnest.entity.User;
import com.campusnest.exception.BadRequestException;
import com.campusnest.exception.ResourceNotFoundException;
import com.campusnest.repository.*;
import com.campusnest.security.UserPrincipal;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
public class FineService {

    private final FineRepository fineRepository;
    private final FinePaymentRepository finePaymentRepository;
    private final UserRepository userRepository;
    private final StudentRepository studentRepository;
    private final FacultyRepository facultyRepository;

    public FineService(FineRepository fineRepository,
                       FinePaymentRepository finePaymentRepository,
                       UserRepository userRepository,
                       StudentRepository studentRepository,
                       FacultyRepository facultyRepository) {
        this.fineRepository = fineRepository;
        this.finePaymentRepository = finePaymentRepository;
        this.userRepository = userRepository;
        this.studentRepository = studentRepository;
        this.facultyRepository = facultyRepository;
    }

    @Transactional(readOnly = true)
    public PagedResponse<FineResponse> searchFines(String status, String query, Pageable pageable) {
        Page<Fine> finePage = fineRepository.searchFines(status, query, pageable);
        List<FineResponse> responses = finePage.getContent().stream()
                .map(this::mapToResponse)
                .toList();

        return PagedResponse.of(responses, finePage);
    }

    @Transactional(readOnly = true)
    public PagedResponse<FineResponse> getUserFines(Long userId, Pageable pageable) {
        Page<Fine> finePage = fineRepository.findByUserId(userId, pageable);
        List<FineResponse> responses = finePage.getContent().stream()
                .map(this::mapToResponse)
                .toList();

        return PagedResponse.of(responses, finePage);
    }

    @Transactional
    public FineResponse recordPayment(PaymentRequest request, UserPrincipal adminPrincipal) {
        Fine fine = fineRepository.findById(request.getFineId())
                .orElseThrow(() -> new ResourceNotFoundException("Fine not found with id: " + request.getFineId()));

        if ("PAID".equalsIgnoreCase(fine.getStatus())) {
            throw new BadRequestException("Fine is already fully settled");
        }

        if (request.getAmountPaid().compareTo(fine.getBalanceAmount()) > 0) {
            throw new BadRequestException("Payment amount of INR " + request.getAmountPaid() +
                    " exceeds outstanding balance of INR " + fine.getBalanceAmount());
        }

        User admin = null;
        if (adminPrincipal != null) {
            admin = userRepository.findById(adminPrincipal.getId()).orElse(null);
        }

        // Generate unique formatted receipt number
        String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMddHHmmss"));
        String receiptNumber = "REC-" + timestamp + "-" + fine.getId();

        FinePayment payment = new FinePayment();
        payment.setFine(fine);
        payment.setAmountPaid(request.getAmountPaid());
        payment.setPaymentMethod(request.getPaymentMethod() != null ? request.getPaymentMethod() : "CASH");
        payment.setReceiptNumber(receiptNumber);
        payment.setReceivedByAdmin(admin);
        payment.setNotes(request.getNotes());
        finePaymentRepository.save(payment);

        BigDecimal newPaidAmount = fine.getPaidAmount().add(request.getAmountPaid());
        BigDecimal newBalance = fine.getBalanceAmount().subtract(request.getAmountPaid());

        fine.setPaidAmount(newPaidAmount);
        fine.setBalanceAmount(newBalance);

        if (newBalance.compareTo(BigDecimal.ZERO) <= 0) {
            fine.setStatus("PAID");
        } else {
            fine.setStatus("PARTIALLY_PAID");
        }

        Fine updatedFine = fineRepository.save(fine);
        return mapToResponse(updatedFine);
    }

    @Transactional(readOnly = true)
    public List<FinePayment> getFinePayments(Long fineId) {
        return finePaymentRepository.findByFineId(fineId);
    }

    public FineResponse mapToResponse(Fine fine) {
        FineResponse r = new FineResponse();
        r.setId(fine.getId());
        r.setTransactionId(fine.getTransaction().getId());
        r.setBookId(fine.getTransaction().getBook().getId());
        r.setBookTitle(fine.getTransaction().getBook().getTitle());
        r.setBookIsbn(fine.getTransaction().getBook().getIsbn());
        r.setUserId(fine.getUser().getId());
        r.setUserName(fine.getUser().getFullName());
        r.setIssueDate(fine.getTransaction().getIssueDate());
        r.setDueDate(fine.getTransaction().getDueDate());
        r.setReturnDate(fine.getTransaction().getReturnDate());
        r.setOverdueDays(fine.getOverdueDays());
        r.setDailyRate(fine.getDailyRate());
        r.setFineAmount(fine.getFineAmount());
        r.setPaidAmount(fine.getPaidAmount());
        r.setBalanceAmount(fine.getBalanceAmount());
        r.setStatus(fine.getStatus());
        r.setAssessedDate(fine.getAssessedDate());

        if ("ROLE_STUDENT".equals(fine.getUser().getRole().getName())) {
            studentRepository.findByUserId(fine.getUser().getId())
                    .ifPresent(s -> r.setUserIdentifier(s.getRegistrationNumber()));
        } else if ("ROLE_FACULTY".equals(fine.getUser().getRole().getName())) {
            facultyRepository.findByUserId(fine.getUser().getId())
                    .ifPresent(f -> r.setUserIdentifier(f.getEmployeeId()));
        }

        return r;
    }
}
