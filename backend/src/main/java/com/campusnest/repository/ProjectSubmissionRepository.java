package com.campusnest.repository;

import com.campusnest.entity.ProjectSubmission;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProjectSubmissionRepository extends JpaRepository<ProjectSubmission, Long> {

    List<ProjectSubmission> findByProjectId(Long projectId);

    Page<ProjectSubmission> findByProjectId(Long projectId, Pageable pageable);

    @Query("SELECT s FROM ProjectSubmission s WHERE s.project.id = :projectId ORDER BY s.score DESC NULLS LAST, s.submissionDate ASC")
    List<ProjectSubmission> findByProjectIdOrderByScoreDesc(@Param("projectId") Long projectId);

    List<ProjectSubmission> findByStudentId(Long studentId);

    Optional<ProjectSubmission> findByProjectIdAndStudentId(Long projectId, Long studentId);

    boolean existsByProjectIdAndStudentId(Long projectId, Long studentId);

    long countByProjectId(Long projectId);

    long countByProjectIdAndStatus(Long projectId, String status);

    long countByStudentId(Long studentId);
}
