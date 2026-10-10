package com.campusnest.service;

import com.campusnest.dto.project.ProjectRequest;
import com.campusnest.dto.project.ProjectResponse;
import com.campusnest.dto.subjecthead.FacultyAllocationDto;
import com.campusnest.dto.subjecthead.SubjectHeadAssignmentDto;
import com.campusnest.dto.subjecthead.SubjectHeadDashboardResponse;
import com.campusnest.entity.Faculty;
import com.campusnest.entity.Notification;
import com.campusnest.entity.Project;
import com.campusnest.entity.SubjectHeadAssignment;
import com.campusnest.exception.BadRequestException;
import com.campusnest.exception.ResourceNotFoundException;
import com.campusnest.exception.UnauthorizedException;
import com.campusnest.repository.*;
import com.campusnest.security.UserPrincipal;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class SubjectHeadService {

    private final FacultyRepository facultyRepository;
    private final SubjectHeadAssignmentRepository assignmentRepository;
    private final ProjectRepository projectRepository;
    private final ProjectService projectService;
    private final NotificationRepository notificationRepository;

    public SubjectHeadService(FacultyRepository facultyRepository,
                              SubjectHeadAssignmentRepository assignmentRepository,
                              ProjectRepository projectRepository,
                              ProjectService projectService,
                              NotificationRepository notificationRepository) {
        this.facultyRepository = facultyRepository;
        this.assignmentRepository = assignmentRepository;
        this.projectRepository = projectRepository;
        this.projectService = projectService;
        this.notificationRepository = notificationRepository;
    }

    @Transactional(readOnly = true)
    public SubjectHeadDashboardResponse getDashboard(UserPrincipal principal) {
        Faculty subjectHead = getAuthenticatedSubjectHead(principal);

        List<SubjectHeadAssignment> managed = assignmentRepository.findByFacultyId(subjectHead.getId());
        List<SubjectHeadAssignmentDto> managedDtos = managed.stream()
                .map(a -> new SubjectHeadAssignmentDto(a.getId(), a.getDepartment(), a.getSubjectName(), a.getAcademicYear()))
                .toList();

        List<Faculty> deptFaculty = facultyRepository.findByDepartment(subjectHead.getDepartment());
        List<FacultyAllocationDto> facultyDtos = deptFaculty.stream()
                .map(f -> {
                    long count = projectRepository.countByFacultyId(f.getId());
                    return new FacultyAllocationDto(
                            f.getId(),
                            f.getEmployeeId(),
                            f.getUser().getFullName(),
                            f.getDepartment(),
                            f.getDesignation(),
                            count
                    );
                })
                .toList();

        List<Project> projects = projectRepository.findBySubjectHeadId(
                subjectHead.getId(),
                PageRequest.of(0, 50, Sort.by(Sort.Direction.ASC, "priorityRank").and(Sort.by(Sort.Direction.ASC, "dueDate")))
        ).getContent();

        List<ProjectResponse> projectDtos = projects.stream()
                .map(p -> projectService.mapToResponse(p, null))
                .toList();

        long total = projectRepository.countBySubjectHeadId(subjectHead.getId());
        long pending = projects.stream().filter(p -> "PENDING_ALLOCATION".equalsIgnoreCase(p.getStatus())).count();
        long assigned = projects.stream().filter(p -> "ASSIGNED_TO_FACULTY".equalsIgnoreCase(p.getStatus())).count();
        long ready = projects.stream().filter(p -> "READY_FOR_STUDENTS".equalsIgnoreCase(p.getStatus())).count();
        long published = projects.stream().filter(p -> "PUBLISHED".equalsIgnoreCase(p.getStatus()) || "ACTIVE".equalsIgnoreCase(p.getStatus())).count();
        long completed = projects.stream().filter(p -> "COMPLETED".equalsIgnoreCase(p.getStatus())).count();

        SubjectHeadDashboardResponse response = new SubjectHeadDashboardResponse();
        response.setSubjectHeadFacultyId(subjectHead.getId());
        response.setSubjectHeadName(subjectHead.getUser().getFullName());
        response.setDepartment(subjectHead.getDepartment());
        response.setManagedSubjects(managedDtos);
        response.setDepartmentFaculty(facultyDtos);
        response.setTotalProjects(total);
        response.setPendingAllocationCount(pending);
        response.setAssignedCount(assigned);
        response.setReadyForStudentsCount(ready);
        response.setPublishedCount(published);
        response.setCompletedCount(completed);
        response.setAllocatedProjects(projectDtos);

        return response;
    }

    @Transactional
    public ProjectResponse allocateProject(ProjectRequest request, UserPrincipal principal) {
        Faculty subjectHead = getAuthenticatedSubjectHead(principal);

        // Verify subject authority
        String dept = request.getDepartment() != null ? request.getDepartment() : subjectHead.getDepartment();
        boolean authorized = "ROLE_ADMIN".equals(principal.getRole()) ||
                assignmentRepository.existsByFacultyIdAndDepartmentAndSubjectName(
                        subjectHead.getId(), dept, request.getSubjectName()
                );

        if (!authorized) {
            // Allow if subjectHead is from the same department
            if (!subjectHead.getDepartment().equalsIgnoreCase(dept)) {
                throw new UnauthorizedException("You are not authorized to allocate projects outside your department: " + subjectHead.getDepartment());
            }
        }

        Faculty assignedFaculty = null;
        final Long targetFacultyId = request.getFacultyId() != null ? request.getFacultyId() : request.getAllocatedFacultyId();

        if (targetFacultyId != null) {
            assignedFaculty = facultyRepository.findById(targetFacultyId)
                    .orElseThrow(() -> new ResourceNotFoundException("Target faculty not found with id: " + targetFacultyId));
        } else {
            assignedFaculty = subjectHead; // Default to self if not allocated to another faculty
        }

        Project project = new Project();
        project.setSubjectHead(subjectHead);
        project.setFaculty(assignedFaculty);
        project.setSubjectName(request.getSubjectName());
        project.setTitle(request.getTitle());
        project.setDescription(request.getDescription());
        project.setDepartment(dept);
        project.setCourse(request.getCourse() != null ? request.getCourse() : "B.Tech " + dept);
        project.setAcademicYear(request.getAcademicYear() != null ? request.getAcademicYear() : "Third Year");
        project.setSemester(request.getSemester() != null ? request.getSemester() : 6);
        project.setSection(request.getSection() != null ? request.getSection() : "A");
        project.setInstructions(request.getInstructions());
        project.setSubmissionFormat(request.getSubmissionFormat() != null ? request.getSubmissionFormat() : "PDF Deliverable");
        project.setAttachmentUrl(request.getAttachmentUrl());
        project.setPdfUrl(request.getPdfUrl());
        project.setPdfFileName(request.getPdfFileName());
        project.setPdfFileSize(request.getPdfFileSize());
        project.setPriority(request.getPriority() != null ? request.getPriority() : "MEDIUM");
        project.setPriorityRank(request.getPriorityRank() != null ? request.getPriorityRank() : 1);
        project.setMaxScore(request.getMaxScore() != null ? request.getMaxScore() : 100);
        project.setAllocationNotes(request.getAllocationNotes());
        project.setStartDate(request.getStartDate() != null ? request.getStartDate() : java.time.LocalDate.now());
        project.setDueDate(request.getDueDate() != null ? request.getDueDate() : java.time.LocalDate.now().plusWeeks(2));

        String initialStatus = request.getStatus();
        if (initialStatus == null || initialStatus.trim().isEmpty()) {
            initialStatus = assignedFaculty.getId().equals(subjectHead.getId()) ? "PUBLISHED" : "ASSIGNED_TO_FACULTY";
        }
        project.setStatus(initialStatus);

        Project saved = projectRepository.save(project);

        // Notify assigned faculty if allocated to another professor
        if (!assignedFaculty.getId().equals(subjectHead.getId())) {
            Notification notification = new Notification();
            notification.setUser(assignedFaculty.getUser());
            notification.setTitle("New Assignment Allocated by Subject Head");
            notification.setMessage(String.format("Subject Head %s allocated '%s' (%s) to you. Due date: %s",
                    subjectHead.getUser().getFullName(), saved.getTitle(), saved.getSubjectName(), saved.getDueDate()));
            notification.setType("FACULTY_ASSIGNMENT_ALLOCATED");
            notification.setReferenceId(saved.getId());
            notification.setReferenceType("PROJECT");
            notificationRepository.save(notification);
        }

        return projectService.mapToResponse(saved, null);
    }

    @Transactional
    public ProjectResponse reassignProject(Long projectId, Long newFacultyId, String priority, Integer priorityRank, UserPrincipal principal) {
        Faculty subjectHead = getAuthenticatedSubjectHead(principal);
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found with id: " + projectId));

        if (!"ROLE_ADMIN".equals(principal.getRole()) &&
                (project.getSubjectHead() == null || !project.getSubjectHead().getId().equals(subjectHead.getId()))) {
            throw new UnauthorizedException("You are not authorized to reassign this project.");
        }

        if (newFacultyId != null) {
            Faculty newFaculty = facultyRepository.findById(newFacultyId)
                    .orElseThrow(() -> new ResourceNotFoundException("Faculty not found with id: " + newFacultyId));
            project.setFaculty(newFaculty);
            project.setStatus("ASSIGNED_TO_FACULTY");

            Notification notification = new Notification();
            notification.setUser(newFaculty.getUser());
            notification.setTitle("Assignment Reassigned to You");
            notification.setMessage(String.format("Assignment '%s' has been assigned to you by Subject Head %s.",
                    project.getTitle(), subjectHead.getUser().getFullName()));
            notification.setType("FACULTY_ASSIGNMENT_ALLOCATED");
            notification.setReferenceId(project.getId());
            notification.setReferenceType("PROJECT");
            notificationRepository.save(notification);
        }

        if (priority != null) project.setPriority(priority);
        if (priorityRank != null) project.setPriorityRank(priorityRank);

        Project updated = projectRepository.save(project);
        return projectService.mapToResponse(updated, null);
    }

    @Transactional
    public ProjectResponse publishProject(Long projectId, UserPrincipal principal) {
        Faculty subjectHead = getAuthenticatedSubjectHead(principal);
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found with id: " + projectId));

        if (!"ROLE_ADMIN".equals(principal.getRole()) &&
                (project.getSubjectHead() == null || !project.getSubjectHead().getId().equals(subjectHead.getId()))) {
            throw new UnauthorizedException("You are not authorized to publish this project.");
        }

        project.setStatus("PUBLISHED");
        Project updated = projectRepository.save(project);
        return projectService.mapToResponse(updated, null);
    }

    @Transactional
    public ProjectResponse updateStatus(Long projectId, String status, UserPrincipal principal) {
        Faculty subjectHead = getAuthenticatedSubjectHead(principal);
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found with id: " + projectId));

        if (!"ROLE_ADMIN".equals(principal.getRole()) &&
                (project.getSubjectHead() == null || !project.getSubjectHead().getId().equals(subjectHead.getId()))) {
            throw new UnauthorizedException("You are not authorized to update this project.");
        }

        project.setStatus(status.toUpperCase());
        Project updated = projectRepository.save(project);
        return projectService.mapToResponse(updated, null);
    }

    private Faculty getAuthenticatedSubjectHead(UserPrincipal principal) {
        if ("ROLE_ADMIN".equals(principal.getRole())) {
            // For admin, pick first faculty or return admin context
            return facultyRepository.findAll().stream().findFirst()
                    .orElseThrow(() -> new BadRequestException("No faculty profile configured in system"));
        }

        Faculty faculty = facultyRepository.findByUserId(principal.getId())
                .orElseThrow(() -> new UnauthorizedException("Faculty profile not found"));

        if (!Boolean.TRUE.equals(faculty.getIsSubjectHead())) {
            throw new UnauthorizedException("Access Denied: Subject Head authority required.");
        }

        return faculty;
    }
}
