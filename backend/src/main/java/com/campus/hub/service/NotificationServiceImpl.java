package com.campus.hub.service;

import com.campus.hub.exception.EntityNotFoundException;
import com.campus.hub.dto.NotificationCreateRequest;
import com.campus.hub.dto.NotificationPreferenceResponse;
import com.campus.hub.dto.NotificationPreferenceUpdateRequest;
import com.campus.hub.dto.NotificationResponse;
import com.campus.hub.entity.Notification;
import com.campus.hub.entity.NotificationCategory;
import com.campus.hub.entity.NotificationPreference;
import com.campus.hub.repository.NotificationPreferenceRepository;
import com.campus.hub.repository.NotificationRepository;
import com.campus.hub.entity.CampusUser;
import com.campus.hub.repository.CampusUserRepository;
import java.util.ArrayList;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.campus.hub.entity.Role;

@Service
public class NotificationServiceImpl implements NotificationService {

    private final NotificationRepository notificationRepository;
    private final NotificationPreferenceRepository preferenceRepository;
    private final CampusUserRepository campusUserRepository;
    private final EmailService emailService;

    // Manual constructor for dependency injection
    public NotificationServiceImpl(NotificationRepository notificationRepository,
            NotificationPreferenceRepository preferenceRepository,
            CampusUserRepository campusUserRepository,
            EmailService emailService) {
        this.notificationRepository = notificationRepository;
        this.preferenceRepository = preferenceRepository;
        this.campusUserRepository = campusUserRepository;
        this.emailService = emailService;
    }

    @Override
    @Transactional
    public NotificationResponse create(NotificationCreateRequest request) {
        // Record accessors replaced with standard getters
        if ("SPECIFIC".equalsIgnoreCase(request.getTargetGroup())) {
            return createSpecific(request);
        } else if ("ALL_USERS".equalsIgnoreCase(request.getTargetGroup())) {
            broadcast(request, null);
            return null;
        } else if ("ALL_ADMINS".equalsIgnoreCase(request.getTargetGroup())) {
            broadcast(request, Role.ADMIN);
            return null;
        }
        throw new IllegalArgumentException("Invalid target group: " + request.getTargetGroup());
    }

    private NotificationResponse createSpecific(NotificationCreateRequest request) {
        if (request.getUserId() == null) {
            throw new IllegalArgumentException("userId is required for SPECIFIC target group");
        }
        CampusUser user = campusUserRepository.findById(request.getUserId())
                .orElseThrow(() -> new EntityNotFoundException("User not found with id: " + request.getUserId()));

        Notification notification = buildNotification(user, request);
        Notification saved = notificationRepository.save(notification);

        triggerExternalNotifications(user, saved);

        return toResponse(saved);
    }

    private void broadcast(NotificationCreateRequest request, Role targetRole) {
        List<CampusUser> targets = targetRole == null
                ? campusUserRepository.findAll()
                : campusUserRepository.findByRole(targetRole);

        List<Notification> batch = new ArrayList<>();
        for (CampusUser user : targets) {
            Notification n = buildNotification(user, request);
            batch.add(n);
        }
        List<Notification> savedBatch = notificationRepository.saveAll(batch);

        for (Notification n : savedBatch) {
            triggerExternalNotifications(n.getUser(), n);
        }
    }

    private Notification buildNotification(CampusUser user, NotificationCreateRequest request) {
        // Replaced .builder() with manual constructor
        // Params: id, user, category, title, message, isRead, referenceType,
        // referenceId, createdAt
        return new Notification(
                null,
                user,
                request.getCategory(),
                request.getTitle().trim(),
                request.getMessage().trim(),
                false,
                request.getReferenceType().trim(),
                request.getReferenceId(),
                null);
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
    @Transactional
    public void markAllAsRead(Long userId) {
        validateUserExists(userId);
        List<Notification> unread = notificationRepository.findByUserIdAndIsReadFalseOrderByCreatedAtDesc(userId);
        unread.forEach(n -> n.setRead(true));
        notificationRepository.saveAll(unread);
    }

    @Override
    @Transactional
    public void delete(Long userId, Long notificationId) {
        validateUserExists(userId);
        Notification notification = notificationRepository.findByIdAndUserId(notificationId, userId)
                .orElseThrow(() -> new EntityNotFoundException("Notification not found with id: " + notificationId));
        notificationRepository.delete(notification);
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

        if (request.getSystemEnabled() != null)
            preference.setSystemEnabled(request.getSystemEnabled());
        if (request.getBookingEnabled() != null)
            preference.setBookingEnabled(request.getBookingEnabled());
        if (request.getFacilityEnabled() != null)
            preference.setFacilityEnabled(request.getFacilityEnabled());
        if (request.getTicketStatusEnabled() != null)
            preference.setTicketStatusEnabled(request.getTicketStatusEnabled());
        if (request.getTicketCommentEnabled() != null)
            preference.setTicketCommentEnabled(request.getTicketCommentEnabled());
        if (request.getEmailEnabled() != null)
            preference.setEmailEnabled(request.getEmailEnabled());
        if (request.getPushEnabled() != null)
            preference.setPushEnabled(request.getPushEnabled());

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
                notification.getCreatedAt());
    }

    private void triggerExternalNotifications(CampusUser user, Notification notification) {
        NotificationPreference preference = preferenceRepository.findByUserId(user.getId()).orElse(null);
        if (preference == null)
            return;

        if (preference.isEmailEnabled() && isNotificationCategoryEnabled(user, notification.getCategory())) {
            String body = String.format(
                    "Hello %s,\n\nYou have a new notification: %s\n\n%s\n\nBest regards,\nSmart Campus Team",
                    user.getFullName(), notification.getTitle(), notification.getMessage());
            emailService.sendEmail(user.getEmail(), "Smart Campus Notification: " + notification.getTitle(), body);
        }
    }

    private NotificationPreferenceResponse toPreferenceResponse(NotificationPreference preference) {
        return new NotificationPreferenceResponse(
                preference.isSystemEnabled(),
                preference.isBookingEnabled(),
                preference.isFacilityEnabled(),
                preference.isTicketStatusEnabled(),
                preference.isTicketCommentEnabled(),
                preference.isEmailEnabled(),
                preference.isPushEnabled());
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

                    // Replaced .builder() with manual constructor
                    // Params: id, user, system, booking, facility, ticketStatus, ticketComment,
                    // email, push
                    NotificationPreference defaults = new NotificationPreference(
                            null,
                            user,
                            true, // systemEnabled
                            true, // bookingEnabled
                            true, // facilityEnabled
                            true, // ticketStatusEnabled
                            true, // ticketCommentEnabled
                            false, // emailEnabled
                            false // pushEnabled
                    );
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