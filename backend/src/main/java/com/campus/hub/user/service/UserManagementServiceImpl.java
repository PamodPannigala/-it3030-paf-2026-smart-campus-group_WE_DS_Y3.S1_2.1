package com.campus.hub.user.service;

import com.campus.hub.exception.EntityNotFoundException;
import com.campus.hub.user.dto.UserSummaryResponse;
import com.campus.hub.user.entity.CampusUser;
import com.campus.hub.user.entity.Role;
import com.campus.hub.user.repository.CampusUserRepository;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class UserManagementServiceImpl implements UserManagementService {

    private final CampusUserRepository campusUserRepository;

    @Override
    @Transactional(readOnly = true)
    public List<UserSummaryResponse> getAllUsers() {
        return campusUserRepository.findAll()
                .stream()
                .map(this::toSummary)
                .toList();
    }

    @Override
    @Transactional
    public UserSummaryResponse updateRole(Long userId, Role role) {
        CampusUser user = campusUserRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("User not found with id: " + userId));
        user.setRole(role);
        CampusUser updated = campusUserRepository.save(user);
        return toSummary(updated);
    }

    private UserSummaryResponse toSummary(CampusUser user) {
        return new UserSummaryResponse(
                user.getId(),
                user.getFullName(),
                user.getEmail(),
                user.getRole(),
                user.getAuthProvider(),
                user.isEnabled()
        );
    }
}
