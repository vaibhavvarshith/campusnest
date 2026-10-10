package com.campusnest.service;

import com.campusnest.dto.common.PagedResponse;
import com.campusnest.dto.project.*;
import com.campusnest.entity.*;
import com.campusnest.exception.BadRequestException;
import com.campusnest.exception.ResourceNotFoundException;
import com.campusnest.exception.UnauthorizedException;
import com.campusnest.repository.*;
import com.campusnest.security.UserPrincipal;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Optional;

@Service
public class ProjectService {

    private final ProjectRepository projectRepository;
    private final ProjectSubmissionRepository submissionRepository;
    private final FacultyRepository facultyRepository;
    private final StudentRepository studentRepository;

    public ProjectService(ProjectRepository projectRepository,
                          ProjectSubmissionRepository submissionRepository,
                          FacultyRepository facultyRepository,
                          StudentRepository studentRepository) {
        this.projectRepository = projectRepository;
        this.submissionRepository = submissionRepository;
        this.facultyRepository = facultyRepository;
        this.studentRepository = studentRepository;
    }

    @Transactional
    public ProjectResponse createProject(ProjectRequest request, UserPrincipal facultyPrincipal) {
        Faculty faculty = facultyRepository.findByUserId(facultyPrincipal.getId())
                .orElseThrow(() -> new UnauthorizedException("Only registered faculty can create projects"));

        if (request.getDueDate().isBefore(request.getStartDate())) {
            throw new BadRequestException("Due date cannot be before start date");
        }

        Project project = new Project();
        project.setFaculty(faculty);
        project.setTitle(request.getTitle());
        project.setDescription(request.getDescription());
        project.setDepartment(request.getDepartment());
        project.setCourse(request.getCourse());
        project.setAcademicYear(request.getAcademicYear() != null && !request.getAcademicYear().isBlank() ? request.getAcademicYear() : "Third Year");
        project.setSemester(request.getSemester() != null ? request.getSemester() : 6);
        project.setSection(request.getSection() != null && !request.getSection().isBlank() ? request.getSection() : "A");
        project.setInstructions(request.getInstructions());
        project.setSubmissionFormat(request.getSubmissionFormat() != null && !request.getSubmissionFormat().isBlank() ? request.getSubmissionFormat() : "GitHub Repository / PDF Report");
        project.setAttachmentUrl(request.getAttachmentUrl());
        project.setStartDate(request.getStartDate());
        project.setDueDate(request.getDueDate());
        project.setStatus("ACTIVE");

        Project saved = projectRepository.save(project);
        return mapToResponse(saved, null);
    }

    @Transactional
    public ProjectResponse updateProject(Long id, ProjectRequest request, UserPrincipal facultyPrincipal) {
        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found with id: " + id));

        Faculty faculty = facultyRepository.findByUserId(facultyPrincipal.getId())
                .orElseThrow(() -> new UnauthorizedException("Only faculty can modify projects"));

        if (!project.getFaculty().getId().equals(faculty.getId()) && !"ROLE_ADMIN".equals(facultyPrincipal.getRole())) {
            throw new UnauthorizedException("You do not have permission to modify this project");
        }

        project.setTitle(request.getTitle());
        project.setDescription(request.getDescription());
        project.setDepartment(request.getDepartment());
        project.setCourse(request.getCourse());
        if (request.getAcademicYear() != null && !request.getAcademicYear().isBlank()) {
            project.setAcademicYear(request.getAcademicYear());
        }
        if (request.getSemester() != null) {
            project.setSemester(request.getSemester());
        }
        if (request.getSection() != null && !request.getSection().isBlank()) {
            project.setSection(request.getSection());
        }
        if (request.getInstructions() != null) {
            project.setInstructions(request.getInstructions());
        }
        if (request.getSubmissionFormat() != null) {
            project.setSubmissionFormat(request.getSubmissionFormat());
        }
        if (request.getAttachmentUrl() != null) {
            project.setAttachmentUrl(request.getAttachmentUrl());
        }
        project.setStartDate(request.getStartDate());
        project.setDueDate(request.getDueDate());

        Project updated = projectRepository.save(project);
        return mapToResponse(updated, null);
    }

    @Transactional(readOnly = true)
    public PagedResponse<ProjectResponse> getFacultyProjects(UserPrincipal facultyPrincipal,
                                                            String academicYear,
                                                            Integer semester,
                                                            String section,
                                                            Pageable pageable) {
        Faculty faculty = facultyRepository.findByUserId(facultyPrincipal.getId())
                .orElseThrow(() -> new UnauthorizedException("Faculty profile not found"));

        Page<Project> page = projectRepository.findByFacultyIdAndFilters(
                faculty.getId(), academicYear, semester, section, pageable
        );
        List<ProjectResponse> responses = page.getContent().stream()
                .map(p -> mapToResponse(p, null))
                .toList();

        return PagedResponse.of(responses, page);
    }

    @Transactional(readOnly = true)
    public PagedResponse<ProjectResponse> getStudentAssignedProjects(UserPrincipal studentPrincipal, Pageable pageable) {
        Student student = studentRepository.findByUserId(studentPrincipal.getId())
                .orElseThrow(() -> new UnauthorizedException("Student profile not found"));

        // Enforce student group restriction: department, academicYear, semester, section
        Page<Project> page = projectRepository.findByStudentGroup(
                student.getDepartment(),
                student.getAcademicYear(),
                student.getSemester(),
                student.getSection(),
                pageable
        );

        List<ProjectResponse> responses = page.getContent().stream()
                .map(p -> mapToResponse(p, student))
                .toList();

        return PagedResponse.of(responses, page);
    }

    @Transactional(readOnly = true)
    public ProjectResponse getProjectById(Long id, UserPrincipal principal) {
        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found with id: " + id));

        Student student = null;
        if (principal != null && "ROLE_STUDENT".equals(principal.getRole())) {
            student = studentRepository.findByUserId(principal.getId()).orElse(null);
        }

        return mapToResponse(project, student);
    }

    @Transactional
    public SubmissionResponse submitProject(SubmissionRequest request, UserPrincipal studentPrincipal) {
        Student student = studentRepository.findByUserId(studentPrincipal.getId())
                .orElseThrow(() -> new UnauthorizedException("Only students can submit assignments"));

        Project project = projectRepository.findById(request.getProjectId())
                .orElseThrow(() -> new ResourceNotFoundException("Project not found with id: " + request.getProjectId()));

        LocalDate today = LocalDate.now();
        String status = today.isAfter(project.getDueDate()) ? "LATE" : "SUBMITTED";

        Optional<ProjectSubmission> existingOpt = submissionRepository.findByProjectIdAndStudentId(project.getId(), student.getId());
        ProjectSubmission submission = existingOpt.orElseGet(ProjectSubmission::new);

        submission.setProject(project);
        submission.setStudent(student);
        submission.setSubmissionDate(LocalDateTime.now());
        submission.setSubmissionText(request.getSubmissionText());
        submission.setFileUrl(request.getFileUrl());
        submission.setFileName(request.getFileName());
        submission.setFileSize(request.getFileSize());
        submission.setStatus(status);

        ProjectSubmission saved = submissionRepository.save(submission);
        return mapToSubmissionResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<SubmissionResponse> getProjectSubmissions(Long projectId, UserPrincipal facultyPrincipal) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found with id: " + projectId));

        Faculty faculty = facultyRepository.findByUserId(facultyPrincipal.getId())
                .orElseThrow(() -> new UnauthorizedException("Only faculty can view submissions"));

        if (!project.getFaculty().getId().equals(faculty.getId()) && !"ROLE_ADMIN".equals(facultyPrincipal.getRole())) {
            throw new UnauthorizedException("You do not have access to these submissions");
        }

        return submissionRepository.findByProjectId(projectId).stream()
                .map(this::mapToSubmissionResponse)
                .toList();
    }

    @Transactional
    public SubmissionResponse gradeSubmission(Long submissionId, GradeSubmissionRequest request, UserPrincipal facultyPrincipal) {
        ProjectSubmission submission = submissionRepository.findById(submissionId)
                .orElseThrow(() -> new ResourceNotFoundException("Submission not found with id: " + submissionId));

        Faculty faculty = facultyRepository.findByUserId(facultyPrincipal.getId())
                .orElseThrow(() -> new UnauthorizedException("Only faculty can grade submissions"));

        if (!submission.getProject().getFaculty().getId().equals(faculty.getId()) && !"ROLE_ADMIN".equals(facultyPrincipal.getRole())) {
            throw new UnauthorizedException("You do not have permission to grade this submission");
        }

        submission.setGrade(request.getGrade());
        submission.setFeedback(request.getFeedback());
        submission.setStatus("REVIEWED");

        ProjectSubmission updated = submissionRepository.save(submission);
        return mapToSubmissionResponse(updated);
    }

    @Transactional(readOnly = true)
    public List<SubmissionResponse> getMySubmissions(UserPrincipal studentPrincipal) {
        Student student = studentRepository.findByUserId(studentPrincipal.getId())
                .orElseThrow(() -> new UnauthorizedException("Student profile not found"));

        return submissionRepository.findByStudentId(student.getId()).stream()
                .map(this::mapToSubmissionResponse)
                .toList();
    }

    public ProjectResponse mapToResponse(Project project, Student currentStudent) {
        ProjectResponse r = new ProjectResponse();
        r.setId(project.getId());
        r.setFacultyId(project.getFaculty().getId());
        r.setFacultyName(project.getFaculty().getUser().getFullName());
        r.setFacultyEmployeeId(project.getFaculty().getEmployeeId());
        r.setTitle(project.getTitle());
        r.setDescription(project.getDescription());
        r.setDepartment(project.getDepartment());
        r.setCourse(project.getCourse());
        r.setAcademicYear(project.getAcademicYear());
        r.setSemester(project.getSemester());
        r.setSection(project.getSection());
        r.setInstructions(project.getInstructions());
        r.setSubmissionFormat(project.getSubmissionFormat());
        r.setAttachmentUrl(project.getAttachmentUrl());
        r.setStartDate(project.getStartDate());
        r.setDueDate(project.getDueDate());
        r.setStatus(project.getStatus());
        r.setCreatedAt(project.getCreatedAt());

        LocalDate today = LocalDate.now();
        long daysRem = ChronoUnit.DAYS.between(today, project.getDueDate());
        r.setDaysRemaining(daysRem);
        r.setIsOverdue(today.isAfter(project.getDueDate()));

        long totalSubs = submissionRepository.countByProjectId(project.getId());
        long reviewedSubs = submissionRepository.countByProjectIdAndStatus(project.getId(), "REVIEWED");
        r.setTotalSubmissions(totalSubs);
        r.setReviewedSubmissions(reviewedSubs);

        // Calculate assigned student count
        long assignedCount = studentRepository.findByDepartment(project.getDepartment()).stream()
                .filter(s -> (project.getAcademicYear() == null || project.getAcademicYear().equalsIgnoreCase("All") || project.getAcademicYear().equalsIgnoreCase(s.getAcademicYear())) &&
                             (project.getSemester() == null || project.getSemester() == 0 || project.getSemester().equals(s.getSemester())) &&
                             (project.getSection() == null || project.getSection().equalsIgnoreCase("All") || project.getSection().equalsIgnoreCase(s.getSection())))
                .count();
        r.setAssignedStudentCount(assignedCount > 0 ? assignedCount : totalSubs);
        r.setPendingSubmissions(Math.max(0, r.getAssignedStudentCount() - totalSubs));

        if (currentStudent != null) {
            submissionRepository.findByProjectIdAndStudentId(project.getId(), currentStudent.getId())
                    .ifPresent(s -> {
                        r.setStudentSubmitted(true);
                        r.setStudentSubmissionStatus(s.getStatus());
                    });
            if (r.getStudentSubmitted() == null) {
                r.setStudentSubmitted(false);
                r.setStudentSubmissionStatus(r.getIsOverdue() ? "OVERDUE" : "PENDING");
            }
        }

        return r;
    }

    public SubmissionResponse mapToSubmissionResponse(ProjectSubmission s) {
        SubmissionResponse r = new SubmissionResponse();
        r.setId(s.getId());
        r.setProjectId(s.getProject().getId());
        r.setProjectTitle(s.getProject().getTitle());
        r.setStudentId(s.getStudent().getId());
        r.setStudentName(s.getStudent().getUser().getFullName());
        r.setStudentRegistrationNumber(s.getStudent().getRegistrationNumber());
        r.setStudentDepartment(s.getStudent().getDepartment());
        r.setSubmissionDate(s.getSubmissionDate());
        r.setSubmissionText(s.getSubmissionText());
        r.setFileUrl(s.getFileUrl());
        r.setFileName(s.getFileName());
        r.setFileSize(s.getFileSize());
        r.setStatus(s.getStatus());
        r.setGrade(s.getGrade());
        r.setFeedback(s.getFeedback());
        r.setCreatedAt(s.getCreatedAt());
        return r;
    }
}
