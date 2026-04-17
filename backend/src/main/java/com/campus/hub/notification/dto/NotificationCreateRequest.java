package com.campus.hub.notification.dto;

import com.campus.hub.notification.entity.NotificationCategory;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record NotificationCreateRequest(
        Long userId,

        @NotBlank(message = "targetGroup is required")
        String targetGroup, // "SPECIFIC", "ALL_USERS", "ALL_ADMINS"

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
