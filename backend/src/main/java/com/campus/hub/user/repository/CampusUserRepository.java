package com.campus.hub.user.repository;

import com.campus.hub.user.entity.CampusUser;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CampusUserRepository extends JpaRepository<CampusUser, Long> {
    Optional<CampusUser> findByEmailIgnoreCase(String email);
}
