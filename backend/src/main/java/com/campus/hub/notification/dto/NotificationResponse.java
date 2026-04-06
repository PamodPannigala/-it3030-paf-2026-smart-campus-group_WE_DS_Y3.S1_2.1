package com.campus.hub.notification.dto;

import com.campus.hub.notification.entity.NotificationCategory;
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
