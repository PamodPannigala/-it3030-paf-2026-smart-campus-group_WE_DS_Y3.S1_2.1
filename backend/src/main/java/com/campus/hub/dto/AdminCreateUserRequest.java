package com.campus.hub.dto;

import com.campus.hub.entity.Role;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

/**
 * DTO for administrative user creation.
 * Manually implemented with full boilerplate to avoid library dependencies.
 */
public class AdminCreateUserRequest {

    @NotBlank(message = "fullName is required")
    @Size(max = 255, message = "fullName is too long")
    private String fullName;

    @NotBlank(message = "username is required")
    @Size(min = 3, max = 32, message = "username must be 3–32 characters")
    @Pattern(regexp = "^[a-zA-Z0-9_]+$", message = "username may only contain letters, digits, and underscores")
    private String username;

    @Email(message = "email must be valid")
    @NotBlank(message = "email is required")
    private String email;

    @NotBlank(message = "password is required")
    @Size(min = 6, message = "password must be at least 6 characters")
    private String password;

    @NotNull(message = "role is required")
    private Role role;

    // --- Constructors ---

    /**
     * Default constructor required for JSON deserialization.
     */
    public AdminCreateUserRequest() {
    }

    /**
     * Constructor with all fields.
     */
    public AdminCreateUserRequest(String fullName, String username, String email, String password, Role role) {
        this.fullName = fullName;
        this.username = username;
        this.email = email;
        this.password = password;
        this.role = role;
    }

    // --- Getters and Setters ---

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public Role getRole() {
        return role;
    }

    public void setRole(Role role) {
        this.role = role;
    }
}