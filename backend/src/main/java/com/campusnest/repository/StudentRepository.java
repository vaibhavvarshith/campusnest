package com.campusnest.repository;

import com.campusnest.entity.Student;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface StudentRepository extends JpaRepository<Student, Long> {
    Optional<Student> findByRegistrationNumber(String registrationNumber);
    Optional<Student> findByUserId(Long userId);
    boolean existsByRegistrationNumber(String registrationNumber);

    List<Student> findByDepartment(String department);

    @Query("SELECT s FROM Student s WHERE " +
           "(:academicYear IS NULL OR :academicYear = '' OR s.academicYear = :academicYear) AND " +
           "(:department IS NULL OR :department = '' OR s.department = :department) AND " +
           "(:semester IS NULL OR s.semester = :semester) AND " +
           "(:section IS NULL OR :section = '' OR s.section = :section) AND " +
           "(:query IS NULL OR :query = '' OR " +
           "LOWER(s.registrationNumber) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(s.user.fullName) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(s.user.email) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(s.department) LIKE LOWER(CONCAT('%', :query, '%')))")
    Page<Student> filterStudents(@Param("academicYear") String academicYear,
                                 @Param("department") String department,
                                 @Param("semester") Integer semester,
                                 @Param("section") String section,
                                 @Param("query") String query,
                                 Pageable pageable);

    @Query("SELECT s FROM Student s WHERE " +
           "(:query IS NULL OR LOWER(s.registrationNumber) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(s.user.fullName) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(s.department) LIKE LOWER(CONCAT('%', :query, '%')))")
    Page<Student> searchStudents(@Param("query") String query, Pageable pageable);
}
