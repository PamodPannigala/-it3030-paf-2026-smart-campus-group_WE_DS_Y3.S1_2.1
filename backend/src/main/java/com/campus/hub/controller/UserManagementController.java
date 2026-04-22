package com.campus.hub.controller;

import com.campus.hub.dto.AdminCreateUserRequest;
import com.campus.hub.dto.RoleUpdateRequest;
import com.campus.hub.dto.UserSummaryResponse;
import com.campus.hub.service.UserManagementService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/users")
public class UserManagementController {

    private final UserManagementService userManagementService;

    public UserManagementController(UserManagementService userManagementService) {
        this.userManagementService = userManagementService;
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public List<UserSummaryResponse> getAllUsers() {
        return userManagementService.getAllUsers();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasRole('ADMIN')")
    public UserSummaryResponse createUser(@Valid @RequestBody AdminCreateUserRequest request) {
        return userManagementService.createUser(request);
    }

    @PatchMapping("/{userId}/role")
    @PreAuthorize("hasRole('ADMIN')")
    public UserSummaryResponse updateRole(
            @PathVariable Long userId,
            @Valid @RequestBody RoleUpdateRequest request
    ) {
        // Changed request.role() to request.getRole()
        return userManagementService.updateRole(userId, request.getRole());
    }
}