package com.campusnest.dto.subjecthead;

public class SubjectHeadAssignmentDto {

    private Long id;
    private String department;
    private String subjectName;
    private String academicYear;

    public SubjectHeadAssignmentDto() {}

    public SubjectHeadAssignmentDto(Long id, String department, String subjectName, String academicYear) {
        this.id = id;
        this.department = department;
        this.subjectName = subjectName;
        this.academicYear = academicYear;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }

    public String getSubjectName() { return subjectName; }
    public void setSubjectName(String subjectName) { this.subjectName = subjectName; }

    public String getAcademicYear() { return academicYear; }
    public void setAcademicYear(String academicYear) { this.academicYear = academicYear; }
}
