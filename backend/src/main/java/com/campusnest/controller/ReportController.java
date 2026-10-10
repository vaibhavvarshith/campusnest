package com.campusnest.controller;

import com.campusnest.dto.common.ApiResponse;
import com.campusnest.dto.fine.FineResponse;
import com.campusnest.dto.transaction.TransactionResponse;
import com.campusnest.entity.FinePayment;
import com.campusnest.repository.FinePaymentRepository;
import com.campusnest.service.BorrowService;
import com.campusnest.service.FineService;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/admin/reports")
@PreAuthorize("hasRole('ADMIN')")
public class ReportController {

    private final BorrowService borrowService;
    private final FineService fineService;
    private final FinePaymentRepository paymentRepository;

    public ReportController(BorrowService borrowService,
                            FineService fineService,
                            FinePaymentRepository paymentRepository) {
        this.borrowService = borrowService;
        this.fineService = fineService;
        this.paymentRepository = paymentRepository;
    }

    @GetMapping("/issued")
    public ResponseEntity<ApiResponse<List<TransactionResponse>>> getCurrentlyIssuedReport(
            @RequestParam(defaultValue = "100") int limit) {
        List<TransactionResponse> issued = borrowService.searchTransactions("ISSUED", null, PageRequest.of(0, limit, Sort.by("issueDate").descending())).getContent();
        return ResponseEntity.ok(ApiResponse.ok(issued));
    }

    @GetMapping("/returned")
    public ResponseEntity<ApiResponse<List<TransactionResponse>>> getReturnedReport(
            @RequestParam(defaultValue = "100") int limit) {
        List<TransactionResponse> returned = borrowService.searchTransactions("RETURNED", null, PageRequest.of(0, limit, Sort.by("returnDate").descending())).getContent();
        return ResponseEntity.ok(ApiResponse.ok(returned));
    }

    @GetMapping("/overdue")
    public ResponseEntity<ApiResponse<List<TransactionResponse>>> getOverdueReport(
            @RequestParam(defaultValue = "100") int limit) {
        List<TransactionResponse> allIssued = borrowService.searchTransactions("ISSUED", null, PageRequest.of(0, limit, Sort.by("dueDate").ascending())).getContent();
        List<TransactionResponse> overdues = allIssued.stream()
                .filter(t -> Boolean.TRUE.equals(t.getIsOverdue()))
                .toList();
        return ResponseEntity.ok(ApiResponse.ok(overdues));
    }

    @GetMapping("/fines")
    public ResponseEntity<ApiResponse<List<FineResponse>>> getFinesReport(
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "100") int limit) {
        List<FineResponse> fines = fineService.searchFines(status, null, PageRequest.of(0, limit, Sort.by("assessedDate").descending())).getContent();
        return ResponseEntity.ok(ApiResponse.ok(fines));
    }

    @GetMapping("/payments")
    public ResponseEntity<ApiResponse<List<FinePayment>>> getPaymentsReport(
            @RequestParam(defaultValue = "100") int limit) {
        List<FinePayment> payments = paymentRepository.findAllByOrderByPaymentDateDesc(PageRequest.of(0, limit)).getContent();
        return ResponseEntity.ok(ApiResponse.ok(payments));
    }
}
