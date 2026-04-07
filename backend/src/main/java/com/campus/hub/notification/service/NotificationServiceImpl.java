package com.campus.hub.notification.service;

import com.campus.hub.exception.EntityNotFoundException;
import com.campus.hub.notification.dto.NotificationCreateRequest;
import com.campus.hub.notification.dto.NotificationPreferenceResponse;
import com.campus.hub.notification.dto.NotificationPreferenceUpdateRequest;
import com.campus.hub.notification.dto.NotificationResponse;
import com.campus.hub.notification.entity.Notification;
import com.campus.hub.notification.entity.NotificationCategory;
import com.campus.hub.notification.entity.NotificationPreference;
import com.campus.hub.notification.repository.NotificationPreferenceRepository;
import com.campus.hub.notification.repository.NotificationRepository;
import com.campus.hub.user.entity.CampusUser;
import com.campus.hub.user.repository.CampusUserRepository;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class NotificationServiceImpl implements NotificationService {

    private final NotificationRepository notificationRepository;
    private final NotificationPreferenceRepository preferenceRepository;
    private final CampusUserRepository campusUserRepository;

    @Override
    @Transactional
    public NotificationResponse create(NotificationCreateRequest request) {
        CampusUser user = campusUserRepository.findById(request.userId())
                .orElseThrow(() -> new EntityNotFoundException("User not found with id: " + request.userId()));

        if (!isNotificationCategoryEnabled(user, request.category())) {
            throw new IllegalArgumentException("Notification category is disabled by user preferences");
        }

        Notification notification = Notification.builder()
                .user(user)
                .category(request.category())
                .title(request.title().trim())
                .message(request.message().trim())
                .isRead(false)
                .referenceType(request.referenceType().trim())
                .referenceId(request.referenceId())
                .build();

        Notification saved = notificationRepository.save(notification);
        return toResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<NotificationResponse> getNotificationsForUser(Long userId, boolean unreadOnly) {
        validateUserExists(userId);
        List<Notification> notifications = unreadOnly
                ? notificationRepository.findByUserIdAndIsReadFalseOrderByCreatedAtDesc(userId)
                : notificationRepository.findByUserIdOrderByCreatedAtDesc(userId);
        return notifications.stream().map(this::toResponse).toList();
    }

    @Override
    @Transactional
    public NotificationResponse markAsRead(Long userId, Long notificationId) {
        validateUserExists(userId);
        Notification notification = notificationRepository.findByIdAndUserId(notificationId, userId)
                .orElseThrow(() -> new EntityNotFoundException("Notification not found with id: " + notificationId));
        notification.setRead(true);
        Notification updated = notificationRepository.save(notification);
        return toResponse(updated);
    }

    @Override
    @Transactional(readOnly = true)
    public long getUnreadCount(Long userId) {
        validateUserExists(userId);
        return notificationRepository.countByUserIdAndIsReadFalse(userId);
    }

    @Override
    @Transactional(readOnly = true)
    public NotificationPreferenceResponse getPreferences(Long userId) {
        validateUserExists(userId);
        NotificationPreference preference = getOrCreatePreference(userId);
        return toPreferenceResponse(preference);
    }

    @Override
    @Transactional
    public NotificationPreferenceResponse updatePreferences(Long userId, NotificationPreferenceUpdateRequest request) {
        validateUserExists(userId);
        NotificationPreference preference = getOrCreatePreference(userId);

        if (request.ticketStatusEnabled() != null) {
            preference.setTicketStatusEnabled(request.ticketStatusEnabled());
        }
        if (request.ticketCommentEnabled() != null) {
            preference.setTicketCommentEnabled(request.ticketCommentEnabled());
        }

        NotificationPreference saved = preferenceRepository.save(preference);
        return toPreferenceResponse(saved);
    }

    private NotificationResponse toResponse(Notification notification) {
        return new NotificationResponse(
                notification.getId(),
                notification.getCategory(),
                notification.getTitle(),
                notification.getMessage(),
                notification.isRead(),
                notification.getReferenceType(),
                notification.getReferenceId(),
                notification.getCreatedAt()
        );
    }

    private NotificationPreferenceResponse toPreferenceResponse(NotificationPreference preference) {
        return new NotificationPreferenceResponse(
                preference.isTicketStatusEnabled(),
                preference.isTicketCommentEnabled()
        );
    }

    private void validateUserExists(Long userId) {
        if (!campusUserRepository.existsById(userId)) {
            throw new EntityNotFoundException("User not found with id: " + userId);
        }
    }

    private NotificationPreference getOrCreatePreference(Long userId) {
        return preferenceRepository.findByUserId(userId)
                .orElseGet(() -> {
                    CampusUser user = campusUserRepository.findById(userId)
                            .orElseThrow(() -> new EntityNotFoundException("User not found with id: " + userId));
                    NotificationPreference defaults = NotificationPreference.builder()
                            .user(user)
                            .ticketStatusEnabled(true)
                            .ticketCommentEnabled(true)
                            .build();
                    return preferenceRepository.save(defaults);
                });
    }

    private boolean isNotificationCategoryEnabled(CampusUser user, NotificationCategory category) {
        NotificationPreference preference = preferenceRepository.findByUserId(user.getId())
                .orElse(null);

        if (preference == null) {
            return true;
        }

        return switch (category) {
            case BOOKING, FACILITY -> true;
            case TICKET_STATUS -> preference.isTicketStatusEnabled();
            case TICKET_COMMENT -> preference.isTicketCommentEnabled();
        };
    }
}
