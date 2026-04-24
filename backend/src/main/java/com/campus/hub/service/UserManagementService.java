package com.campus.hub.service;

import com.campus.hub.dto.AdminCreateUserRequest;
import com.campus.hub.dto.UserSummaryResponse;
import com.campus.hub.entity.Role;
import java.util.List;

public interface UserManagementService {
    List<UserSummaryResponse> getAllUsers();

    UserSummaryResponse createUser(AdminCreateUserRequest request);

    UserSummaryResponse updateRole(Long userId, Role role);
}
