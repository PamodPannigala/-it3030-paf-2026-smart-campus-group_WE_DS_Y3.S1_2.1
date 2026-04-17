package com.campus.hub.notification.dto;

public record NotificationPreferenceUpdateRequest(
        Boolean systemEnabled,
        Boolean bookingEnabled,
        Boolean facilityEnabled,
        Boolean ticketStatusEnabled,
        Boolean ticketCommentEnabled,
        Boolean emailEnabled,
        Boolean pushEnabled
) {
}
