package com.campusnest.repository;

import com.campusnest.entity.BorrowTransaction;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface BorrowTransactionRepository extends JpaRepository<BorrowTransaction, Long> {

    Page<BorrowTransaction> findByUserId(Long userId, Pageable pageable);

    List<BorrowTransaction> findByUserIdAndStatus(Long userId, String status);

    boolean existsByUserIdAndBookIdAndStatus(Long userId, Long bookId, String status);

    long countByUserIdAndStatus(Long userId, String status);

    default long countActiveIssuedByUserId(Long userId) {
        return countByUserIdAndStatus(userId, "ISSUED");
    }

    long countByStatus(String status);

    @Query("SELECT t FROM BorrowTransaction t WHERE t.status = 'ISSUED' AND t.dueDate = :dueDate")
    List<BorrowTransaction> findActiveIssuedByDueDate(@Param("dueDate") LocalDate dueDate);

    @Query("SELECT t FROM BorrowTransaction t WHERE t.status = 'ISSUED' AND t.dueDate < :currentDate")
    List<BorrowTransaction> findOverdueActiveTransactions(@Param("currentDate") LocalDate currentDate);

    @Query("SELECT t FROM BorrowTransaction t WHERE " +
           "(:status IS NULL OR t.status = :status) AND " +
           "(:query IS NULL OR LOWER(t.user.fullName) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(t.user.username) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(t.book.title) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(t.book.isbn) LIKE LOWER(CONCAT('%', :query, '%')))")
    Page<BorrowTransaction> searchTransactions(@Param("status") String status,
                                               @Param("query") String query,
                                               Pageable pageable);

    @Query("SELECT t.book.title, COUNT(t) FROM BorrowTransaction t GROUP BY t.book.title ORDER BY COUNT(t) DESC")
    List<Object[]> findMostBorrowedBooks(Pageable pageable);

    @Query("SELECT t.book.category.name, COUNT(t) FROM BorrowTransaction t GROUP BY t.book.category.name")
    List<Object[]> findBorrowingByCategory();
}
