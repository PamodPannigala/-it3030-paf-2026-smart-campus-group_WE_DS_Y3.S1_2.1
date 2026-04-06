package com.campus.hub.notification.dto;

public record NotificationPreferenceUpdateRequest(
        Boolean bookingStatusEnabled,
        Boolean ticketStatusEnabled,
        Boolean ticketCommentEnabled
) {
}
