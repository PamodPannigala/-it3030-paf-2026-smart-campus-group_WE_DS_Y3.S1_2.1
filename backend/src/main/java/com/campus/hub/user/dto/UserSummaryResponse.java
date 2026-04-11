package com.campus.hub.user.dto;

import com.campus.hub.user.entity.Role;

public record UserSummaryResponse(
        Long id,
        String fullName,
        String email,
        String username,
        Role role,
        String authProvider,
        boolean enabled
) {
}
