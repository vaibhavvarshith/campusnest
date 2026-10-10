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

    @Query("SELECT p FROM Project p WHERE p.faculty.id = :facultyId AND " +
           "(:academicYear IS NULL OR :academicYear = '' OR p.academicYear = :academicYear) AND " +
           "(:semester IS NULL OR p.semester = :semester) AND " +
           "(:section IS NULL OR :section = '' OR p.section = :section)")
    Page<Project> findByFacultyIdAndFilters(@Param("facultyId") Long facultyId,
                                           @Param("academicYear") String academicYear,
                                           @Param("semester") Integer semester,
                                           @Param("section") String section,
                                           Pageable pageable);

    @Query("SELECT p FROM Project p WHERE p.subjectHead.id = :subjectHeadId AND " +
           "(:department IS NULL OR :department = '' OR LOWER(p.department) = LOWER(:department)) AND " +
           "(:subjectName IS NULL OR :subjectName = '' OR LOWER(p.subjectName) = LOWER(:subjectName))")
    Page<Project> findBySubjectHeadIdAndFilters(@Param("subjectHeadId") Long subjectHeadId,
                                                @Param("department") String department,
                                                @Param("subjectName") String subjectName,
                                                Pageable pageable);

    Page<Project> findBySubjectHeadId(Long subjectHeadId, Pageable pageable);

    @Query("SELECT p FROM Project p WHERE (p.status = 'ACTIVE' OR p.status = 'PUBLISHED') AND " +
           "LOWER(p.department) = LOWER(:department) AND " +
           "(:academicYear IS NULL OR LOWER(p.academicYear) = LOWER(:academicYear) OR LOWER(p.academicYear) = 'all' OR LOWER(p.academicYear) = 'all years') AND " +
           "(:semester IS NULL OR p.semester = 0 OR p.semester = :semester) AND " +
           "(:section IS NULL OR LOWER(p.section) = LOWER(:section) OR LOWER(p.section) = 'all' OR LOWER(p.section) = 'all sections')")
    Page<Project> findByStudentGroup(@Param("department") String department,
                                     @Param("academicYear") String academicYear,
                                     @Param("semester") Integer semester,
                                     @Param("section") String section,
                                     Pageable pageable);

    @Query("SELECT p FROM Project p WHERE p.department = :department AND p.course = :course AND (p.status = 'ACTIVE' OR p.status = 'PUBLISHED')")
    Page<Project> findByDepartmentAndCourse(@Param("department") String department,
                                            @Param("course") String course,
                                            Pageable pageable);

    @Query("SELECT p FROM Project p WHERE (p.status = 'ACTIVE' OR p.status = 'PUBLISHED') AND p.dueDate = :dueDate")
    List<Project> findActiveProjectsByDueDate(@Param("dueDate") LocalDate dueDate);

    long countByFacultyId(Long facultyId);

    long countBySubjectHeadId(Long subjectHeadId);
}
