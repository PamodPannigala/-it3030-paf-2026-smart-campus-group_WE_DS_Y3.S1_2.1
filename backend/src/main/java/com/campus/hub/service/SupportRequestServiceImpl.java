package com.campus.hub.service;

import com.campus.hub.exception.EntityNotFoundException;
import com.campus.hub.dto.NotificationCreateRequest;
import com.campus.hub.entity.NotificationCategory;
import com.campus.hub.dto.SupportRequestAdminUpdateRequest;
import com.campus.hub.dto.SupportRequestCreateRequest;
import com.campus.hub.dto.SupportRequestResponse;
import com.campus.hub.entity.SupportRequest;
import com.campus.hub.entity.SupportRequestStatus;
import com.campus.hub.repository.SupportRequestRepository;
import com.campus.hub.entity.CampusUser;
import com.campus.hub.entity.Role;
import com.campus.hub.repository.CampusUserRepository;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class SupportRequestServiceImpl implements SupportRequestService {

    private final SupportRequestRepository supportRequestRepository;
    private final CampusUserRepository campusUserRepository;
    private final NotificationService notificationService;

    // Manual constructor for Dependency Injection
    public SupportRequestServiceImpl(SupportRequestRepository supportRequestRepository,
            CampusUserRepository campusUserRepository,
            NotificationService notificationService) {
        this.supportRequestRepository = supportRequestRepository;
        this.campusUserRepository = campusUserRepository;
        this.notificationService = notificationService;
    }

    @Override
    @Transactional
    public SupportRequestResponse create(Long userId, SupportRequestCreateRequest request) {
        CampusUser user = campusUserRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("User not found with id: " + userId));

        // Replaced .builder() with the manual constructor
        // Parameters: id, user, subject, description, status, adminNotes, createdAt,
        // updatedAt
        SupportRequest entity = new SupportRequest(
                null,
                user,
                request.getSubject().trim(), // Updated to getter
                request.getDescription().trim(), // Updated to getter
                SupportRequestStatus.OPEN,
                null,
                null,
                null);

        SupportRequest saved = supportRequestRepository.save(entity);

        String preview = saved.getSubject().length() > 80
                ? saved.getSubject().substring(0, 80) + "..."
                : saved.getSubject();

        for (CampusUser admin : campusUserRepository.findByRole(Role.ADMIN)) {
            notificationService.create(new NotificationCreateRequest(
                    admin.getId(),
                    "SPECIFIC",
                    NotificationCategory.SYSTEM,
                    "New support request",
                    user.getFullName() + " submitted: " + preview,
                    "SUPPORT_REQUEST",
                    String.valueOf(saved.getId())));
        }

        return toResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<SupportRequestResponse> listForUser(Long userId) {
        return supportRequestRepository.findAllByUser_IdOrderByCreatedAtDesc(userId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<SupportRequestResponse> listAll() {
        return supportRequestRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    @Transactional
    public SupportRequestResponse updateByAdmin(Long requestId, SupportRequestAdminUpdateRequest request) {
        // Updated record-style calls to getters
        if (request.getStatus() == null && (request.getAdminNotes() == null || request.getAdminNotes().isBlank())) {
            throw new IllegalArgumentException("Provide status and/or admin notes to update");
        }

        SupportRequest entity = supportRequestRepository.findById(requestId)
                .orElseThrow(() -> new EntityNotFoundException("Support request not found with id: " + requestId));

        if (request.getStatus() != null) {
            entity.setStatus(request.getStatus());
        }
        if (request.getAdminNotes() != null) {
            entity.setAdminNotes(request.getAdminNotes().trim());
        }

        SupportRequest saved = supportRequestRepository.save(entity);

        CampusUser owner = saved.getUser();
        String statusLine = "Status: " + saved.getStatus().name().replace('_', ' ');
        String body = saved.getAdminNotes() != null && !saved.getAdminNotes().isBlank()
                ? statusLine + ". " + saved.getAdminNotes()
                : statusLine + " for \"" + saved.getSubject() + "\".";

        notificationService.create(new NotificationCreateRequest(
                owner.getId(),
                "SPECIFIC",
                NotificationCategory.SYSTEM,
                "Update on your support request",
                body,
                "SUPPORT_REQUEST",
                String.valueOf(saved.getId())));

        return toResponse(saved);
    }

    private SupportRequestResponse toResponse(SupportRequest entity) {
        return new SupportRequestResponse(
                entity.getId(),
                entity.getUser().getId(),
                entity.getUser().getEmail(),
                entity.getSubject(),
                entity.getDescription(),
                entity.getStatus(),
                entity.getAdminNotes(),
                entity.getCreatedAt(),
                entity.getUpdatedAt());
    }
}