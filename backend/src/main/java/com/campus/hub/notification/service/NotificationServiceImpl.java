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
import java.util.ArrayList;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.campus.hub.user.entity.Role;

@Service
@RequiredArgsConstructor
public class NotificationServiceImpl implements NotificationService {

    private final NotificationRepository notificationRepository;
    private final NotificationPreferenceRepository preferenceRepository;
    private final CampusUserRepository campusUserRepository;

    @Override
    @Transactional
    public NotificationResponse create(NotificationCreateRequest request) {
        if ("SPECIFIC".equalsIgnoreCase(request.targetGroup())) {
            return createSpecific(request);
        } else if ("ALL_USERS".equalsIgnoreCase(request.targetGroup())) {
            broadcast(request, null);
            return null; // Controller might need a different return for bulk
        } else if ("ALL_ADMINS".equalsIgnoreCase(request.targetGroup())) {
            broadcast(request, Role.ADMIN);
            return null;
        }
        throw new IllegalArgumentException("Invalid target group: " + request.targetGroup());
    }

    private NotificationResponse createSpecific(NotificationCreateRequest request) {
        if (request.userId() == null) {
            throw new IllegalArgumentException("userId is required for SPECIFIC target group");
        }
        CampusUser user = campusUserRepository.findById(request.userId())
                .orElseThrow(() -> new EntityNotFoundException("User not found with id: " + request.userId()));

        if (!isNotificationCategoryEnabled(user, request.category())) {
            // Log or ignore instead of throwing if broadcasting, but for specific throw is okay
            throw new IllegalArgumentException("Notification category is disabled by user preferences");
        }

        Notification notification = buildNotification(user, request);
        Notification saved = notificationRepository.save(notification);
        return toResponse(saved);
    }

    private void broadcast(NotificationCreateRequest request, Role targetRole) {
        List<CampusUser> targets = targetRole == null 
                ? campusUserRepository.findAll() 
                : campusUserRepository.findByRole(targetRole);

        List<Notification> batch = new ArrayList<>();
        for (CampusUser user : targets) {
            if (isNotificationCategoryEnabled(user, request.category())) {
                batch.add(buildNotification(user, request));
            }
        }
        notificationRepository.saveAll(batch);
    }

    private Notification buildNotification(CampusUser user, NotificationCreateRequest request) {
        return Notification.builder()
                .user(user)
                .category(request.category())
                .title(request.title().trim())
                .message(request.message().trim())
                .isRead(false)
                .referenceType(request.referenceType().trim())
                .referenceId(request.referenceId())
                .build();
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

        if (request.systemEnabled() != null) preference.setSystemEnabled(request.systemEnabled());
        if (request.bookingEnabled() != null) preference.setBookingEnabled(request.bookingEnabled());
        if (request.facilityEnabled() != null) preference.setFacilityEnabled(request.facilityEnabled());
        if (request.ticketStatusEnabled() != null) preference.setTicketStatusEnabled(request.ticketStatusEnabled());
        if (request.ticketCommentEnabled() != null) preference.setTicketCommentEnabled(request.ticketCommentEnabled());

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
                preference.isSystemEnabled(),
                preference.isBookingEnabled(),
                preference.isFacilityEnabled(),
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
                            .systemEnabled(true)
                            .bookingEnabled(true)
                            .facilityEnabled(true)
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
            case SYSTEM -> preference.isSystemEnabled();
            case BOOKING -> preference.isBookingEnabled();
            case FACILITY -> preference.isFacilityEnabled();
            case TICKET_STATUS -> preference.isTicketStatusEnabled();
            case TICKET_COMMENT -> preference.isTicketCommentEnabled();
        };
    }
}
