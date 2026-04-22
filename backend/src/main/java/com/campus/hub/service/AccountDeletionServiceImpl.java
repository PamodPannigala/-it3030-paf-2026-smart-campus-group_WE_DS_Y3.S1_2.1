package com.campus.hub.service;

import com.campus.hub.repository.PasswordResetTokenRepository;
import com.campus.hub.repository.NotificationPreferenceRepository;
import com.campus.hub.repository.NotificationRepository;
import com.campus.hub.repository.SupportRequestRepository;
import com.campus.hub.repository.CampusUserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AccountDeletionServiceImpl implements AccountDeletionService {

    private final PasswordResetTokenRepository passwordResetTokenRepository;
    private final NotificationRepository notificationRepository;
    private final NotificationPreferenceRepository notificationPreferenceRepository;
    private final SupportRequestRepository supportRequestRepository;
    private final CampusUserRepository campusUserRepository;

    public AccountDeletionServiceImpl(PasswordResetTokenRepository passwordResetTokenRepository, NotificationRepository notificationRepository, NotificationPreferenceRepository notificationPreferenceRepository, SupportRequestRepository supportRequestRepository, CampusUserRepository campusUserRepository) {
        this.passwordResetTokenRepository = passwordResetTokenRepository;
        this.notificationRepository = notificationRepository;
        this.notificationPreferenceRepository = notificationPreferenceRepository;
        this.supportRequestRepository = supportRequestRepository;
        this.campusUserRepository = campusUserRepository;
    }


    @Override
    @Transactional
    public void deleteAccountForUser(Long userId) {
        passwordResetTokenRepository.deleteAllByUser_Id(userId);
        notificationRepository.deleteAllByUser_Id(userId);
        notificationPreferenceRepository.deleteByUser_Id(userId);
        supportRequestRepository.deleteAllByUser_Id(userId);
        campusUserRepository.deleteById(userId);
    }
}
