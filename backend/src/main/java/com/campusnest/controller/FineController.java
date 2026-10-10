package com.campusnest.controller;

import com.campusnest.dto.common.ApiResponse;
import com.campusnest.dto.common.PagedResponse;
import com.campusnest.dto.fine.FineResponse;
import com.campusnest.dto.fine.PaymentRequest;
import com.campusnest.entity.FinePayment;
import com.campusnest.security.UserPrincipal;
import com.campusnest.service.FineService;
import jakarta.validation.Valid;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
public class FineController {

    private final FineService fineService;

    public FineController(FineService fineService) {
        this.fineService = fineService;
    }

    @GetMapping("/admin/fines")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<PagedResponse<FineResponse>>> getFines(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String query,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        PagedResponse<FineResponse> response = fineService.searchFines(
                status, query, PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "assessedDate"))
        );
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    @PostMapping("/admin/fines/pay")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<FineResponse>> recordPayment(
            @Valid @RequestBody PaymentRequest request,
            @AuthenticationPrincipal UserPrincipal adminPrincipal) {
        FineResponse response = fineService.recordPayment(request, adminPrincipal);
        return ResponseEntity.ok(ApiResponse.ok("Payment recorded successfully", response));
    }

    @GetMapping("/admin/fines/{id}/payments")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<FinePayment>>> getFinePayments(@PathVariable Long id) {
        List<FinePayment> payments = fineService.getFinePayments(id);
        return ResponseEntity.ok(ApiResponse.ok(payments));
    }

    @GetMapping("/fines/my-fines")
    public ResponseEntity<ApiResponse<PagedResponse<FineResponse>>> getMyFines(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        PagedResponse<FineResponse> response = fineService.getUserFines(
                principal.getId(), PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "assessedDate"))
        );
        return ResponseEntity.ok(ApiResponse.ok(response));
    }
}
