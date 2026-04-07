package com.campus.hub.user.controller;

import com.campus.hub.security.AuthenticatedUserResolver;
import com.campus.hub.user.entity.CampusUser;
import com.campus.hub.user.repository.CampusUserRepository;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
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

    public record ProfileUpdateRequest(
            @NotBlank(message = "fullName is required")
            String fullName
    ) {}

    @GetMapping
    public Map<String, Object> me(Authentication authentication) {
        CampusUser user = authenticatedUserResolver.resolve(authentication);
        return Map.of(
                "id", user.getId(),
                "fullName", user.getFullName(),
                "email", user.getEmail(),
                "role", user.getRole(),
                "authProvider", user.getAuthProvider()
        );
    }

    @PatchMapping
    public Map<String, Object> update(@Valid @RequestBody ProfileUpdateRequest request, Authentication authentication) {
        CampusUser user = authenticatedUserResolver.resolve(authentication);
        user.setFullName(request.fullName().trim());
        CampusUser saved = campusUserRepository.save(user);
        return Map.of(
                "id", saved.getId(),
                "fullName", saved.getFullName(),
                "email", saved.getEmail(),
                "role", saved.getRole(),
                "authProvider", saved.getAuthProvider()
        );
    }

    @DeleteMapping
    public Map<String, String> delete(Authentication authentication) {
        CampusUser user = authenticatedUserResolver.resolve(authentication);
        campusUserRepository.deleteById(user.getId());
        return Map.of("status", "deleted");
    }
}

