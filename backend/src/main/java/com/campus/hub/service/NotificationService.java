package com.campus.hub.service;

import com.campus.hub.dto.NotificationCreateRequest;
import com.campus.hub.dto.NotificationPreferenceResponse;
import com.campus.hub.dto.NotificationPreferenceUpdateRequest;
import com.campus.hub.dto.NotificationResponse;
import java.util.List;

public interface NotificationService {
    NotificationResponse create(NotificationCreateRequest request);

    List<NotificationResponse> getNotificationsForUser(Long userId, boolean unreadOnly);

    /**
     * Marks a specific notification as read for a given user.
     *
     * @param userId the ID of the user owning the notification
     * @param notificationId the ID of the notification to mark as read
     * @return the updated notification details
     */
    NotificationResponse markAsRead(Long userId, Long notificationId);

    /**
     * Marks all unread notifications as read for a given user.
     *
     * @param userId the ID of the user
     */
    void markAllAsRead(Long userId);

    /**
     * Deletes a specific notification for a given user.
     *
     * @param userId the ID of the user owning the notification
     * @param notificationId the ID of the notification to delete
     */
    void delete(Long userId, Long notificationId);

    long getUnreadCount(Long userId);

    NotificationPreferenceResponse getPreferences(Long userId);

    NotificationPreferenceResponse updatePreferences(Long userId, NotificationPreferenceUpdateRequest request);
}
