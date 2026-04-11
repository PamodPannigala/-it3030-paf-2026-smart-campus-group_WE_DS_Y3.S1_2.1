package com.campus.hub.support.repository;

import com.campus.hub.support.entity.SupportRequest;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SupportRequestRepository extends JpaRepository<SupportRequest, Long> {
    List<SupportRequest> findAllByUser_IdOrderByCreatedAtDesc(Long userId);

    List<SupportRequest> findAllByOrderByCreatedAtDesc();

    void deleteAllByUser_Id(Long userId);
}
