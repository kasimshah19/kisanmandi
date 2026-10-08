package com.kisanmandi.security;

import com.kisanmandi.entity.User;
import com.kisanmandi.entity.UserStatus;
import com.kisanmandi.repository.UserRepository;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.*;
import org.springframework.stereotype.Service;

import java.util.List;

// Loads user details from the database for Spring Security authentication
@Service
public class UserDetailsServiceImpl implements UserDetailsService {

    private final UserRepository userRepository;

    public UserDetailsServiceImpl(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        // Find user by email (we use email as the "username")
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + email));

        // If user is blocked, Spring Security will throw DisabledException/LockedException
        boolean isActive = user.getStatus() == UserStatus.ACTIVE;

        // Authority must be prefixed with "ROLE_" for hasRole() checks to work
        return new org.springframework.security.core.userdetails.User(
                user.getEmail(),
                user.getPassword(),
                isActive,   // enabled
                true,       // accountNonExpired
                true,       // credentialsNonExpired
                isActive,   // accountNonLocked
                List.of(new SimpleGrantedAuthority("ROLE_" + user.getRole().name()))
        );
    }
}
