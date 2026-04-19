package com.campus.hub.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record SupportRequestCreateRequest(
        @NotBlank(message = "subject is required")
        @Size(max = 200, message = "subject is too long")
        String subject,

        @NotBlank(message = "description is required")
        @Size(max = 4000, message = "description is too long")
        String description
) {
}
