package com.campus.hub.auth.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record LoginRequest(
        @NotBlank(message = "Username or email is required")
        @Size(max = 255, message = "Login is too long")
        String usernameOrEmail,

        @NotBlank(message = "password is required")
        String password
) {
}

