package com.campus.hub.notification.dto;

public record NotificationPreferenceResponse(
        boolean systemEnabled,
        boolean bookingEnabled,
        boolean facilityEnabled,
        boolean ticketStatusEnabled,
        boolean ticketCommentEnabled
) {
}
