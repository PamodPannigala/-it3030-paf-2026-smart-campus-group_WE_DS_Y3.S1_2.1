package com.campus.hub.dto;

import com.campus.hub.entity.NotificationCategory;
import java.time.LocalDateTime;

public record NotificationResponse(
        Long id,
        NotificationCategory category,
        String title,
        String message,
        boolean isRead,
        String referenceType,
        String referenceId,
        LocalDateTime createdAt
) {
}
