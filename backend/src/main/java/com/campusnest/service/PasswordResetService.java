package com.campusnest.service;

import com.campusnest.dto.auth.ForgotPasswordRequest;
import com.campusnest.dto.auth.PasswordResetVerifyResponse;
import com.campusnest.dto.auth.ResetPasswordRequest;
import com.campusnest.entity.PasswordResetToken;
import com.campusnest.entity.User;
import com.campusnest.exception.BadRequestException;
import com.campusnest.repository.FacultyRepository;
import com.campusnest.repository.PasswordResetTokenRepository;
import com.campusnest.repository.StudentRepository;
import com.campusnest.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

@Service
public class PasswordResetService {

    private static final Logger log = LoggerFactory.getLogger(PasswordResetService.class);
    private static final int TOKEN_EXPIRY_MINUTES = 15;

    private final UserRepository userRepository;
    private final StudentRepository studentRepository;
    private final FacultyRepository facultyRepository;
    private final PasswordResetTokenRepository resetTokenRepository;
    private final PasswordEncoder passwordEncoder;

    public PasswordResetService(UserRepository userRepository,
                                StudentRepository studentRepository,
                                FacultyRepository facultyRepository,
                                PasswordResetTokenRepository resetTokenRepository,
                                PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.studentRepository = studentRepository;
        this.facultyRepository = facultyRepository;
        this.resetTokenRepository = resetTokenRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional
    public String initiatePasswordReset(ForgotPasswordRequest request) {
        String identifier = request.getIdentifier().trim();

        // 1. Resolve user by identifier: username -> email -> registration number -> employee ID
        Optional<User> userOpt = resolveUserByIdentifier(identifier);

        if (userOpt.isPresent()) {
            User user = userOpt.get();

            // Invalidate any existing unused tokens for this user
            resetTokenRepository.findByUserIdAndUsedFalse(user.getId())
                    .forEach(t -> {
                        t.setUsed(true);
                        resetTokenRepository.save(t);
                    });

            // Generate cryptographically secure token
            String token = UUID.randomUUID().toString().replace("-", "") +
                    Long.toHexString(System.currentTimeMillis());

            LocalDateTime expiry = LocalDateTime.now().plusMinutes(TOKEN_EXPIRY_MINUTES);
            PasswordResetToken resetToken = new PasswordResetToken(user, token, expiry);
            resetTokenRepository.save(resetToken);

            log.info("Password reset initiated for user: '{}'. Token generated (expires in {} mins)",
                    user.getUsername(), TOKEN_EXPIRY_MINUTES);

            // In local development / when SMTP is unconfigured, log the assisted reset link for verification
            log.info("DEV / LOCAL ADMIN RESET LINK: /reset-password?token={}", token);
        } else {
            // Log for administrative debugging without revealing to caller
            log.warn("Password reset requested for unrecognized identifier: '{}'", identifier);
        }

        // Generic response to prevent account enumeration
        return "If an account matching the provided identifier exists in our records, password reset instructions have been generated.";
    }

    @Transactional(readOnly = true)
    public PasswordResetVerifyResponse validateToken(String token) {
        if (token == null || token.trim().isEmpty()) {
            return new PasswordResetVerifyResponse(false, null, "Password reset token is missing.");
        }

        Optional<PasswordResetToken> tokenOpt = resetTokenRepository.findByToken(token.trim());
        if (tokenOpt.isEmpty()) {
            return new PasswordResetVerifyResponse(false, null, "Invalid or unrecognized password reset token.");
        }

        PasswordResetToken resetToken = tokenOpt.get();
        if (Boolean.TRUE.equals(resetToken.getUsed())) {
            return new PasswordResetVerifyResponse(false, null, "This password reset token has already been used. Please request a new one.");
        }

        if (resetToken.isExpired()) {
            return new PasswordResetVerifyResponse(false, null, "This password reset token has expired. Please request a new one.");
        }

        return new PasswordResetVerifyResponse(true, resetToken.getUser().getUsername(), "Token is valid.");
    }

    @Transactional
    public void resetPassword(ResetPasswordRequest request) {
        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
            throw new BadRequestException("New password and confirm password do not match.");
        }

        validatePasswordStrength(request.getNewPassword());

        PasswordResetToken resetToken = resetTokenRepository.findByToken(request.getToken().trim())
                .orElseThrow(() -> new BadRequestException("Invalid or unrecognized password reset token."));

        if (Boolean.TRUE.equals(resetToken.getUsed())) {
            throw new BadRequestException("This password reset token has already been used.");
        }

        if (resetToken.isExpired()) {
            throw new BadRequestException("This password reset token has expired. Please request a new one.");
        }

        User user = resetToken.getUser();
        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        user.setFirstLogin(false);
        userRepository.save(user);

        // Mark token as used
        resetToken.setUsed(true);
        resetTokenRepository.save(resetToken);

        // Invalidate any other tokens for this user
        resetTokenRepository.findByUserIdAndUsedFalse(user.getId())
                .forEach(t -> {
                    t.setUsed(true);
                    resetTokenRepository.save(t);
                });

        log.info("Password successfully reset and updated for user: '{}'", user.getUsername());
    }

    private Optional<User> resolveUserByIdentifier(String identifier) {
        // Direct username match
        Optional<User> byUsername = userRepository.findByUsername(identifier);
        if (byUsername.isPresent()) return byUsername;

        // Email match
        Optional<User> byEmail = userRepository.findByEmail(identifier);
        if (byEmail.isPresent()) return byEmail;

        // Student registration number match
        Optional<User> byStudent = studentRepository.findByRegistrationNumber(identifier)
                .map(s -> s.getUser());
        if (byStudent.isPresent()) return byStudent;

        // Faculty employee ID match
        Optional<User> byFaculty = facultyRepository.findByEmployeeId(identifier)
                .map(f -> f.getUser());
        if (byFaculty.isPresent()) return byFaculty;

        return Optional.empty();
    }

    private void validatePasswordStrength(String password) {
        if (password == null || password.length() < 8) {
            throw new BadRequestException("Password must be at least 8 characters long.");
        }

        boolean hasLetter = password.chars().anyMatch(Character::isLetter);
        boolean hasDigit = password.chars().anyMatch(Character::isDigit);

        if (!hasLetter || !hasDigit) {
            throw new BadRequestException("Password must contain both letters and numbers.");
        }
    }
}
