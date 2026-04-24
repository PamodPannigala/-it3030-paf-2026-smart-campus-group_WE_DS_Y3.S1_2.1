package com.campus.hub.dto;

import com.campus.hub.entity.Role;
import jakarta.validation.constraints.NotNull;

/**
 * DTO for administrative role updates.
 * Manually implemented as a class to support JSON deserialization and mutability.
 */
public class RoleUpdateRequest {

    @NotNull(message = "Role is required")
    private Role role;

    // --- Constructors ---

    /**
     * Default constructor required for Jackson to instantiate the object 
     * before filling the fields via setter.
     */
    public RoleUpdateRequest() {
    }

    /**
     * All-args constructor for manual instantiation.
     */
    public RoleUpdateRequest(Role role) {
        this.role = role;
    }

    // --- Getters and Setters ---

    public Role getRole() {
        return role;
    }

    public void setRole(Role role) {
        this.role = role;
    }
}