package com.campus.hub.auth.dto;

import com.campus.hub.user.entity.Role;

public record AuthUserResponse(
        Long id,
        String fullName,
        String email,
        Role role,
        String authProvider
) {
}
