package com.campus.hub.user.service;

import com.campus.hub.exception.EntityNotFoundException;
import com.campus.hub.user.dto.AdminCreateUserRequest;
import com.campus.hub.user.dto.UserSummaryResponse;
import com.campus.hub.user.entity.CampusUser;
import com.campus.hub.user.entity.Role;
import com.campus.hub.user.repository.CampusUserRepository;
import java.util.List;
import java.util.Locale;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class UserManagementServiceImpl implements UserManagementService {

    private final CampusUserRepository campusUserRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional(readOnly = true)
    public List<UserSummaryResponse> getAllUsers() {
        return campusUserRepository.findAll()
                .stream()
                .map(this::toSummary)
                .toList();
    }

    @Override
    @Transactional
    public UserSummaryResponse createUser(AdminCreateUserRequest request) {
        Role role = request.role();
        if (role != Role.ADMIN && role != Role.TECHNICIAN) {
            throw new IllegalArgumentException("Only ADMIN or TECHNICIAN accounts can be created here. Regular users sign up on the public form.");
        }

        String normalizedEmail = normalizeEmail(request.email());
        String normalizedName = normalizeName(request.fullName());
        String normalizedUsername = normalizeUsername(request.username());

        campusUserRepository.findByEmailIgnoreCase(normalizedEmail).ifPresent(u -> {
            throw new IllegalArgumentException("Email is already registered");
        });
        if (campusUserRepository.existsByUsernameIgnoreCase(normalizedUsername)) {
            throw new IllegalArgumentException("Username is already taken");
        }

        CampusUser user = CampusUser.builder()
                .fullName(normalizedName)
                .email(normalizedEmail)
                .username(normalizedUsername)
                .role(role)
                .authProvider("LOCAL")
                .passwordHash(passwordEncoder.encode(request.password()))
                .enabled(true)
                .build();

        CampusUser saved = campusUserRepository.save(user);
        return toSummary(saved);
    }

    @Override
    @Transactional
    public UserSummaryResponse updateRole(Long userId, Role role) {
        CampusUser user = campusUserRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("User not found with id: " + userId));
        user.setRole(role);
        CampusUser updated = campusUserRepository.save(user);
        return toSummary(updated);
    }

    private UserSummaryResponse toSummary(CampusUser user) {
        return new UserSummaryResponse(
                user.getId(),
                user.getFullName(),
                user.getEmail(),
                user.getUsername(),
                user.getRole(),
                user.getAuthProvider(),
                user.isEnabled()
        );
    }

    private String normalizeEmail(String email) {
        return email == null ? "" : email.trim().toLowerCase(Locale.ROOT);
    }

    private String normalizeName(String fullName) {
        String name = fullName == null ? "" : fullName.trim();
        if (name.isEmpty()) {
            throw new IllegalArgumentException("fullName is required");
        }
        return name;
    }

    private String normalizeUsername(String username) {
        if (username == null) {
            throw new IllegalArgumentException("username is required");
        }
        String normalized = username.trim().toLowerCase(Locale.ROOT);
        if (normalized.length() < 3) {
            throw new IllegalArgumentException("username is required");
        }
        return normalized;
    }
}
