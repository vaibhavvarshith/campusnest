package com.campusnest.controller;

import com.campusnest.dto.common.ApiResponse;
import com.campusnest.dto.common.PagedResponse;
import com.campusnest.dto.transaction.IssueRequest;
import com.campusnest.dto.transaction.ReturnRequest;
import com.campusnest.dto.transaction.TransactionResponse;
import com.campusnest.security.UserPrincipal;
import com.campusnest.service.BorrowService;
import jakarta.validation.Valid;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
public class BorrowController {

    private final BorrowService borrowService;

    public BorrowController(BorrowService borrowService) {
        this.borrowService = borrowService;
    }

    @PostMapping("/admin/borrow/issue")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<TransactionResponse>> issueBook(
            @Valid @RequestBody IssueRequest request,
            @AuthenticationPrincipal UserPrincipal adminPrincipal) {
        TransactionResponse response = borrowService.issueBook(request, adminPrincipal);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok("Book issued successfully", response));
    }

    @PostMapping("/admin/borrow/return/{transactionId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<TransactionResponse>> returnBook(
            @PathVariable Long transactionId,
            @RequestBody(required = false) ReturnRequest request,
            @AuthenticationPrincipal UserPrincipal adminPrincipal) {
        TransactionResponse response = borrowService.returnBook(transactionId, request, adminPrincipal);
        return ResponseEntity.ok(ApiResponse.ok("Book returned successfully", response));
    }

    @GetMapping("/admin/borrow/transactions")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<PagedResponse<TransactionResponse>>> getTransactions(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String query,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        PagedResponse<TransactionResponse> response = borrowService.searchTransactions(
                status, query, PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"))
        );
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    @GetMapping("/borrow/my-books")
    public ResponseEntity<ApiResponse<PagedResponse<TransactionResponse>>> getMyBorrowedBooks(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        PagedResponse<TransactionResponse> response = borrowService.getUserTransactions(
                principal.getId(), PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"))
        );
        return ResponseEntity.ok(ApiResponse.ok(response));
    }
}
