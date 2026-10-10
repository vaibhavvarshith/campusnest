package com.campusnest;

import com.campusnest.dto.auth.ForgotPasswordRequest;
import com.campusnest.dto.auth.PasswordResetVerifyResponse;
import com.campusnest.dto.auth.ResetPasswordRequest;
import com.campusnest.entity.PasswordResetToken;
import com.campusnest.entity.Role;
import com.campusnest.entity.User;
import com.campusnest.exception.BadRequestException;
import com.campusnest.repository.FacultyRepository;
import com.campusnest.repository.PasswordResetTokenRepository;
import com.campusnest.repository.StudentRepository;
import com.campusnest.repository.UserRepository;
import com.campusnest.service.PasswordResetService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class PasswordResetServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private StudentRepository studentRepository;

    @Mock
    private FacultyRepository facultyRepository;

    @Mock
    private PasswordResetTokenRepository resetTokenRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private PasswordResetService resetService;

    private User user;

    @BeforeEach
    void setUp() {
        Role role = new Role("ROLE_STUDENT", "Student");
        user = new User();
        user.setId(2L);
        user.setUsername("STU2026001");
        user.setEmail("student@campusnest.edu");
        user.setPasswordHash("$2a$10$oldHash");
        user.setRole(role);
        user.setIsActive(true);
        user.setFirstLogin(false);
    }

    @Test
    @DisplayName("Should generate secure reset token when user exists")
    void testInitiatePasswordResetSuccess() {
        when(userRepository.findByUsername("STU2026001")).thenReturn(Optional.of(user));
        when(resetTokenRepository.findByUserIdAndUsedFalse(2L)).thenReturn(Collections.emptyList());

        ForgotPasswordRequest request = new ForgotPasswordRequest("STU2026001", "student");
        String message = resetService.initiatePasswordReset(request);

        assertNotNull(message);
        assertTrue(message.contains("instructions have been generated"));
        verify(resetTokenRepository, times(1)).save(any(PasswordResetToken.class));
    }

    @Test
    @DisplayName("Should return generic message when user does not exist to prevent enumeration")
    void testInitiatePasswordResetNonExistentUser() {
        when(userRepository.findByUsername("unknown")).thenReturn(Optional.empty());
        when(userRepository.findByEmail("unknown")).thenReturn(Optional.empty());
        when(studentRepository.findByRegistrationNumber("unknown")).thenReturn(Optional.empty());
        when(facultyRepository.findByEmployeeId("unknown")).thenReturn(Optional.empty());

        ForgotPasswordRequest request = new ForgotPasswordRequest("unknown", "student");
        String message = resetService.initiatePasswordReset(request);

        assertNotNull(message);
        assertTrue(message.contains("instructions have been generated"));
        verify(resetTokenRepository, never()).save(any(PasswordResetToken.class));
    }

    @Test
    @DisplayName("Should validate active unexpired token successfully")
    void testValidateTokenValid() {
        PasswordResetToken token = new PasswordResetToken(user, "valid-token-123", LocalDateTime.now().plusMinutes(10));
        when(resetTokenRepository.findByToken("valid-token-123")).thenReturn(Optional.of(token));

        PasswordResetVerifyResponse response = resetService.validateToken("valid-token-123");

        assertTrue(response.isValid());
        assertEquals("STU2026001", response.getUsername());
    }

    @Test
    @DisplayName("Should reject expired or already consumed tokens")
    void testValidateTokenExpiredOrUsed() {
        PasswordResetToken expiredToken = new PasswordResetToken(user, "expired-token", LocalDateTime.now().minusMinutes(5));
        when(resetTokenRepository.findByToken("expired-token")).thenReturn(Optional.of(expiredToken));

        PasswordResetVerifyResponse expiredRes = resetService.validateToken("expired-token");
        assertFalse(expiredRes.isValid());

        PasswordResetToken usedToken = new PasswordResetToken(user, "used-token", LocalDateTime.now().plusMinutes(10));
        usedToken.setUsed(true);
        when(resetTokenRepository.findByToken("used-token")).thenReturn(Optional.of(usedToken));

        PasswordResetVerifyResponse usedRes = resetService.validateToken("used-token");
        assertFalse(usedRes.isValid());
    }

    @Test
    @DisplayName("Should successfully reset password, hash it, and invalidate token")
    void testResetPasswordSuccess() {
        PasswordResetToken token = new PasswordResetToken(user, "token-xyz", LocalDateTime.now().plusMinutes(10));
        when(resetTokenRepository.findByToken("token-xyz")).thenReturn(Optional.of(token));
        when(passwordEncoder.encode("NewStrongPassword@2026")).thenReturn("$2a$10$newHashVal");

        ResetPasswordRequest request = new ResetPasswordRequest("token-xyz", "NewStrongPassword@2026", "NewStrongPassword@2026");
        resetService.resetPassword(request);

        assertEquals("$2a$10$newHashVal", user.getPasswordHash());
        assertTrue(token.getUsed());
        verify(userRepository, times(1)).save(user);
        verify(resetTokenRepository, atLeastOnce()).save(token);
    }
}
