package com.campusnest.bootstrap;

import com.campusnest.entity.Role;
import com.campusnest.entity.User;
import com.campusnest.repository.RoleRepository;
import com.campusnest.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Component
@Order(1)
public class DevAccountBootstrap implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DevAccountBootstrap.class);

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;

    public DevAccountBootstrap(UserRepository userRepository,
                               RoleRepository roleRepository,
                               PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public void run(String... args) {
        ensureRoleExists("ROLE_ADMIN", "Administrator with full system privileges");
        ensureRoleExists("ROLE_LIBRARIAN", "Librarian with circulation desk privileges");
        ensureRoleExists("ROLE_FACULTY", "College faculty with assignment and evaluation privileges");
        ensureRoleExists("ROLE_STUDENT", "Student with borrowing and submission privileges");

        bootstrapAdminAccount();
        bootstrapLibrarianAccount();
        bootstrapFacultyAccounts();
        bootstrapStudentAccounts();
    }

    private void ensureRoleExists(String name, String description) {
        if (roleRepository.findByName(name).isEmpty()) {
            Role role = new Role(name, description);
            roleRepository.save(role);
            log.info("Created system role: {}", name);
        }
    }

    private void bootstrapAdminAccount() {
        Role adminRole = roleRepository.findByName("ROLE_ADMIN")
                .orElseThrow(() -> new IllegalStateException("ROLE_ADMIN not found"));

        User admin = userRepository.findByUsername("Admin")
                .or(() -> userRepository.findByUsername("admin"))
                .or(() -> userRepository.findByUsernameIgnoreCase("Admin"))
                .or(() -> userRepository.findByEmail("admin@campusnest.edu"))
                .orElse(null);

        if (admin == null) {
            admin = new User();
            admin.setUsername("Admin");
            admin.setFullName("System Administrator");
            admin.setEmail("admin@campusnest.edu");
            admin.setPhone("+91 9876543210");
            admin.setRole(adminRole);
            admin.setPasswordHash(passwordEncoder.encode("ADM2026"));
            admin.setIsActive(true);
            admin.setFirstLogin(false);
            userRepository.save(admin);
            log.info("Initialized default development Admin account: 'Admin'");
        } else {
            admin.setUsername("Admin");
            admin.setRole(adminRole);
            admin.setIsActive(true);

            // Determine if current password hash is a known default dev password
            boolean isLegacyDevHash = admin.getPasswordHash() != null && (
                    passwordEncoder.matches("admin123", admin.getPasswordHash()) ||
                    passwordEncoder.matches("Admin2026", admin.getPasswordHash())
            );
            boolean isCurrentDevHash = admin.getPasswordHash() != null && passwordEncoder.matches("ADM2026", admin.getPasswordHash());
            boolean isUnsetOrFirstLogin = admin.getPasswordHash() == null || Boolean.TRUE.equals(admin.getFirstLogin());

            if (isLegacyDevHash || isUnsetOrFirstLogin) {
                admin.setPasswordHash(passwordEncoder.encode("ADM2026"));
                admin.setFirstLogin(false);
                userRepository.save(admin);
                log.info("Updated development Admin account 'Admin' with default development credentials");
            } else if (isCurrentDevHash) {
                admin.setFirstLogin(false);
                userRepository.save(admin);
                log.info("Verified development Admin account 'Admin'");
            } else {
                userRepository.save(admin);
                log.info("Admin account has custom password configured. Preserving chosen credentials.");
            }
        }
    }

    private void bootstrapLibrarianAccount() {
        Role librarianRole = roleRepository.findByName("ROLE_LIBRARIAN")
                .orElseThrow(() -> new IllegalStateException("ROLE_LIBRARIAN not found"));

        User librarian = userRepository.findByUsername("librarian")
                .or(() -> userRepository.findByUsernameIgnoreCase("librarian"))
                .or(() -> userRepository.findByEmail("librarian@campusnest.edu"))
                .orElse(null);

        if (librarian == null) {
            librarian = new User();
            librarian.setUsername("librarian");
            librarian.setFullName("Chief Librarian");
            librarian.setEmail("librarian@campusnest.edu");
            librarian.setPhone("+91 9876543221");
            librarian.setRole(librarianRole);
            librarian.setPasswordHash(passwordEncoder.encode("LIB2026"));
            librarian.setIsActive(true);
            librarian.setFirstLogin(false);
            userRepository.save(librarian);
            log.info("Initialized default development Librarian account: 'librarian'");
        } else {
            librarian.setRole(librarianRole);
            librarian.setIsActive(true);

            boolean isLegacyDevHash = librarian.getPasswordHash() != null && (
                    passwordEncoder.matches("librarian123", librarian.getPasswordHash()) ||
                    librarian.getPasswordHash().startsWith("$2a$10$fOKbH8") ||
                    librarian.getPasswordHash().startsWith("$2a$10$IAwqvr")
            );
            boolean isCurrentDevHash = librarian.getPasswordHash() != null && passwordEncoder.matches("LIB2026", librarian.getPasswordHash());
            boolean isUnsetOrFirstLogin = librarian.getPasswordHash() == null || Boolean.TRUE.equals(librarian.getFirstLogin());

            if (isLegacyDevHash || isUnsetOrFirstLogin) {
                librarian.setPasswordHash(passwordEncoder.encode("LIB2026"));
                librarian.setFirstLogin(false);
                userRepository.save(librarian);
                log.info("Updated development Librarian account with default development credentials");
            } else if (isCurrentDevHash) {
                librarian.setFirstLogin(false);
                userRepository.save(librarian);
                log.info("Verified development Librarian account");
            } else {
                userRepository.save(librarian);
                log.info("Librarian account has custom password configured. Preserving chosen credentials.");
            }
        }
    }

    private void bootstrapFacultyAccounts() {
        List<User> facultyUsers = userRepository.findAll().stream()
                .filter(u -> u.getRole() != null && "ROLE_FACULTY".equals(u.getRole().getName()))
                .toList();

        for (User faculty : facultyUsers) {
            faculty.setIsActive(true);
            boolean isLegacyDevHash = faculty.getPasswordHash() != null && (
                    passwordEncoder.matches("FacultyPass123@", faculty.getPasswordHash()) ||
                    passwordEncoder.matches("FacultyPassword123!", faculty.getPasswordHash()) ||
                    passwordEncoder.matches("Faculty@123", faculty.getPasswordHash()) ||
                    passwordEncoder.matches("password", faculty.getPasswordHash())
            );
            boolean isCurrentDevHash = faculty.getPasswordHash() != null && passwordEncoder.matches("FAC2026", faculty.getPasswordHash());
            boolean isUnsetOrFirstLogin = faculty.getPasswordHash() == null || Boolean.TRUE.equals(faculty.getFirstLogin());

            if (isLegacyDevHash || isUnsetOrFirstLogin) {
                faculty.setPasswordHash(passwordEncoder.encode("FAC2026"));
                faculty.setFirstLogin(false);
                userRepository.save(faculty);
                log.info("Updated development Faculty account '{}' with default development credentials", faculty.getUsername());
            } else if (isCurrentDevHash) {
                faculty.setFirstLogin(false);
                userRepository.save(faculty);
            } else {
                log.info("Faculty account '{}' has custom password configured. Preserving chosen credentials.", faculty.getUsername());
            }
        }
    }

    private void bootstrapStudentAccounts() {
        List<User> studentUsers = userRepository.findAll().stream()
                .filter(u -> u.getRole() != null && "ROLE_STUDENT".equals(u.getRole().getName()))
                .toList();

        for (User student : studentUsers) {
            student.setIsActive(true);
            boolean isLegacyDevHash = student.getPasswordHash() != null && (
                    passwordEncoder.matches("NewStudentPass123@", student.getPasswordHash()) ||
                    passwordEncoder.matches("Password@2026", student.getPasswordHash()) ||
                    passwordEncoder.matches("Student@123", student.getPasswordHash()) ||
                    passwordEncoder.matches("password", student.getPasswordHash()) ||
                    passwordEncoder.matches("22112005", student.getPasswordHash())
            );
            boolean isCurrentDevHash = student.getPasswordHash() != null && passwordEncoder.matches("STU2026", student.getPasswordHash());
            boolean isUnsetOrFirstLogin = student.getPasswordHash() == null || Boolean.TRUE.equals(student.getFirstLogin());

            if (isLegacyDevHash || isUnsetOrFirstLogin) {
                student.setPasswordHash(passwordEncoder.encode("STU2026"));
                student.setFirstLogin(false);
                userRepository.save(student);
                log.info("Updated development Student account '{}' with default development credentials", student.getUsername());
            } else if (isCurrentDevHash) {
                student.setFirstLogin(false);
                userRepository.save(student);
            } else {
                log.info("Student account '{}' has custom password configured. Preserving chosen credentials.", student.getUsername());
            }
        }
    }
}
