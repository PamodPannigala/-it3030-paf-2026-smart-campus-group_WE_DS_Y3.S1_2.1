package com.campus.hub.user.controller;

import com.campus.hub.user.dto.RoleUpdateRequest;
import com.campus.hub.user.dto.UserSummaryResponse;
import com.campus.hub.user.service.UserManagementService;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserManagementController {

    private final UserManagementService userManagementService;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public List<UserSummaryResponse> getAllUsers() {
        return userManagementService.getAllUsers();
    }

    @PatchMapping("/{userId}/role")
    @PreAuthorize("hasRole('ADMIN')")
    public UserSummaryResponse updateRole(
            @PathVariable Long userId,
            @Valid @RequestBody RoleUpdateRequest request
    ) {
        return userManagementService.updateRole(userId, request.role());
    }
}
