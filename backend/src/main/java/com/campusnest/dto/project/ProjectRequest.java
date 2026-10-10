package com.campusnest.dto.project;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;

public class ProjectRequest {

    @NotBlank(message = "Title is required")
    private String title;

    @NotBlank(message = "Description is required")
    private String description;

    private String department = "Computer Science & Engineering";

    private String course = "B.Tech CSE";

    private String subjectName = "Computer Science";

    private Long facultyId; // Specific faculty assigned by Subject Head

    private String priority = "MEDIUM"; // HIGH, MEDIUM, LOW

    private Integer priorityRank = 1;

    private String academicYear = "Third Year";

    private Integer semester = 6;

    private String section = "A";

    private String instructions;

    private String submissionFormat = "PDF Document / Report";

    private String attachmentUrl;

    private String pdfUrl;

    private String pdfFileName;

    private Long pdfFileSize;

    private Integer maxScore = 100;

    private String allocationNotes;

    private String status = "PUBLISHED"; // DRAFT, PENDING_ALLOCATION, ASSIGNED_TO_FACULTY, READY_FOR_STUDENTS, PUBLISHED

    private LocalDate startDate = LocalDate.now();

    @NotNull(message = "Due date is required")
    private LocalDate dueDate;

    public ProjectRequest() {}

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }

    public String getCourse() { return course; }
    public void setCourse(String course) { this.course = course; }

    public String getSubjectName() { return subjectName; }
    public void setSubjectName(String subjectName) { this.subjectName = subjectName; }

    public Long getFacultyId() { return facultyId; }
    public void setFacultyId(Long facultyId) { this.facultyId = facultyId; }

    public Long getAllocatedFacultyId() { return facultyId; }
    public void setAllocatedFacultyId(Long allocatedFacultyId) { this.facultyId = allocatedFacultyId; }

    public String getPriority() { return priority; }
    public void setPriority(String priority) { this.priority = priority; }

    public Integer getPriorityRank() { return priorityRank; }
    public void setPriorityRank(Integer priorityRank) { this.priorityRank = priorityRank; }

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

    public Integer getMaxScore() { return maxScore; }
    public void setMaxScore(Integer maxScore) { this.maxScore = maxScore; }

    public String getAllocationNotes() { return allocationNotes; }
    public void setAllocationNotes(String allocationNotes) { this.allocationNotes = allocationNotes; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public LocalDate getStartDate() { return startDate; }
    public void setStartDate(LocalDate startDate) { this.startDate = startDate; }

    public LocalDate getDueDate() { return dueDate; }
    public void setDueDate(LocalDate dueDate) { this.dueDate = dueDate; }
}
