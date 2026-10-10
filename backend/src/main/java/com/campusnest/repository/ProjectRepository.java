package com.campusnest.repository;

import com.campusnest.entity.Project;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface ProjectRepository extends JpaRepository<Project, Long> {

    Page<Project> findByFacultyId(Long facultyId, Pageable pageable);

    @Query("SELECT p FROM Project p WHERE p.department = :department AND p.course = :course AND p.status = 'ACTIVE'")
    Page<Project> findByDepartmentAndCourse(@Param("department") String department,
                                           @Param("course") String course,
                                           Pageable pageable);

    @Query("SELECT p FROM Project p WHERE p.status = 'ACTIVE' AND p.dueDate = :dueDate")
    List<Project> findActiveProjectsByDueDate(@Param("dueDate") LocalDate dueDate);

    long countByFacultyId(Long facultyId);
}
