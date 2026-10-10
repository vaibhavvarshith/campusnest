package com.campusnest.repository;

import com.campusnest.entity.Fine;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.Optional;

@Repository
public interface FineRepository extends JpaRepository<Fine, Long> {

    Optional<Fine> findByTransactionId(Long transactionId);

    Page<Fine> findByUserId(Long userId, Pageable pageable);

    @Query("SELECT COALESCE(SUM(f.balanceAmount), 0) FROM Fine f")
    BigDecimal sumTotalOutstandingBalance();

    @Query("SELECT COALESCE(SUM(f.paidAmount), 0) FROM Fine f")
    BigDecimal sumTotalFinesCollected();

    @Query("SELECT COALESCE(SUM(f.balanceAmount), 0) FROM Fine f WHERE f.user.id = :userId")
    BigDecimal sumBalanceByUserId(@Param("userId") Long userId);

    @Query("SELECT f FROM Fine f WHERE " +
           "(:status IS NULL OR f.status = :status) AND " +
           "(:query IS NULL OR LOWER(f.user.fullName) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(f.user.username) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(f.transaction.book.title) LIKE LOWER(CONCAT('%', :query, '%')))")
    Page<Fine> searchFines(@Param("status") String status,
                           @Param("query") String query,
                           Pageable pageable);
}
