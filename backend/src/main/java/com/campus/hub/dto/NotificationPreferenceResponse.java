package com.campus.hub.dto;

public record NotificationPreferenceResponse(
        boolean systemEnabled,
        boolean bookingEnabled,
        boolean facilityEnabled,
        boolean ticketStatusEnabled,
        boolean ticketCommentEnabled,
        boolean emailEnabled,
        boolean pushEnabled
) {
}
