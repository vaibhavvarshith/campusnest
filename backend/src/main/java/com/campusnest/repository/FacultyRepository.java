package com.campusnest.repository;

import com.campusnest.entity.Faculty;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface FacultyRepository extends JpaRepository<Faculty, Long> {
    Optional<Faculty> findByEmployeeId(String employeeId);
    Optional<Faculty> findByUserId(Long userId);
    boolean existsByEmployeeId(String employeeId);

    @Query("SELECT f FROM Faculty f WHERE " +
           "(:query IS NULL OR LOWER(f.employeeId) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(f.user.fullName) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(f.department) LIKE LOWER(CONCAT('%', :query, '%')))")
    Page<Faculty> searchFaculty(@Param("query") String query, Pageable pageable);
}
