package com.campus.hub.repository;

import com.campus.hub.entity.Comment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CommentRepository extends JpaRepository<Comment, Long> {

    List<Comment> findByTicketIdOrderByCreatedAtAsc(Long ticketId);
    
    @Modifying
    @Query("DELETE FROM Comment c WHERE c.ticket.id = :ticketId")
    void deleteByTicketId(@Param("ticketId") Long ticketId);
}