package com.campusnest.service;

import com.campusnest.dto.common.PagedResponse;
import com.campusnest.dto.user.StudentRegistrationRequest;
import com.campusnest.dto.user.UserResponse;
import com.campusnest.entity.Role;
import com.campusnest.entity.Student;
import com.campusnest.entity.User;
import com.campusnest.exception.BadRequestException;
import com.campusnest.exception.ResourceNotFoundException;
import com.campusnest.repository.RoleRepository;
import com.campusnest.repository.StudentRepository;
import com.campusnest.repository.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
public class StudentService {

    private final StudentRepository studentRepository;
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;

    public StudentService(StudentRepository studentRepository,
                          UserRepository userRepository,
                          RoleRepository roleRepository,
                          PasswordEncoder passwordEncoder) {
        this.studentRepository = studentRepository;
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional(readOnly = true)
    public PagedResponse<UserResponse> filterStudents(String academicYear, String department,
                                                      Integer semester, String section,
                                                      String query, Pageable pageable) {
        Page<Student> studentPage = studentRepository.filterStudents(
                academicYear, department, semester, section, query, pageable
        );
        List<UserResponse> responses = studentPage.getContent().stream()
                .map(this::mapToResponse)
                .toList();

        return PagedResponse.of(responses, studentPage);
    }

    @Transactional(readOnly = true)
    public PagedResponse<UserResponse> searchStudents(String query, Pageable pageable) {
        Page<Student> studentPage = studentRepository.searchStudents(query, pageable);
        List<UserResponse> responses = studentPage.getContent().stream()
                .map(this::mapToResponse)
                .toList();

        return PagedResponse.of(responses, studentPage);
    }

    @Transactional(readOnly = true)
    public UserResponse getStudentById(Long id) {
        Student student = studentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found with id: " + id));
        return mapToResponse(student);
    }

    @Transactional(readOnly = true)
    public UserResponse getStudentByUserId(Long userId) {
        Student student = studentRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Student profile not found for user id: " + userId));
        return mapToResponse(student);
    }

    @Transactional
    public UserResponse registerStudent(StudentRegistrationRequest request) {
        if (studentRepository.existsByRegistrationNumber(request.getRegistrationNumber())) {
            throw new BadRequestException("Student with registration number " + request.getRegistrationNumber() + " already exists");
        }
        if (userRepository.existsByUsername(request.getRegistrationNumber())) {
            throw new BadRequestException("Username " + request.getRegistrationNumber() + " already taken");
        }
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email " + request.getEmail() + " already registered");
        }

        Role studentRole = roleRepository.findByName("ROLE_STUDENT")
                .orElseThrow(() -> new ResourceNotFoundException("ROLE_STUDENT not found in database"));

        // Format DOB as DDMMYYYY for initial password
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("ddMMyyyy");
        String initialPassword = request.getDateOfBirth().format(formatter);

        User user = new User();
        user.setUsername(request.getRegistrationNumber());
        user.setPasswordHash(passwordEncoder.encode(initialPassword));
        user.setRole(studentRole);
        user.setFullName(request.getFullName());
        user.setEmail(request.getEmail());
        user.setPhone(request.getPhone());
        user.setIsActive(true);
        user.setFirstLogin(true); // Must change password on first login
        User savedUser = userRepository.save(user);

        Student student = new Student();
        student.setUser(savedUser);
        student.setRegistrationNumber(request.getRegistrationNumber());
        student.setDepartment(request.getDepartment());
        student.setCourse(request.getCourse());
        student.setAcademicYear(request.getAcademicYear());
        student.setSemester(request.getSemester() != null ? request.getSemester() : 6);
        student.setSection(request.getSection() != null && !request.getSection().isBlank() ? request.getSection() : "A");
        student.setDateOfBirth(request.getDateOfBirth());
        Student savedStudent = studentRepository.save(student);

        return mapToResponse(savedStudent);
    }

    @Transactional
    public UserResponse updateStudent(Long id, StudentRegistrationRequest request) {
        Student student = studentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found with id: " + id));

        User user = student.getUser();
        if (!user.getEmail().equals(request.getEmail()) && userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email " + request.getEmail() + " is already in use");
        }

        user.setFullName(request.getFullName());
        user.setEmail(request.getEmail());
        user.setPhone(request.getPhone());
        userRepository.save(user);

        student.setDepartment(request.getDepartment());
        student.setCourse(request.getCourse());
        student.setAcademicYear(request.getAcademicYear());
        if (request.getSemester() != null) {
            student.setSemester(request.getSemester());
        }
        if (request.getSection() != null && !request.getSection().isBlank()) {
            student.setSection(request.getSection());
        }
        student.setDateOfBirth(request.getDateOfBirth());
        Student updatedStudent = studentRepository.save(student);

        return mapToResponse(updatedStudent);
    }

    @Transactional
    public void toggleStudentStatus(Long id) {
        Student student = studentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found with id: " + id));

        User user = student.getUser();
        user.setIsActive(!user.getIsActive());
        userRepository.save(user);
    }

    @Transactional
    public void resetStudentPassword(Long id) {
        Student student = studentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found with id: " + id));

        User user = student.getUser();
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("ddMMyyyy");
        String initialPassword = student.getDateOfBirth().format(formatter);

        user.setPasswordHash(passwordEncoder.encode(initialPassword));
        user.setFirstLogin(true);
        userRepository.save(user);
    }

    public UserResponse mapToResponse(Student student) {
        User user = student.getUser();
        UserResponse response = new UserResponse();
        response.setId(user.getId());
        response.setUsername(user.getUsername());
        response.setFullName(user.getFullName());
        response.setEmail(user.getEmail());
        response.setPhone(user.getPhone());
        response.setRole(user.getRole().getName());
        response.setIsActive(user.getIsActive());
        response.setFirstLogin(user.getFirstLogin());
        response.setStudentId(student.getId());
        response.setRegistrationNumber(student.getRegistrationNumber());
        response.setDepartment(student.getDepartment());
        response.setCourse(student.getCourse());
        response.setAcademicYear(student.getAcademicYear());
        response.setSemester(student.getSemester());
        response.setSection(student.getSection());
        response.setAccountStatus(user.getIsActive() != null && user.getIsActive() ? "ACTIVE" : "INACTIVE");
        response.setCreatedAt(user.getCreatedAt());
        return response;
    }
}
