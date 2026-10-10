package com.campusnest.repository;

import com.campusnest.entity.SubjectHeadAssignment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SubjectHeadAssignmentRepository extends JpaRepository<SubjectHeadAssignment, Long> {

    List<SubjectHeadAssignment> findByFacultyId(Long facultyId);

    List<SubjectHeadAssignment> findByDepartment(String department);

    boolean existsByFacultyIdAndDepartmentAndSubjectName(Long facultyId, String department, String subjectName);
}
