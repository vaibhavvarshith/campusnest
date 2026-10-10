package com.campusnest.repository;

import com.campusnest.entity.BorrowRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BorrowRequestRepository extends JpaRepository<BorrowRequest, Long> {

    Page<BorrowRequest> findByUserId(Long userId, Pageable pageable);

    Page<BorrowRequest> findByStatus(String status, Pageable pageable);

    boolean existsByUserIdAndBookIdAndStatus(Long userId, Long bookId, String status);

    Optional<BorrowRequest> findFirstByUserIdAndBookIdAndStatus(Long userId, Long bookId, String status);

    List<BorrowRequest> findByUserIdAndStatus(Long userId, String status);

    long countByStatus(String status);

    @Query("SELECT r FROM BorrowRequest r WHERE " +
           "(:status IS NULL OR r.status = :status) AND " +
           "(:query IS NULL OR :query = '' OR " +
           "LOWER(r.book.title) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(r.book.author) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(r.book.isbn) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(r.user.fullName) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(r.user.username) LIKE LOWER(CONCAT('%', :query, '%')))")
    Page<BorrowRequest> searchRequests(@Param("status") String status,
                                       @Param("query") String query,
                                       Pageable pageable);
}
