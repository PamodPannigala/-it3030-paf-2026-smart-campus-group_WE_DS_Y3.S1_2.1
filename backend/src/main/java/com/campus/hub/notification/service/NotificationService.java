package com.campus.hub.notification.service;

import com.campus.hub.notification.dto.NotificationCreateRequest;
import com.campus.hub.notification.dto.NotificationPreferenceResponse;
import com.campus.hub.notification.dto.NotificationPreferenceUpdateRequest;
import com.campus.hub.notification.dto.NotificationResponse;
import java.util.List;

public interface NotificationService {
    NotificationResponse create(NotificationCreateRequest request);

    List<NotificationResponse> getNotificationsForUser(Long userId, boolean unreadOnly);

    NotificationResponse markAsRead(Long userId, Long notificationId);

    long getUnreadCount(Long userId);

    NotificationPreferenceResponse getPreferences(Long userId);

    NotificationPreferenceResponse updatePreferences(Long userId, NotificationPreferenceUpdateRequest request);
}
