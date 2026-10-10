package com.campusnest.service;

import com.campusnest.dto.auth.AuthResponse;
import com.campusnest.dto.auth.LoginRequest;
import com.campusnest.dto.auth.PasswordChangeRequest;
import com.campusnest.dto.user.UserResponse;
import com.campusnest.entity.Faculty;
import com.campusnest.entity.Student;
import com.campusnest.entity.User;
import com.campusnest.exception.BadRequestException;
import com.campusnest.exception.ResourceNotFoundException;
import com.campusnest.repository.FacultyRepository;
import com.campusnest.repository.StudentRepository;
import com.campusnest.repository.UserRepository;
import com.campusnest.security.JwtTokenProvider;
import com.campusnest.security.UserPrincipal;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final StudentRepository studentRepository;
    private final FacultyRepository facultyRepository;
    private final JwtTokenProvider tokenProvider;
    private final PasswordEncoder passwordEncoder;

    public AuthService(AuthenticationManager authenticationManager,
                       UserRepository userRepository,
                       StudentRepository studentRepository,
                       FacultyRepository facultyRepository,
                       JwtTokenProvider tokenProvider,
                       PasswordEncoder passwordEncoder) {
        this.authenticationManager = authenticationManager;
        this.userRepository = userRepository;
        this.studentRepository = studentRepository;
        this.facultyRepository = facultyRepository;
        this.tokenProvider = tokenProvider;
        this.passwordEncoder = passwordEncoder;
    }

    public AuthResponse login(LoginRequest loginRequest) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        loginRequest.getUsername(),
                        loginRequest.getPassword()
                )
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);
        UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
        String jwt = tokenProvider.generateToken(userPrincipal);

        User user = userRepository.findById(userPrincipal.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        AuthResponse response = new AuthResponse();
        response.setToken(jwt);
        response.setUserId(user.getId());
        response.setUsername(user.getUsername());
        response.setFullName(user.getFullName());
        response.setEmail(user.getEmail());
        response.setRole(user.getRole().getName());
        response.setFirstLogin(user.getFirstLogin());

        // Attach student or faculty specifics
        if ("ROLE_STUDENT".equals(user.getRole().getName())) {
            studentRepository.findByUserId(user.getId()).ifPresent(s -> {
                response.setStudentId(s.getId());
                response.setIdentifier(s.getRegistrationNumber());
                response.setDepartment(s.getDepartment());
            });
        } else if ("ROLE_FACULTY".equals(user.getRole().getName())) {
            facultyRepository.findByUserId(user.getId()).ifPresent(f -> {
                response.setFacultyId(f.getId());
                response.setIdentifier(f.getEmployeeId());
                response.setDepartment(f.getDepartment());
            });
        }

        return response;
    }

    @Transactional
    public void changePassword(UserPrincipal principal, PasswordChangeRequest request) {
        User user = userRepository.findById(principal.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPasswordHash())) {
            throw new BadRequestException("Current password does not match");
        }

        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        user.setFirstLogin(false);
        userRepository.save(user);
    }

    @Transactional(readOnly = true)
    public UserResponse getCurrentUser(UserPrincipal principal) {
        User user = userRepository.findById(principal.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        UserResponse response = new UserResponse();
        response.setId(user.getId());
        response.setUsername(user.getUsername());
        response.setFullName(user.getFullName());
        response.setEmail(user.getEmail());
        response.setPhone(user.getPhone());
        response.setRole(user.getRole().getName());
        response.setIsActive(user.getIsActive());
        response.setFirstLogin(user.getFirstLogin());
        response.setCreatedAt(user.getCreatedAt());

        if ("ROLE_STUDENT".equals(user.getRole().getName())) {
            studentRepository.findByUserId(user.getId()).ifPresent(s -> {
                response.setStudentId(s.getId());
                response.setRegistrationNumber(s.getRegistrationNumber());
                response.setDepartment(s.getDepartment());
                response.setCourse(s.getCourse());
                response.setAcademicYear(s.getAcademicYear());
            });
        } else if ("ROLE_FACULTY".equals(user.getRole().getName())) {
            facultyRepository.findByUserId(user.getId()).ifPresent(f -> {
                response.setFacultyId(f.getId());
                response.setEmployeeId(f.getEmployeeId());
                response.setDepartment(f.getDepartment());
                response.setDesignation(f.getDesignation());
                response.setJoiningDate(f.getJoiningDate());
            });
        }

        return response;
    }
}
