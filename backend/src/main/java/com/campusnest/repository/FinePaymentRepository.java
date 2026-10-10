package com.campusnest.repository;

import com.campusnest.entity.FinePayment;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FinePaymentRepository extends JpaRepository<FinePayment, Long> {
    List<FinePayment> findByFineId(Long fineId);
    Page<FinePayment> findAllByOrderByPaymentDateDesc(Pageable pageable);
    Optional<FinePayment> findByReceiptNumber(String receiptNumber);
    boolean existsByReceiptNumber(String receiptNumber);
}
