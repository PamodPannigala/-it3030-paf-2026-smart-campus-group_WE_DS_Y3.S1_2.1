package com.campus.hub.security;

import com.campus.hub.entity.CampusUser;
import com.campus.hub.repository.CampusUserRepository;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class LocalUserDetailsService implements UserDetailsService {

    private final CampusUserRepository campusUserRepository;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        CampusUser user = campusUserRepository.findByEmailIgnoreCase(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        String passwordHash = user.getPasswordHash();
        if (passwordHash == null || passwordHash.isBlank()) {
            throw new UsernameNotFoundException("Local password not set for this account");
        }

        return new User(
                user.getEmail(),
                passwordHash,
                user.isEnabled(),
                true,
                true,
                true,
                List.of(new SimpleGrantedAuthority("ROLE_" + user.getRole().name()))
        );
    }
}

