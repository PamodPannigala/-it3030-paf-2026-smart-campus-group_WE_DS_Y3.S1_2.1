package com.campus.hub.user.service;

import com.campus.hub.user.dto.UserSummaryResponse;
import com.campus.hub.user.entity.Role;
import java.util.List;

public interface UserManagementService {
    List<UserSummaryResponse> getAllUsers();

    UserSummaryResponse updateRole(Long userId, Role role);
}
