package com.campusnest.service;

import com.campusnest.dto.common.PagedResponse;
import com.campusnest.dto.user.FacultyRegistrationRequest;
import com.campusnest.dto.user.UserResponse;
import com.campusnest.entity.Faculty;
import com.campusnest.entity.Role;
import com.campusnest.entity.User;
import com.campusnest.exception.BadRequestException;
import com.campusnest.exception.ResourceNotFoundException;
import com.campusnest.repository.FacultyRepository;
import com.campusnest.repository.RoleRepository;
import com.campusnest.repository.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
public class FacultyService {

    private final FacultyRepository facultyRepository;
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;

    public FacultyService(FacultyRepository facultyRepository,
                          UserRepository userRepository,
                          RoleRepository roleRepository,
                          PasswordEncoder passwordEncoder) {
        this.facultyRepository = facultyRepository;
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional(readOnly = true)
    public PagedResponse<UserResponse> searchFaculty(String query, Pageable pageable) {
        Page<Faculty> facultyPage = facultyRepository.searchFaculty(query, pageable);
        List<UserResponse> responses = facultyPage.getContent().stream()
                .map(this::mapToResponse)
                .toList();

        return PagedResponse.of(responses, facultyPage);
    }

    @Transactional(readOnly = true)
    public UserResponse getFacultyById(Long id) {
        Faculty faculty = facultyRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Faculty member not found with id: " + id));
        return mapToResponse(faculty);
    }

    @Transactional(readOnly = true)
    public UserResponse getFacultyByUserId(Long userId) {
        Faculty faculty = facultyRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Faculty profile not found for user id: " + userId));
        return mapToResponse(faculty);
    }

    @Transactional
    public UserResponse registerFaculty(FacultyRegistrationRequest request) {
        if (facultyRepository.existsByEmployeeId(request.getEmployeeId())) {
            throw new BadRequestException("Faculty with employee ID " + request.getEmployeeId() + " already exists");
        }
        if (userRepository.existsByUsername(request.getEmployeeId())) {
            throw new BadRequestException("Username " + request.getEmployeeId() + " already taken");
        }
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email " + request.getEmail() + " already registered");
        }

        Role facultyRole = roleRepository.findByName("ROLE_FACULTY")
                .orElseThrow(() -> new ResourceNotFoundException("ROLE_FACULTY not found in database"));

        String rawPassword = (request.getInitialPassword() != null && !request.getInitialPassword().isBlank())
                ? request.getInitialPassword()
                : "Faculty@123";

        User user = new User();
        user.setUsername(request.getEmployeeId());
        user.setPasswordHash(passwordEncoder.encode(rawPassword));
        user.setRole(facultyRole);
        user.setFullName(request.getFullName());
        user.setEmail(request.getEmail());
        user.setPhone(request.getPhone());
        user.setIsActive(true);
        user.setFirstLogin(true); // Force password change on initial login
        User savedUser = userRepository.save(user);

        Faculty faculty = new Faculty();
        faculty.setUser(savedUser);
        faculty.setEmployeeId(request.getEmployeeId());
        faculty.setDepartment(request.getDepartment());
        faculty.setDesignation(request.getDesignation());
        faculty.setJoiningDate(request.getJoiningDate() != null ? request.getJoiningDate() : LocalDate.now());
        Faculty savedFaculty = facultyRepository.save(faculty);

        return mapToResponse(savedFaculty);
    }

    @Transactional
    public UserResponse updateFaculty(Long id, FacultyRegistrationRequest request) {
        Faculty faculty = facultyRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Faculty member not found with id: " + id));

        User user = faculty.getUser();
        if (!user.getEmail().equals(request.getEmail()) && userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email " + request.getEmail() + " is already in use");
        }

        user.setFullName(request.getFullName());
        user.setEmail(request.getEmail());
        user.setPhone(request.getPhone());
        userRepository.save(user);

        faculty.setDepartment(request.getDepartment());
        faculty.setDesignation(request.getDesignation());
        if (request.getJoiningDate() != null) {
            faculty.setJoiningDate(request.getJoiningDate());
        }
        Faculty updatedFaculty = facultyRepository.save(faculty);

        return mapToResponse(updatedFaculty);
    }

    @Transactional
    public void toggleFacultyStatus(Long id) {
        Faculty faculty = facultyRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Faculty member not found with id: " + id));

        User user = faculty.getUser();
        user.setIsActive(!user.getIsActive());
        userRepository.save(user);
    }

    @Transactional
    public void resetFacultyPassword(Long id) {
        Faculty faculty = facultyRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Faculty member not found with id: " + id));

        User user = faculty.getUser();
        user.setPasswordHash(passwordEncoder.encode("Faculty@123"));
        user.setFirstLogin(true);
        userRepository.save(user);
    }

    public UserResponse mapToResponse(Faculty faculty) {
        User user = faculty.getUser();
        UserResponse response = new UserResponse();
        response.setId(user.getId());
        response.setUsername(user.getUsername());
        response.setFullName(user.getFullName());
        response.setEmail(user.getEmail());
        response.setPhone(user.getPhone());
        response.setRole(user.getRole().getName());
        response.setIsActive(user.getIsActive());
        response.setFirstLogin(user.getFirstLogin());
        response.setFacultyId(faculty.getId());
        response.setEmployeeId(faculty.getEmployeeId());
        response.setDepartment(faculty.getDepartment());
        response.setDesignation(faculty.getDesignation());
        response.setJoiningDate(faculty.getJoiningDate());
        response.setCreatedAt(user.getCreatedAt());
        return response;
    }
}
