package com.campus.hub.controller;

import com.campus.hub.security.AuthenticatedUserResolver;
import com.campus.hub.entity.CampusUser;
import com.campus.hub.repository.CampusUserRepository;
import com.campus.hub.service.AccountDeletionService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import java.util.Locale;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/profile")
@RequiredArgsConstructor
public class ProfileController {

    private final AuthenticatedUserResolver authenticatedUserResolver;
    private final CampusUserRepository campusUserRepository;
    private final AccountDeletionService accountDeletionService;

    public record ProfileUpdateRequest(
            @NotBlank(message = "fullName is required")
            String fullName,
            String username,
            String profilePictureUrl
    ) {}

    @GetMapping
    public Map<String, Object> me(Authentication authentication) {
        CampusUser user = authenticatedUserResolver.resolve(authentication);
        return Map.of(
                "id", user.getId(),
                "fullName", user.getFullName(),
                "email", user.getEmail(),
                "username", user.getUsername() != null ? user.getUsername() : "",
                "role", user.getRole(),
                "authProvider", user.getAuthProvider(),
                "lastLoginAt", user.getLastLoginAt(),
                "profilePictureUrl", user.getProfilePictureUrl() != null ? user.getProfilePictureUrl() : ""
        );
    }

    @PatchMapping
    public Map<String, Object> update(@Valid @RequestBody ProfileUpdateRequest request, Authentication authentication) {
        CampusUser user = authenticatedUserResolver.resolve(authentication);
        user.setFullName(request.fullName().trim());

        if (request.username() != null) {
            String raw = request.username().trim().toLowerCase(Locale.ROOT);
            if (raw.isEmpty()) {
                user.setUsername(null);
            } else {
                if (!raw.matches("^[a-z0-9_]{3,32}$")) {
                    throw new IllegalArgumentException("Username must be 3–32 characters (letters, digits, underscore)");
                }
                campusUserRepository.findByUsernameIgnoreCase(raw)
                        .filter(other -> !other.getId().equals(user.getId()))
                        .ifPresent(other -> {
                            throw new IllegalArgumentException("Username is already taken");
                        });
                user.setUsername(raw);
            }
        }

        if (request.profilePictureUrl() != null) {
            String url = request.profilePictureUrl().trim();
            user.setProfilePictureUrl(url.isEmpty() ? null : url);
        }

        CampusUser saved = campusUserRepository.save(user);
        return Map.of(
                "id", saved.getId(),
                "fullName", saved.getFullName(),
                "email", saved.getEmail(),
                "username", saved.getUsername() != null ? saved.getUsername() : "",
                "role", saved.getRole(),
                "authProvider", saved.getAuthProvider(),
                "lastLoginAt", saved.getLastLoginAt(),
                "profilePictureUrl", saved.getProfilePictureUrl() != null ? saved.getProfilePictureUrl() : ""
        );
    }

    @DeleteMapping
    public Map<String, String> delete(Authentication authentication) {
        CampusUser user = authenticatedUserResolver.resolve(authentication);
        accountDeletionService.deleteAccountForUser(user.getId());
        return Map.of("status", "deleted");
    }
}
