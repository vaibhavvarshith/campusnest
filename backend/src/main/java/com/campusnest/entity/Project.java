package com.campusnest.entity;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "projects")
public class Project {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "faculty_id", nullable = false)
    private Faculty faculty;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "subject_head_id")
    private Faculty subjectHead;

    @Column(name = "subject_name", length = 150)
    private String subjectName;

    @Column(nullable = false, length = 255)
    private String title;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String description;

    @Column(nullable = false, length = 100)
    private String department;

    @Column(nullable = false, length = 100)
    private String course;

    @Column(name = "academic_year", nullable = false, length = 30)
    private String academicYear = "Third Year";

    @Column(nullable = false)
    private Integer semester = 6;

    @Column(nullable = false, length = 20)
    private String section = "A";

    @Column(columnDefinition = "TEXT")
    private String instructions;

    @Column(name = "submission_format", length = 100)
    private String submissionFormat = "PDF Document / Report";

    @Column(name = "attachment_url", length = 255)
    private String attachmentUrl;

    @Column(name = "pdf_url", length = 500)
    private String pdfUrl;

    @Column(name = "pdf_file_name", length = 255)
    private String pdfFileName;

    @Column(name = "pdf_file_size")
    private Long pdfFileSize;

    @Column(nullable = false, length = 20)
    private String priority = "MEDIUM"; // HIGH, MEDIUM, LOW

    @Column(name = "priority_rank")
    private Integer priorityRank = 1;

    @Column(name = "max_score", nullable = false)
    private Integer maxScore = 100;

    @Column(name = "allocation_notes", columnDefinition = "TEXT")
    private String allocationNotes;

    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;

    @Column(name = "due_date", nullable = false)
    private LocalDate dueDate;

    @Column(nullable = false, length = 30)
    private String status = "PUBLISHED"; // DRAFT, PENDING_ALLOCATION, ASSIGNED_TO_FACULTY, READY_FOR_STUDENTS, PUBLISHED, COMPLETED, ARCHIVED

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at")
    private LocalDateTime updatedAt = LocalDateTime.now();

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    public Project() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Faculty getFaculty() { return faculty; }
    public void setFaculty(Faculty faculty) { this.faculty = faculty; }

    public Faculty getSubjectHead() { return subjectHead; }
    public void setSubjectHead(Faculty subjectHead) { this.subjectHead = subjectHead; }

    public String getSubjectName() { return subjectName; }
    public void setSubjectName(String subjectName) { this.subjectName = subjectName; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }

    public String getCourse() { return course; }
    public void setCourse(String course) { this.course = course; }

    public String getAcademicYear() { return academicYear; }
    public void setAcademicYear(String academicYear) { this.academicYear = academicYear; }

    public Integer getSemester() { return semester; }
    public void setSemester(Integer semester) { this.semester = semester; }

    public String getSection() { return section; }
    public void setSection(String section) { this.section = section; }

    public String getInstructions() { return instructions; }
    public void setInstructions(String instructions) { this.instructions = instructions; }

    public String getSubmissionFormat() { return submissionFormat; }
    public void setSubmissionFormat(String submissionFormat) { this.submissionFormat = submissionFormat; }

    public String getAttachmentUrl() { return attachmentUrl; }
    public void setAttachmentUrl(String attachmentUrl) { this.attachmentUrl = attachmentUrl; }

    public String getPdfUrl() { return pdfUrl; }
    public void setPdfUrl(String pdfUrl) { this.pdfUrl = pdfUrl; }

    public String getPdfFileName() { return pdfFileName; }
    public void setPdfFileName(String pdfFileName) { this.pdfFileName = pdfFileName; }

    public Long getPdfFileSize() { return pdfFileSize; }
    public void setPdfFileSize(Long pdfFileSize) { this.pdfFileSize = pdfFileSize; }

    public String getPriority() { return priority; }
    public void setPriority(String priority) { this.priority = priority; }

    public Integer getPriorityRank() { return priorityRank; }
    public void setPriorityRank(Integer priorityRank) { this.priorityRank = priorityRank; }

    public Integer getMaxScore() { return maxScore; }
    public void setMaxScore(Integer maxScore) { this.maxScore = maxScore; }

    public String getAllocationNotes() { return allocationNotes; }
    public void setAllocationNotes(String allocationNotes) { this.allocationNotes = allocationNotes; }

    public LocalDate getStartDate() { return startDate; }
    public void setStartDate(LocalDate startDate) { this.startDate = startDate; }

    public LocalDate getDueDate() { return dueDate; }
    public void setDueDate(LocalDate dueDate) { this.dueDate = dueDate; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
