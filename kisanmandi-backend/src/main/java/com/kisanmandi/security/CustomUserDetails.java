package com.kisanmandi.security;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.User;

import java.util.Collection;

public class CustomUserDetails extends User {

    private final Long id;
    private final int tokenVersion;
    private final boolean emailVerified;

    public CustomUserDetails(Long id,
                             String username,
                             String password,
                             boolean enabled,
                             boolean accountNonExpired,
                             boolean credentialsNonExpired,
                             boolean accountNonLocked,
                             int tokenVersion,
                             boolean emailVerified,
                             Collection<? extends GrantedAuthority> authorities) {
        super(username, password, enabled, accountNonExpired, credentialsNonExpired, accountNonLocked, authorities);
        this.id = id;
        this.tokenVersion = tokenVersion;
        this.emailVerified = emailVerified;
    }

    public Long getId() {
        return id;
    }

    public int getTokenVersion() {
        return tokenVersion;
    }

    public boolean isEmailVerified() {
        return emailVerified;
    }
}
