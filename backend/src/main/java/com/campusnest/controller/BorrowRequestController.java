package com.campusnest.controller;

import com.campusnest.dto.borrow.BorrowRequestCreateDto;
import com.campusnest.dto.borrow.BorrowRequestResponse;
import com.campusnest.dto.common.ApiResponse;
import com.campusnest.dto.common.PagedResponse;
import com.campusnest.security.UserPrincipal;
import com.campusnest.service.BorrowRequestService;
import jakarta.validation.Valid;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/borrow-requests")
public class BorrowRequestController {

    private final BorrowRequestService borrowRequestService;

    public BorrowRequestController(BorrowRequestService borrowRequestService) {
        this.borrowRequestService = borrowRequestService;
    }

    @PostMapping
    public ResponseEntity<ApiResponse<BorrowRequestResponse>> createRequest(
            @Valid @RequestBody BorrowRequestCreateDto dto,
            @AuthenticationPrincipal UserPrincipal principal) {
        BorrowRequestResponse response = borrowRequestService.createBorrowRequest(dto, principal);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Your request for \"" + response.getBookTitle() + "\" has been submitted successfully.", response));
    }

    @GetMapping("/my")
    public ResponseEntity<ApiResponse<PagedResponse<BorrowRequestResponse>>> getMyRequests(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        PagedResponse<BorrowRequestResponse> response = borrowRequestService.getUserRequests(
                principal.getId(), PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "requestDate"))
        );
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    @GetMapping("/pending")
    @PreAuthorize("hasAnyRole('LIBRARIAN', 'ADMIN')")
    public ResponseEntity<ApiResponse<PagedResponse<BorrowRequestResponse>>> getPendingRequests(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "15") int size) {
        PagedResponse<BorrowRequestResponse> response = borrowRequestService.getPendingRequests(
                PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "requestDate"))
        );
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('LIBRARIAN', 'ADMIN')")
    public ResponseEntity<ApiResponse<PagedResponse<BorrowRequestResponse>>> getAllRequests(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String query,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "15") int size) {
        PagedResponse<BorrowRequestResponse> response = borrowRequestService.searchRequests(
                status, query, PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "requestDate"))
        );
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    @PostMapping("/{id}/approve")
    @PreAuthorize("hasAnyRole('LIBRARIAN', 'ADMIN')")
    public ResponseEntity<ApiResponse<BorrowRequestResponse>> approveRequest(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal librarianPrincipal) {
        BorrowRequestResponse response = borrowRequestService.approveAndIssueRequest(id, librarianPrincipal);
        return ResponseEntity.ok(ApiResponse.ok("Book approved and issued successfully", response));
    }

    @PostMapping("/{id}/reject")
    @PreAuthorize("hasAnyRole('LIBRARIAN', 'ADMIN')")
    public ResponseEntity<ApiResponse<BorrowRequestResponse>> rejectRequest(
            @PathVariable Long id,
            @RequestBody(required = false) Map<String, String> body,
            @AuthenticationPrincipal UserPrincipal librarianPrincipal) {
        String reason = body != null ? body.get("reason") : null;
        BorrowRequestResponse response = borrowRequestService.rejectRequest(id, reason, librarianPrincipal);
        return ResponseEntity.ok(ApiResponse.ok("Borrow request rejected", response));
    }
}
