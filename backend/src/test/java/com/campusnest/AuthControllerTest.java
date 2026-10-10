package com.campusnest;

import com.campusnest.dto.auth.AuthResponse;
import com.campusnest.dto.auth.LoginRequest;
import com.campusnest.dto.auth.PasswordChangeRequest;
import com.campusnest.entity.Role;
import com.campusnest.entity.User;
import com.campusnest.exception.BadRequestException;
import com.campusnest.repository.FacultyRepository;
import com.campusnest.repository.StudentRepository;
import com.campusnest.repository.UserRepository;
import com.campusnest.security.JwtTokenProvider;
import com.campusnest.security.UserPrincipal;
import com.campusnest.service.AuthService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class AuthControllerTest {

    @Mock
    private AuthenticationManager authenticationManager;

    @Mock
    private UserRepository userRepository;

    @Mock
    private StudentRepository studentRepository;

    @Mock
    private FacultyRepository facultyRepository;

    @Mock
    private JwtTokenProvider tokenProvider;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private AuthService authService;

    private User user;
    private UserPrincipal principal;

    @BeforeEach
    void setUp() {
        Role role = new Role("ROLE_STUDENT", "Student");
        user = new User();
        user.setId(2L);
        user.setUsername("STU2026001");
        user.setFullName("Arjun Sharma");
        user.setEmail("arjun.sharma@campusnest.edu");
        user.setPasswordHash("$2a$10$hashedPassword");
        user.setRole(role);
        user.setIsActive(true);
        user.setFirstLogin(true);

        principal = UserPrincipal.create(user);
    }

    @Test
    @DisplayName("Should successfully login user and return JWT with role and first-login status")
    void testSuccessfulLogin() {
        LoginRequest request = new LoginRequest("STU2026001", "15082006");
        Authentication auth = mock(Authentication.class);
        when(auth.getPrincipal()).thenReturn(principal);

        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class))).thenReturn(auth);
        when(tokenProvider.generateToken(principal)).thenReturn("mock.jwt.token");
        when(userRepository.findById(2L)).thenReturn(Optional.of(user));

        AuthResponse response = authService.login(request);

        assertNotNull(response);
        assertEquals("mock.jwt.token", response.getToken());
        assertEquals("ROLE_STUDENT", response.getRole());
        assertTrue(response.getFirstLogin()); // Student must change password
    }

    @Test
    @DisplayName("Should change password, hash new password, and set firstLogin to false")
    void testChangePasswordSuccess() {
        PasswordChangeRequest request = new PasswordChangeRequest("15082006", "NewSecurePassword@123");

        when(userRepository.findById(2L)).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("15082006", "$2a$10$hashedPassword")).thenReturn(true);
        when(passwordEncoder.encode("NewSecurePassword@123")).thenReturn("$2a$10$newHashedPassword");

        authService.changePassword(principal, request);

        assertEquals("$2a$10$newHashedPassword", user.getPasswordHash());
        assertFalse(user.getFirstLogin()); // firstLogin is now false
        verify(userRepository, times(1)).save(user);
    }

    @Test
    @DisplayName("Should reject password change if current password does not match")
    void testChangePasswordMismatch() {
        PasswordChangeRequest request = new PasswordChangeRequest("wrongPassword", "NewSecurePassword@123");

        when(userRepository.findById(2L)).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("wrongPassword", "$2a$10$hashedPassword")).thenReturn(false);

        BadRequestException ex = assertThrows(BadRequestException.class, () ->
                authService.changePassword(principal, request)
        );

        assertTrue(ex.getMessage().contains("does not match"));
        verify(userRepository, never()).save(user);
    }
}
