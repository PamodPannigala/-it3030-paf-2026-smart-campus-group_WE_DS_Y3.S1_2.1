package com.campus.hub.notification.dto;

public record NotificationPreferenceUpdateRequest(
        Boolean ticketStatusEnabled,
        Boolean ticketCommentEnabled
) {
}
