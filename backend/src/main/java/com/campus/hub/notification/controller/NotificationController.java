package com.campus.hub.notification.controller;

import com.campus.hub.notification.dto.NotificationCreateRequest;
import com.campus.hub.notification.dto.NotificationPreferenceResponse;
import com.campus.hub.notification.dto.NotificationPreferenceUpdateRequest;
import com.campus.hub.notification.dto.NotificationResponse;
import com.campus.hub.notification.service.NotificationService;
import com.campus.hub.security.AuthenticatedUserResolver;
import com.campus.hub.user.entity.CampusUser;
import jakarta.validation.Valid;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;
    private final AuthenticatedUserResolver authenticatedUserResolver;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasRole('ADMIN')")
    public NotificationResponse create(@Valid @RequestBody NotificationCreateRequest request) {
        return notificationService.create(request);
    }

    @GetMapping
    public List<NotificationResponse> list(
            @RequestParam(defaultValue = "false") boolean unreadOnly,
            Authentication authentication
    ) {
        CampusUser currentUser = authenticatedUserResolver.resolve(authentication);
        return notificationService.getNotificationsForUser(currentUser.getId(), unreadOnly);
    }

    @GetMapping("/unread-count")
    public Map<String, Long> unreadCount(Authentication authentication) {
        CampusUser currentUser = authenticatedUserResolver.resolve(authentication);
        long count = notificationService.getUnreadCount(currentUser.getId());
        return Map.of("unreadCount", count);
    }

    @PatchMapping("/{notificationId}/read")
    public NotificationResponse markAsRead(
            @PathVariable Long notificationId,
            Authentication authentication
    ) {
        CampusUser currentUser = authenticatedUserResolver.resolve(authentication);
        return notificationService.markAsRead(currentUser.getId(), notificationId);
    }

    @GetMapping("/preferences")
    public NotificationPreferenceResponse getPreferences(Authentication authentication) {
        CampusUser currentUser = authenticatedUserResolver.resolve(authentication);
        return notificationService.getPreferences(currentUser.getId());
    }

    @PatchMapping("/preferences")
    public NotificationPreferenceResponse updatePreferences(
            @RequestBody NotificationPreferenceUpdateRequest request,
            Authentication authentication
    ) {
        CampusUser currentUser = authenticatedUserResolver.resolve(authentication);
        return notificationService.updatePreferences(currentUser.getId(), request);
    }
}
