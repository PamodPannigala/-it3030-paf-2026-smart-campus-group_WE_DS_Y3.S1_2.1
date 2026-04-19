package com.campus.hub.dto;

import com.campus.hub.entity.Role;

public record AuthUserResponse(
        Long id,
        String fullName,
        String email,
        String username,
        Role role,
        String authProvider,
        String profilePictureUrl
) {
}
