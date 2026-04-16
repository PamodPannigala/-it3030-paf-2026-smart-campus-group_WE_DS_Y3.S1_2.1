package com.campus.hub.service;

import com.campus.hub.dto.CommentDTO;
import com.campus.hub.entity.Comment;
import com.campus.hub.entity.Ticket;
import com.campus.hub.repository.CommentRepository;
import com.campus.hub.repository.TicketRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class CommentService {

    @Autowired
    private CommentRepository commentRepository;

    @Autowired
    private TicketRepository ticketRepository;

    private final String uploadDir =
            System.getProperty("user.dir") + "/uploads/comments/";

    // =========================
    // ADD COMMENT WITH IMAGE + REPLY
    // =========================
    public CommentDTO addCommentWithImage(
            Long ticketId,
            String author,
            String message,
            Long parentId,
            List<MultipartFile> images,
            String role
    ) {

        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));

        Comment comment = new Comment();
        comment.setTicket(ticket);
        comment.setAuthor(author);
        comment.setMessage(message);
        comment.setCreatedAt(LocalDateTime.now());
        comment.setAuthorRole(role);

        // reply support
        if (parentId != null) {
            comment.setParentId(parentId);
        }

        // =========================
        // MULTIPLE IMAGE SUPPORT
        // =========================
        List<String> imagePaths = new ArrayList<>();

        if (images != null && !images.isEmpty()) {
            try {
                File dir = new File(uploadDir);
                if (!dir.exists()) dir.mkdirs();

                for (MultipartFile image : images) {
                    if (image == null || image.isEmpty()) continue;

                    String fileName = UUID.randomUUID() + "_" + image.getOriginalFilename();
                    File file = new File(uploadDir + fileName);
                    image.transferTo(file);

                    imagePaths.add("/uploads/comments/" + fileName);
                }

                comment.setImageUrls(imagePaths);

            } catch (IOException e) {
                throw new RuntimeException("Failed to upload images");
            }
        }

        Comment saved = commentRepository.save(comment);
        return mapToDTO(saved);
    }

    // =========================
    // GET COMMENTS
    // =========================
    public List<CommentDTO> getCommentsByTicket(Long ticketId) {
        return commentRepository.findByTicketIdOrderByCreatedAtAsc(ticketId)
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    // =========================
// EDIT COMMENT WITH IMAGES
// =========================
public CommentDTO editCommentWithImages(
        Long commentId,
        String author,
        String role,
        String newMessage,
        List<MultipartFile> newImages,
        List<String> keptImageUrls
) {

    Comment comment = commentRepository.findById(commentId)
            .orElseThrow(() -> new RuntimeException("Comment not found"));

    // Check permission
    if (!"ADMIN".equalsIgnoreCase(role)
            && !"SUPPORT".equalsIgnoreCase(role)
            && !comment.getAuthor().equals(author)) {
        throw new RuntimeException("Not allowed to edit this comment");
    }

    // Update message
    comment.setMessage(newMessage);

    // Handle images
    List<String> finalImageUrls = new ArrayList<>();

    // Add kept existing images
    if (keptImageUrls != null) {
        finalImageUrls.addAll(keptImageUrls);
    }

    // Add new images
    if (newImages != null && !newImages.isEmpty()) {
        try {
            File dir = new File(uploadDir);
            if (!dir.exists()) dir.mkdirs();

            for (MultipartFile image : newImages) {
                if (image == null || image.isEmpty()) continue;

                String fileName = UUID.randomUUID() + "_" + image.getOriginalFilename();
                File file = new File(uploadDir + fileName);
                image.transferTo(file);

                finalImageUrls.add("/uploads/comments/" + fileName);
            }

        } catch (IOException e) {
            throw new RuntimeException("Failed to upload images");
        }
    }

    comment.setImageUrls(finalImageUrls);
    comment.setUpdatedAt(LocalDateTime.now());

    return mapToDTO(commentRepository.save(comment));
}
    // =========================
    // DELETE COMMENT
    // =========================
    public void deleteComment(Long commentId, String author, String role) {

        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new RuntimeException("Comment not found"));

        if (!"ADMIN".equalsIgnoreCase(role)
                && !"SUPPORT".equalsIgnoreCase(role)
                && !comment.getAuthor().equals(author)) {
            throw new RuntimeException("Not allowed to delete this comment");
        }

        commentRepository.delete(comment);
    }

    // =========================
    // DTO MAPPER (UI READY)
    // =========================
    private CommentDTO mapToDTO(Comment comment) {

        CommentDTO dto = new CommentDTO();

        dto.setId(comment.getId());
        dto.setTicketId(comment.getTicket().getId());
        dto.setAuthor(comment.getAuthor());
        dto.setMessage(comment.getMessage());
        dto.setCreatedAt(comment.getCreatedAt());

        // threading
        dto.setParentCommentId(comment.getParentId());

        // IMPORTANT: send ALL images (not just first one)
        dto.setImageUrls(comment.getImageUrls());

        // role for UI badge
        dto.setAuthorRole(comment.getAuthorRole());

        // admin badge helper
        dto.setIsAdminResponse(
                "ADMIN".equalsIgnoreCase(comment.getAuthorRole())
        );

        dto.setUpdatedAt(comment.getUpdatedAt());

        return dto;
    }
}