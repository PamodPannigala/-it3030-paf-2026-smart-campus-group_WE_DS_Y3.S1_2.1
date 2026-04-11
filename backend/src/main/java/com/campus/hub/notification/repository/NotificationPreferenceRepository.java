package com.campus.hub.notification.repository;

import com.campus.hub.notification.entity.NotificationPreference;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface NotificationPreferenceRepository extends JpaRepository<NotificationPreference, Long> {
    Optional<NotificationPreference> findByUserId(Long userId);

    void deleteByUser_Id(Long userId);
}
