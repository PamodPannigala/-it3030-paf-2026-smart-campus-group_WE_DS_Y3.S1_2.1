package com.campus.hub.controller;

import com.campus.hub.security.AuthenticatedUserResolver;
import com.campus.hub.dto.SupportRequestAdminUpdateRequest;
import com.campus.hub.dto.SupportRequestCreateRequest;
import com.campus.hub.dto.SupportRequestResponse;
import com.campus.hub.service.SupportRequestService;
import com.campus.hub.entity.CampusUser;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/support-requests")
public class SupportRequestController {

    private final SupportRequestService supportRequestService;
    private final AuthenticatedUserResolver authenticatedUserResolver;

    public SupportRequestController(SupportRequestService supportRequestService,
            AuthenticatedUserResolver authenticatedUserResolver) {
        this.supportRequestService = supportRequestService;
        this.authenticatedUserResolver = authenticatedUserResolver;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public SupportRequestResponse create(
            @Valid @RequestBody SupportRequestCreateRequest request,
            Authentication authentication) {
        CampusUser user = authenticatedUserResolver.resolve(authentication);
        return supportRequestService.create(user.getId(), request);
    }

    @GetMapping("/mine")
    public List<SupportRequestResponse> mine(Authentication authentication) {
        CampusUser user = authenticatedUserResolver.resolve(authentication);
        return supportRequestService.listForUser(user.getId());
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public List<SupportRequestResponse> listAll() {
        return supportRequestService.listAll();
    }

    @PatchMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public SupportRequestResponse update(
            @PathVariable Long id,
            @Valid @RequestBody SupportRequestAdminUpdateRequest request) {
        return supportRequestService.updateByAdmin(id, request);
    }
}
