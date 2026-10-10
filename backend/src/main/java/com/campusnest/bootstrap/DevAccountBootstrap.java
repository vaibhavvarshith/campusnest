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

        User admin = userRepository.findByUsername("admin")
                .or(() -> userRepository.findByEmail("admin@campusnest.edu"))
                .orElse(null);

        if (admin == null) {
            admin = new User();
            admin.setUsername("admin");
            admin.setFullName("System Administrator");
            admin.setEmail("admin@campusnest.edu");
            admin.setPhone("+91 9876543210");
            admin.setRole(adminRole);
            admin.setPasswordHash(passwordEncoder.encode("admin123"));
            admin.setIsActive(true);
            admin.setFirstLogin(true);
            userRepository.save(admin);
            log.info("Initialized default development Admin account: 'admin' (password: admin123)");
        } else if (Boolean.TRUE.equals(admin.getFirstLogin())) {
            admin.setUsername("admin");
            admin.setPasswordHash(passwordEncoder.encode("admin123"));
            userRepository.save(admin);
            log.info("Verified default development Admin account: 'admin' with initial password 'admin123'");
        } else {
            log.debug("Admin account has changed initial password. Preserving chosen credentials.");
        }
    }

    private void bootstrapLibrarianAccount() {
        Role librarianRole = roleRepository.findByName("ROLE_LIBRARIAN")
                .orElseThrow(() -> new IllegalStateException("ROLE_LIBRARIAN not found"));

        User librarian = userRepository.findByUsername("librarian")
                .or(() -> userRepository.findByEmail("librarian@campusnest.edu"))
                .orElse(null);

        if (librarian == null) {
            librarian = new User();
            librarian.setUsername("librarian");
            librarian.setFullName("Chief Librarian");
            librarian.setEmail("librarian@campusnest.edu");
            librarian.setPhone("+91 9876543221");
            librarian.setRole(librarianRole);
            librarian.setPasswordHash(passwordEncoder.encode("librarian123"));
            librarian.setIsActive(true);
            librarian.setFirstLogin(true);
            userRepository.save(librarian);
            log.info("Initialized default development Librarian account: 'librarian' (password: librarian123)");
        } else if (Boolean.TRUE.equals(librarian.getFirstLogin())) {
            librarian.setUsername("librarian");
            librarian.setPasswordHash(passwordEncoder.encode("librarian123"));
            userRepository.save(librarian);
            log.info("Verified default development Librarian account: 'librarian' with initial password 'librarian123'");
        } else {
            log.debug("Librarian account has changed initial password. Preserving chosen credentials.");
        }
    }
}
