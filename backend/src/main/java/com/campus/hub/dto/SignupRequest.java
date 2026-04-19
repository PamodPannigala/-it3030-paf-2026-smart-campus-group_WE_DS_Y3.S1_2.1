package com.campus.hub.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record SignupRequest(
        @NotBlank(message = "fullName is required")
        @Size(max = 255, message = "fullName is too long")
        String fullName,

        @NotBlank(message = "username is required")
        @Size(min = 3, max = 32, message = "username must be 3–32 characters")
        @Pattern(regexp = "^[a-zA-Z0-9_]+$", message = "username may only contain letters, digits, and underscores")
        String username,

        @Email(message = "email must be valid")
        @NotBlank(message = "email is required")
        String email,

        @NotBlank(message = "password is required")
        @Size(min = 6, message = "password must be at least 6 characters")
        String password
) {
}

