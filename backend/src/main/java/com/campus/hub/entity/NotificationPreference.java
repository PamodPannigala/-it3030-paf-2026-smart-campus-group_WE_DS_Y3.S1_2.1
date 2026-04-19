package com.campus.hub.entity;

import com.campus.hub.entity.CampusUser;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "notification_preferences")
public class NotificationPreference {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(optional = false)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private CampusUser user;

    @Column(nullable = false)
    @Builder.Default
    private boolean systemEnabled = true;

    @Column(nullable = false)
    @Builder.Default
    private boolean bookingEnabled = true;

    @Column(nullable = false)
    @Builder.Default
    private boolean facilityEnabled = true;

    @Column(nullable = false)
    @Builder.Default
    private boolean ticketStatusEnabled = true;

    @Column(nullable = false)
    @Builder.Default
    private boolean ticketCommentEnabled = true;

    @Column(nullable = false)
    @Builder.Default
    private boolean emailEnabled = false;

    @Column(nullable = false)
    @Builder.Default
    private boolean pushEnabled = false;
}
