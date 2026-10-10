package com.campusnest.dto.subjecthead;

public class FacultyAllocationDto {

    private Long facultyId;
    private String employeeId;
    private String facultyName;
    private String department;
    private String designation;
    private long assignedProjectsCount;

    public FacultyAllocationDto() {}

    public FacultyAllocationDto(Long facultyId, String employeeId, String facultyName,
                                String department, String designation, long assignedProjectsCount) {
        this.facultyId = facultyId;
        this.employeeId = employeeId;
        this.facultyName = facultyName;
        this.department = department;
        this.designation = designation;
        this.assignedProjectsCount = assignedProjectsCount;
    }

    public Long getFacultyId() { return facultyId; }
    public void setFacultyId(Long facultyId) { this.facultyId = facultyId; }

    public String getEmployeeId() { return employeeId; }
    public void setEmployeeId(String employeeId) { this.employeeId = employeeId; }

    public String getFacultyName() { return facultyName; }
    public void setFacultyName(String facultyName) { this.facultyName = facultyName; }

    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }

    public String getDesignation() { return designation; }
    public void setDesignation(String designation) { this.designation = designation; }

    public long getAssignedProjectsCount() { return assignedProjectsCount; }
    public void setAssignedProjectsCount(long assignedProjectsCount) { this.assignedProjectsCount = assignedProjectsCount; }
}
