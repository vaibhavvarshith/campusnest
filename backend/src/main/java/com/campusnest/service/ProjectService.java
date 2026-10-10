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
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
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
    private final NotificationRepository notificationRepository;

    public ProjectService(ProjectRepository projectRepository,
                          ProjectSubmissionRepository submissionRepository,
                          FacultyRepository facultyRepository,
                          StudentRepository studentRepository,
                          NotificationRepository notificationRepository) {
        this.projectRepository = projectRepository;
        this.submissionRepository = submissionRepository;
        this.facultyRepository = facultyRepository;
        this.studentRepository = studentRepository;
        this.notificationRepository = notificationRepository;
    }

    @Transactional
    public ProjectResponse createProject(ProjectRequest request, UserPrincipal facultyPrincipal) {
        Faculty faculty = facultyRepository.findByUserId(facultyPrincipal.getId())
                .orElseThrow(() -> new UnauthorizedException("Only faculty can create projects"));

        Project project = new Project();
        project.setFaculty(faculty);
        project.setTitle(request.getTitle());
        project.setDescription(request.getDescription());
        project.setDepartment(request.getDepartment());
        project.setCourse(request.getCourse());
        project.setSubjectName(request.getSubjectName() != null && !request.getSubjectName().isBlank() ? request.getSubjectName() : "Computer Science");
        project.setAcademicYear(request.getAcademicYear() != null && !request.getAcademicYear().isBlank() ? request.getAcademicYear() : "Third Year");
        project.setSemester(request.getSemester() != null ? request.getSemester() : 6);
        project.setSection(request.getSection() != null && !request.getSection().isBlank() ? request.getSection() : "A");
        project.setInstructions(request.getInstructions());
        project.setSubmissionFormat(request.getSubmissionFormat() != null && !request.getSubmissionFormat().isBlank() ? request.getSubmissionFormat() : "PDF Document / Report");
        project.setAttachmentUrl(request.getAttachmentUrl());
        project.setPdfUrl(request.getPdfUrl());
        project.setPdfFileName(request.getPdfFileName());
        project.setPdfFileSize(request.getPdfFileSize());
        project.setPriority(request.getPriority() != null ? request.getPriority() : "MEDIUM");
        project.setPriorityRank(request.getPriorityRank() != null ? request.getPriorityRank() : 1);
        project.setMaxScore(request.getMaxScore() != null ? request.getMaxScore() : 100);
        project.setAllocationNotes(request.getAllocationNotes());
        project.setStartDate(request.getStartDate());
        project.setDueDate(request.getDueDate());
        project.setStatus(request.getStatus() != null && !request.getStatus().isBlank() ? request.getStatus() : "PUBLISHED");

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
        if (request.getSubjectName() != null && !request.getSubjectName().isBlank()) {
            project.setSubjectName(request.getSubjectName());
        }
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
        if (request.getPdfUrl() != null) {
            project.setPdfUrl(request.getPdfUrl());
            project.setPdfFileName(request.getPdfFileName());
            project.setPdfFileSize(request.getPdfFileSize());
        }
        if (request.getPriority() != null) {
            project.setPriority(request.getPriority());
        }
        if (request.getPriorityRank() != null) {
            project.setPriorityRank(request.getPriorityRank());
        }
        if (request.getMaxScore() != null) {
            project.setMaxScore(request.getMaxScore());
        }
        if (request.getStatus() != null && !request.getStatus().isBlank()) {
            project.setStatus(request.getStatus());
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
        submission.setMaxScore(project.getMaxScore() != null ? project.getMaxScore() : 100);
        submission.setStatus(status);
        if (submission.getEvaluationStatus() == null) {
            submission.setEvaluationStatus("PENDING");
        }

        ProjectSubmission saved = submissionRepository.save(submission);

        // Notify student of submission confirmation
        Notification studentNotif = new Notification();
        studentNotif.setUser(student.getUser());
        studentNotif.setTitle("Assignment Submission Confirmed");
        studentNotif.setMessage(String.format("Your deliverable for '%s' (%s) was uploaded successfully.",
                project.getTitle(), project.getSubjectName()));
        studentNotif.setType("SUBMISSION_CONFIRMED");
        studentNotif.setReferenceId(saved.getId());
        studentNotif.setReferenceType("SUBMISSION");
        notificationRepository.save(studentNotif);

        // Notify faculty of incoming submission
        if (project.getFaculty() != null && project.getFaculty().getUser() != null) {
            Notification facNotif = new Notification();
            facNotif.setUser(project.getFaculty().getUser());
            facNotif.setTitle("New Student Deliverable Received");
            facNotif.setMessage(String.format("%s (%s) submitted work for '%s'.",
                    student.getUser().getFullName(), student.getRegistrationNumber(), project.getTitle()));
            facNotif.setType("STUDENT_SUBMITTED");
            facNotif.setReferenceId(saved.getId());
            facNotif.setReferenceType("SUBMISSION");
            notificationRepository.save(facNotif);
        }

        return mapToSubmissionResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<SubmissionResponse> getProjectSubmissions(Long projectId, UserPrincipal facultyPrincipal) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found with id: " + projectId));

        Faculty faculty = facultyRepository.findByUserId(facultyPrincipal.getId())
                .orElseThrow(() -> new UnauthorizedException("Only faculty can view submissions"));

        boolean isAssignedFaculty = project.getFaculty().getId().equals(faculty.getId());
        boolean isSubjectHead = project.getSubjectHead() != null && project.getSubjectHead().getId().equals(faculty.getId());
        boolean isAdmin = "ROLE_ADMIN".equals(facultyPrincipal.getRole());

        if (!isAssignedFaculty && !isSubjectHead && !isAdmin) {
            throw new UnauthorizedException("You do not have access to these submissions");
        }

        return submissionRepository.findByProjectIdOrderByScoreDesc(projectId).stream()
                .map(this::mapToSubmissionResponse)
                .toList();
    }

    @Transactional
    public SubmissionResponse gradeSubmission(Long submissionId, GradeSubmissionRequest request, UserPrincipal facultyPrincipal) {
        ProjectSubmission submission = submissionRepository.findById(submissionId)
                .orElseThrow(() -> new ResourceNotFoundException("Submission not found with id: " + submissionId));

        Faculty faculty = facultyRepository.findByUserId(facultyPrincipal.getId())
                .orElseThrow(() -> new UnauthorizedException("Only faculty can grade submissions"));

        Project project = submission.getProject();
        boolean isAssignedFaculty = project.getFaculty().getId().equals(faculty.getId());
        boolean isSubjectHead = project.getSubjectHead() != null && project.getSubjectHead().getId().equals(faculty.getId());
        boolean isAdmin = "ROLE_ADMIN".equals(facultyPrincipal.getRole());

        if (!isAssignedFaculty && !isSubjectHead && !isAdmin) {
            throw new UnauthorizedException("You do not have permission to grade this submission");
        }

        if (request.getScore() != null && request.getScore() > project.getMaxScore()) {
            throw new BadRequestException("Score cannot exceed maximum assignment score of " + project.getMaxScore());
        }

        submission.setScore(request.getScore());
        submission.setGrade(request.getGrade());
        submission.setFeedback(request.getFeedback());
        submission.setRubricMarks(request.getRubricMarks());
        submission.setEvaluatedBy(faculty);
        submission.setEvaluatedAt(LocalDateTime.now());

        boolean isDraft = Boolean.TRUE.equals(request.getIsDraft());
        submission.setEvaluationStatus(isDraft ? "DRAFT" : "EVALUATED");
        submission.setStatus("REVIEWED");

        ProjectSubmission updated = submissionRepository.save(submission);

        // Recalculate competition ranks (1, 2, 2, 4) among evaluated submissions of this project
        recalculateProjectSubmissionRanks(project.getId());

        // Refresh updated entity
        ProjectSubmission refreshed = submissionRepository.findById(submissionId).orElse(updated);

        // Notify student if evaluation is published (not draft)
        if (!isDraft) {
            Notification notification = new Notification();
            notification.setUser(submission.getStudent().getUser());
            notification.setTitle("Assignment Evaluated & Ranked");
            notification.setMessage(String.format("Your submission for '%s' was evaluated by Prof. %s. Score: %.1f/%d, Grade: %s, Rank: #%s",
                    project.getTitle(), faculty.getUser().getFullName(),
                    refreshed.getScore() != null ? refreshed.getScore() : 0.0,
                    project.getMaxScore(),
                    refreshed.getGrade() != null ? refreshed.getGrade() : "N/A",
                    refreshed.getRankPosition() != null ? refreshed.getRankPosition() : 1));
            notification.setType("SUBMISSION_EVALUATED");
            notification.setReferenceId(refreshed.getId());
            notification.setReferenceType("SUBMISSION");
            notificationRepository.save(notification);
        }

        return mapToSubmissionResponse(refreshed);
    }

    private void recalculateProjectSubmissionRanks(Long projectId) {
        List<ProjectSubmission> evaluatedList = submissionRepository.findByProjectIdOrderByScoreDesc(projectId).stream()
                .filter(s -> s.getScore() != null)
                .toList();

        for (int i = 0; i < evaluatedList.size(); i++) {
            ProjectSubmission current = evaluatedList.get(i);
            if (i > 0 && current.getScore().equals(evaluatedList.get(i - 1).getScore())) {
                current.setRankPosition(evaluatedList.get(i - 1).getRankPosition());
            } else {
                current.setRankPosition(i + 1);
            }
            submissionRepository.save(current);
        }
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
        r.setFacultyId(project.getFaculty() != null ? project.getFaculty().getId() : null);
        r.setFacultyName(project.getFaculty() != null ? project.getFaculty().getUser().getFullName() : "Unassigned");
        r.setFacultyEmployeeId(project.getFaculty() != null ? project.getFaculty().getEmployeeId() : null);

        if (project.getSubjectHead() != null) {
            r.setSubjectHeadId(project.getSubjectHead().getId());
            r.setSubjectHeadName(project.getSubjectHead().getUser().getFullName());
        }

        r.setSubjectName(project.getSubjectName());
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
        r.setPdfUrl(project.getPdfUrl());
        r.setPdfFileName(project.getPdfFileName());
        r.setPdfFileSize(project.getPdfFileSize());
        r.setPriority(project.getPriority());
        r.setPriorityRank(project.getPriorityRank());
        r.setMaxScore(project.getMaxScore());
        r.setAllocationNotes(project.getAllocationNotes());
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
                        r.setStudentScore(s.getScore());
                        r.setStudentRank(s.getRankPosition());
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
        r.setSubjectName(s.getProject().getSubjectName());
        r.setStudentId(s.getStudent().getId());
        r.setStudentName(s.getStudent().getUser().getFullName());
        r.setStudentRegistrationNumber(s.getStudent().getRegistrationNumber());
        r.setStudentDepartment(s.getStudent().getDepartment());
        r.setAcademicYear(s.getStudent().getAcademicYear());
        r.setSemester(s.getStudent().getSemester());
        r.setSection(s.getStudent().getSection());
        r.setSubmissionDate(s.getSubmissionDate());
        r.setSubmissionText(s.getSubmissionText());
        r.setFileUrl(s.getFileUrl());
        r.setFileName(s.getFileName());
        r.setFileSize(s.getFileSize());
        r.setPdfFilePath(s.getPdfFilePath());
        r.setStatus(s.getStatus());
        r.setScore(s.getScore());
        r.setMaxScore(s.getMaxScore());
        r.setRankPosition(s.getRankPosition());
        r.setGrade(s.getGrade());
        r.setFeedback(s.getFeedback());
        r.setRubricMarks(s.getRubricMarks());
        r.setEvaluationStatus(s.getEvaluationStatus());
        if (s.getEvaluatedBy() != null) {
            r.setEvaluatedById(s.getEvaluatedBy().getId());
            r.setEvaluatedByName(s.getEvaluatedBy().getUser().getFullName());
        }
        r.setEvaluatedAt(s.getEvaluatedAt());
        r.setCreatedAt(s.getCreatedAt());
        return r;
    }
}
