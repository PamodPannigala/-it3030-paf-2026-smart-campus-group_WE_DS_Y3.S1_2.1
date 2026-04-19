package com.campus.hub.dto;

import com.campus.hub.entity.SupportRequestStatus;
import java.time.LocalDateTime;

public record SupportRequestResponse(
        Long id,
        Long userId,
        String userEmail,
        String subject,
        String description,
        SupportRequestStatus status,
        String adminNotes,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
}
