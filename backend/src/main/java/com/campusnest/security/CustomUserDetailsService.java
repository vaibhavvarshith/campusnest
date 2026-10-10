package com.campusnest.security;

import com.campusnest.entity.Faculty;
import com.campusnest.entity.User;
import com.campusnest.repository.FacultyRepository;
import com.campusnest.repository.UserRepository;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;
    private final FacultyRepository facultyRepository;

    public CustomUserDetailsService(UserRepository userRepository, FacultyRepository facultyRepository) {
        this.userRepository = userRepository;
        this.facultyRepository = facultyRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        User user = userRepository.findByUsername(username)
                .or(() -> {
                    if ("LIB2026001".equalsIgnoreCase(username)) {
                        return userRepository.findByUsername("librarian");
                    } else if ("librarian".equalsIgnoreCase(username)) {
                        return userRepository.findByUsername("LIB2026001");
                    }
                    return java.util.Optional.empty();
                })
                .orElseThrow(() -> new UsernameNotFoundException("User not found with username: " + username));

        boolean isSubjectHead = false;
        if ("ROLE_FACULTY".equals(user.getRole().getName())) {
            isSubjectHead = facultyRepository.findByUserId(user.getId())
                    .map(Faculty::getIsSubjectHead)
                    .orElse(false);
        }

        return UserPrincipal.create(user, isSubjectHead);
    }

    @Transactional(readOnly = true)
    public UserDetails loadUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with id: " + id));

        boolean isSubjectHead = false;
        if ("ROLE_FACULTY".equals(user.getRole().getName())) {
            isSubjectHead = facultyRepository.findByUserId(user.getId())
                    .map(Faculty::getIsSubjectHead)
                    .orElse(false);
        }

        return UserPrincipal.create(user, isSubjectHead);
    }
}
