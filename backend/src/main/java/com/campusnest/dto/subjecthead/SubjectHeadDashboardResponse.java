package com.campusnest.dto.subjecthead;

import com.campusnest.dto.project.ProjectResponse;
import java.util.List;

public class SubjectHeadDashboardResponse {

    private Long subjectHeadFacultyId;
    private String subjectHeadName;
    private String department;
    private List<SubjectHeadAssignmentDto> managedSubjects;
    private List<FacultyAllocationDto> departmentFaculty;
    private long totalProjects;
    private long pendingAllocationCount;
    private long assignedCount;
    private long readyForStudentsCount;
    private long publishedCount;
    private long completedCount;
    private List<ProjectResponse> allocatedProjects;

    public SubjectHeadDashboardResponse() {}

    public Long getSubjectHeadFacultyId() { return subjectHeadFacultyId; }
    public void setSubjectHeadFacultyId(Long subjectHeadFacultyId) { this.subjectHeadFacultyId = subjectHeadFacultyId; }

    public String getSubjectHeadName() { return subjectHeadName; }
    public void setSubjectHeadName(String subjectHeadName) { this.subjectHeadName = subjectHeadName; }

    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }

    public List<SubjectHeadAssignmentDto> getManagedSubjects() { return managedSubjects; }
    public void setManagedSubjects(List<SubjectHeadAssignmentDto> managedSubjects) { this.managedSubjects = managedSubjects; }

    public List<FacultyAllocationDto> getDepartmentFaculty() { return departmentFaculty; }
    public void setDepartmentFaculty(List<FacultyAllocationDto> departmentFaculty) { this.departmentFaculty = departmentFaculty; }

    public long getTotalProjects() { return totalProjects; }
    public void setTotalProjects(long totalProjects) { this.totalProjects = totalProjects; }

    public long getPendingAllocationCount() { return pendingAllocationCount; }
    public void setPendingAllocationCount(long pendingAllocationCount) { this.pendingAllocationCount = pendingAllocationCount; }

    public long getAssignedCount() { return assignedCount; }
    public void setAssignedCount(long assignedCount) { this.assignedCount = assignedCount; }

    public long getReadyForStudentsCount() { return readyForStudentsCount; }
    public void setReadyForStudentsCount(long readyForStudentsCount) { this.readyForStudentsCount = readyForStudentsCount; }

    public long getPublishedCount() { return publishedCount; }
    public void setPublishedCount(long publishedCount) { this.publishedCount = publishedCount; }

    public long getCompletedCount() { return completedCount; }
    public void setCompletedCount(long completedCount) { this.completedCount = completedCount; }

    public List<ProjectResponse> getAllocatedProjects() { return allocatedProjects; }
    public void setAllocatedProjects(List<ProjectResponse> allocatedProjects) { this.allocatedProjects = allocatedProjects; }
}
