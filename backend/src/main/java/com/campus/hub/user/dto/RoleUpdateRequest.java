package com.campus.hub.user.dto;

import com.campus.hub.user.entity.Role;
import jakarta.validation.constraints.NotNull;

public record RoleUpdateRequest(
        @NotNull(message = "Role is required")
        Role role
) {
}
