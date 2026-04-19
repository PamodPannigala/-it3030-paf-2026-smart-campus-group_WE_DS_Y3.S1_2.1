package com.campus.hub.security;

import com.campus.hub.user.entity.CampusUser;
import com.campus.hub.user.entity.Role;
import com.campus.hub.user.repository.CampusUserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class DatabaseSeeder implements CommandLineRunner {

    private final CampusUserRepository campusUserRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.seed.admin-email:admin@campushub.local}")
    private String adminEmail;

    @Value("${app.seed.admin-name:System Admin}")
    private String adminName;

    @Override
    public void run(String... args) {
        if (campusUserRepository.count() == 0) {
            log.info("No users found in database. Seeding default admin user...");
            
            CampusUser admin = CampusUser.builder()
                    .fullName(adminName)
                    .email(adminEmail)
                    .username("admin")
                    .role(Role.ADMIN)
                    .authProvider("LOCAL")
                    .passwordHash(passwordEncoder.encode("admin123"))
                    .enabled(true)
                    .build();

            campusUserRepository.save(admin);
            log.info("Default admin user created: {} / admin123", adminEmail);
        } else {
            log.debug("Database already contains users. Skipping seed.");
        }
    }
}
