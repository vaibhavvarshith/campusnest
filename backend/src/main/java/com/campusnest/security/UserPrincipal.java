package com.campusnest.security;

import com.campusnest.entity.User;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.ArrayList;
import java.util.Collection;
import java.util.List;

public class UserPrincipal implements UserDetails {

    private final Long id;
    private final String username;
    private final String password;
    private final String fullName;
    private final String email;
    private final String role;
    private final boolean isActive;
    private final boolean firstLogin;
    private final boolean isSubjectHead;
    private final Collection<? extends GrantedAuthority> authorities;

    public UserPrincipal(Long id, String username, String password, String fullName,
                         String email, String role, boolean isActive, boolean firstLogin,
                         Collection<? extends GrantedAuthority> authorities) {
        this(id, username, password, fullName, email, role, isActive, firstLogin, false, authorities);
    }

    public UserPrincipal(Long id, String username, String password, String fullName,
                         String email, String role, boolean isActive, boolean firstLogin,
                         boolean isSubjectHead,
                         Collection<? extends GrantedAuthority> authorities) {
        this.id = id;
        this.username = username;
        this.password = password;
        this.fullName = fullName;
        this.email = email;
        this.role = role;
        this.isActive = isActive;
        this.firstLogin = firstLogin;
        this.isSubjectHead = isSubjectHead;
        this.authorities = authorities;
    }

    public static UserPrincipal create(User user) {
        return create(user, false);
    }

    public static UserPrincipal create(User user, boolean isSubjectHead) {
        String roleName = user.getRole().getName();
        List<GrantedAuthority> authorities = new ArrayList<>();
        authorities.add(new SimpleGrantedAuthority(roleName));
        if (isSubjectHead) {
            authorities.add(new SimpleGrantedAuthority("ROLE_SUBJECT_HEAD"));
        }

        return new UserPrincipal(
                user.getId(),
                user.getUsername(),
                user.getPasswordHash(),
                user.getFullName(),
                user.getEmail(),
                roleName,
                user.getIsActive(),
                user.getFirstLogin(),
                isSubjectHead,
                authorities
        );
    }

    public Long getId() { return id; }
    public String getFullName() { return fullName; }
    public String getEmail() { return email; }
    public String getRole() { return role; }
    public boolean isFirstLogin() { return firstLogin; }
    public boolean isSubjectHead() { return isSubjectHead; }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() { return authorities; }

    @Override
    public String getPassword() { return password; }

    @Override
    public String getUsername() { return username; }

    @Override
    public boolean isAccountNonExpired() { return true; }

    @Override
    public boolean isAccountNonLocked() { return isActive; }

    @Override
    public boolean isCredentialsNonExpired() { return true; }

    @Override
    public boolean isEnabled() { return isActive; }
}
