package com.campusnest;

import com.campusnest.dto.project.GradeSubmissionRequest;
import com.campusnest.dto.project.SubmissionResponse;
import com.campusnest.entity.*;
import com.campusnest.exception.BadRequestException;
import com.campusnest.repository.FacultyRepository;
import com.campusnest.repository.NotificationRepository;
import com.campusnest.repository.ProjectRepository;
import com.campusnest.repository.ProjectSubmissionRepository;
import com.campusnest.security.UserPrincipal;
import com.campusnest.service.ProjectService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.Arrays;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class FacultyEvaluationAndRankingTest {

    @Mock
    private ProjectRepository projectRepository;

    @Mock
    private ProjectSubmissionRepository submissionRepository;

    @Mock
    private FacultyRepository facultyRepository;

    @Mock
    private NotificationRepository notificationRepository;

    @InjectMocks
    private ProjectService projectService;

    private Faculty faculty;
    private Project project;
    private Student student1;
    private Student student2;
    private Student student3;
    private Student student4;
    private ProjectSubmission sub1;
    private ProjectSubmission sub2;
    private ProjectSubmission sub3;
    private ProjectSubmission sub4;
    private UserPrincipal facultyPrincipal;

    @BeforeEach
    void setUp() {
        User facUser = new User();
        facUser.setId(7L);
        facUser.setUsername("FAC2026001");
        facUser.setFullName("Dr. Rajesh Kumar");

        faculty = new Faculty();
        faculty.setId(1L);
        faculty.setUser(facUser);
        faculty.setDepartment("Computer Science & Engineering");

        facultyPrincipal = new UserPrincipal(7L, "FAC2026001", "pass", "Dr. Rajesh Kumar",
                "rajesh@campusnest.edu", "ROLE_FACULTY", true, false, false, java.util.Collections.emptyList());

        project = new Project();
        project.setId(10L);
        project.setFaculty(faculty);
        project.setTitle("Raft Key-Value Store");
        project.setMaxScore(100);
        project.setDepartment("Computer Science & Engineering");
        project.setCourse("B.Tech CSE");
        project.setStartDate(LocalDate.now().minusDays(10));
        project.setDueDate(LocalDate.now().plusDays(5));

        student1 = createStudent(2L, "STU2026001", "Student A");
        student2 = createStudent(3L, "STU2026002", "Student B");
        student3 = createStudent(4L, "STU2026003", "Student C");
        student4 = createStudent(5L, "STU2026004", "Student D");

        sub1 = createSubmission(1L, project, student1, 95.0);
        sub2 = createSubmission(2L, project, student2, 90.0);
        sub3 = createSubmission(3L, project, student3, 90.0); // Tied with sub2
        sub4 = createSubmission(4L, project, student4, 85.0);
    }

    private Student createStudent(Long userId, String regNo, String name) {
        User u = new User();
        u.setId(userId);
        u.setUsername(regNo);
        u.setFullName(name);

        Student s = new Student();
        s.setId(userId);
        s.setUser(u);
        s.setRegistrationNumber(regNo);
        s.setDepartment("Computer Science & Engineering");
        s.setAcademicYear("Third Year");
        s.setSemester(6);
        s.setSection("A");
        return s;
    }

    private ProjectSubmission createSubmission(Long id, Project proj, Student s, Double score) {
        ProjectSubmission sub = new ProjectSubmission();
        sub.setId(id);
        sub.setProject(proj);
        sub.setStudent(s);
        sub.setScore(score);
        sub.setMaxScore(100);
        sub.setStatus("SUBMITTED");
        return sub;
    }

    @Test
    @DisplayName("Should enforce standard competition ranking (1, 2, 2, 4) with tied scores")
    void testStandardCompetitionRankingWithTies() {
        when(submissionRepository.findById(1L)).thenReturn(Optional.of(sub1));
        when(facultyRepository.findByUserId(7L)).thenReturn(Optional.of(faculty));
        when(submissionRepository.save(any(ProjectSubmission.class))).thenAnswer(i -> i.getArgument(0));

        // Submissions ordered by score desc: 95.0, 90.0, 90.0, 85.0
        when(submissionRepository.findByProjectIdOrderByScoreDesc(10L))
                .thenReturn(Arrays.asList(sub1, sub2, sub3, sub4));

        GradeSubmissionRequest request = new GradeSubmissionRequest("A+", 95.0, "Great work", null, false);
        SubmissionResponse response = projectService.gradeSubmission(1L, request, facultyPrincipal);

        assertNotNull(response);
        assertEquals(95.0, response.getScore());
        assertEquals(1, sub1.getRankPosition()); // Student A: rank 1
        assertEquals(2, sub2.getRankPosition()); // Student B: rank 2 (90.0)
        assertEquals(2, sub3.getRankPosition()); // Student C: rank 2 (tied with B)
        assertEquals(4, sub4.getRankPosition()); // Student D: rank 4 (1224 competition tie rule!)
    }

    @Test
    @DisplayName("Should reject score exceeding assignment max score")
    void testScoreExceedingMaxScoreRejected() {
        when(submissionRepository.findById(1L)).thenReturn(Optional.of(sub1));
        when(facultyRepository.findByUserId(7L)).thenReturn(Optional.of(faculty));

        GradeSubmissionRequest request = new GradeSubmissionRequest("A+", 105.0, "Too high", null, false);

        BadRequestException ex = assertThrows(BadRequestException.class, () ->
                projectService.gradeSubmission(1L, request, facultyPrincipal)
        );

        assertTrue(ex.getMessage().contains("cannot exceed maximum assignment score"));
    }
}
