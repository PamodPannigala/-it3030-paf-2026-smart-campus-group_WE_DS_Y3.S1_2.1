package com.campus.hub.dto;

import com.campus.hub.entity.Role;

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
