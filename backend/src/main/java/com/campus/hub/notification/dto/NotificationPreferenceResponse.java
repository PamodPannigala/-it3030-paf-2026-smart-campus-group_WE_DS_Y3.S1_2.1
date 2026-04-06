package com.campus.hub.notification.dto;

public record NotificationPreferenceResponse(
        boolean ticketStatusEnabled,
        boolean ticketCommentEnabled
) {
}
