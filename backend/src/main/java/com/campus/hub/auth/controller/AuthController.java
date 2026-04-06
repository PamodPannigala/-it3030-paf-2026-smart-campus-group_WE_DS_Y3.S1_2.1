package com.campus.hub.auth.controller;

import com.campus.hub.auth.dto.AuthUserResponse;
import com.campus.hub.security.AuthenticatedUserResolver;
import com.campus.hub.user.entity.CampusUser;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthenticatedUserResolver authenticatedUserResolver;

    @GetMapping("/me")
    public AuthUserResponse me(Authentication authentication) {
        CampusUser user = authenticatedUserResolver.resolve(authentication);
        return new AuthUserResponse(
                user.getId(),
                user.getFullName(),
                user.getEmail(),
                user.getRole(),
                user.getAuthProvider()
        );
    }
}
