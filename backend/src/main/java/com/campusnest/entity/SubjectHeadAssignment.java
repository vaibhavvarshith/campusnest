package com.campusnest.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "subject_head_assignments", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"faculty_id", "department", "subject_name"})
})
public class SubjectHeadAssignment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "faculty_id", nullable = false)
    private Faculty faculty;

    @Column(nullable = false, length = 100)
    private String department;

    @Column(name = "subject_name", nullable = false, length = 150)
    private String subjectName;

    @Column(name = "academic_year", length = 30)
    private String academicYear;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    public SubjectHeadAssignment() {}

    public SubjectHeadAssignment(Faculty faculty, String department, String subjectName, String academicYear) {
        this.faculty = faculty;
        this.department = department;
        this.subjectName = subjectName;
        this.academicYear = academicYear;
        this.createdAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Faculty getFaculty() { return faculty; }
    public void setFaculty(Faculty faculty) { this.faculty = faculty; }

    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }

    public String getSubjectName() { return subjectName; }
    public void setSubjectName(String subjectName) { this.subjectName = subjectName; }

    public String getAcademicYear() { return academicYear; }
    public void setAcademicYear(String academicYear) { this.academicYear = academicYear; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
