package com.campus.hub.notification.dto;

import com.campus.hub.notification.entity.NotificationCategory;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record NotificationCreateRequest(
        @NotNull(message = "userId is required")
        Long userId,

        @NotNull(message = "category is required")
        NotificationCategory category,

        @NotBlank(message = "title is required")
        String title,

        @NotBlank(message = "message is required")
        String message,

        @NotBlank(message = "referenceType is required")
        String referenceType,

        String referenceId
) {
}
