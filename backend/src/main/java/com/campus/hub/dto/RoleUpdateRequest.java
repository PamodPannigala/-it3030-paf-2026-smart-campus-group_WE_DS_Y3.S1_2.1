package com.campus.hub.dto;

import com.campus.hub.entity.Role;
import jakarta.validation.constraints.NotNull;

public record RoleUpdateRequest(
        @NotNull(message = "Role is required")
        Role role
) {
}
