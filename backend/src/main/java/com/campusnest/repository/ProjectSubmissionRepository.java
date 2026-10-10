package com.campusnest.repository;

import com.campusnest.entity.ProjectSubmission;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProjectSubmissionRepository extends JpaRepository<ProjectSubmission, Long> {

    List<ProjectSubmission> findByProjectId(Long projectId);

    Page<ProjectSubmission> findByProjectId(Long projectId, Pageable pageable);

    List<ProjectSubmission> findByStudentId(Long studentId);

    Optional<ProjectSubmission> findByProjectIdAndStudentId(Long projectId, Long studentId);

    long countByProjectId(Long projectId);

    long countByProjectIdAndStatus(Long projectId, String status);

    long countByStudentId(Long studentId);
}
