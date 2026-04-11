package com.campus.hub.user.repository;

import com.campus.hub.user.entity.CampusUser;
import com.campus.hub.user.entity.Role;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CampusUserRepository extends JpaRepository<CampusUser, Long> {
    Optional<CampusUser> findByEmailIgnoreCase(String email);

    Optional<CampusUser> findByUsernameIgnoreCase(String username);

    List<CampusUser> findByRole(Role role);

    boolean existsByUsernameIgnoreCase(String username);
}
