package com.campus.hub.repository;

import com.campus.hub.entity.Technician;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface TechnicianRepository extends JpaRepository<Technician, Long> {

    List<Technician> findAllByOrderByTeamAscNameAsc();

    Optional<Technician> findByEmail(String email);

    List<Technician> findByStatus(String status);

    boolean existsByEmail(String email);
}