package com.campus.hub.notification.dto;

public record NotificationPreferenceResponse(
        boolean bookingStatusEnabled,
        boolean ticketStatusEnabled,
        boolean ticketCommentEnabled
) {
}
