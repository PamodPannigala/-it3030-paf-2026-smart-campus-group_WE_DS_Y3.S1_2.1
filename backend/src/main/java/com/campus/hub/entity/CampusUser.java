package com.campus.hub.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.LocalDateTime;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

@Entity
@Table(name = "users")
public class CampusUser {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String fullName;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(unique = true, length = 32)
    private String username;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role;

    @Column(nullable = false)
    private String authProvider;

    @Column
    private String passwordHash;

    @Column(nullable = false)
    private boolean enabled;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(nullable = false)
    private LocalDateTime updatedAt;

    @Column
    private LocalDateTime lastLoginAt;

    @Column
    private String profilePictureUrl;

    public CampusUser() {}

    public CampusUser(Long id, String fullName, String email, String username, Role role, String authProvider, String passwordHash, boolean enabled, LocalDateTime createdAt, LocalDateTime updatedAt, LocalDateTime lastLoginAt, String profilePictureUrl) {
        this.id = id;
        this.fullName = fullName;
        this.email = email;
        this.username = username;
        this.role = role;
        this.authProvider = authProvider;
        this.passwordHash = passwordHash;
        this.enabled = enabled;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.lastLoginAt = lastLoginAt;
        this.profilePictureUrl = profilePictureUrl;
    }

    public static CampusUserBuilder builder() {
        return new CampusUserBuilder();
    }

    public static class CampusUserBuilder {
        private Long id;
        private String fullName;
        private String email;
        private String username;
        private Role role;
        private String authProvider;
        private String passwordHash;
        private boolean enabled;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;
        private LocalDateTime lastLoginAt;
        private String profilePictureUrl;

        CampusUserBuilder() {}

        public CampusUserBuilder id(Long id) { this.id = id; return this; }
        public CampusUserBuilder fullName(String fullName) { this.fullName = fullName; return this; }
        public CampusUserBuilder email(String email) { this.email = email; return this; }
        public CampusUserBuilder username(String username) { this.username = username; return this; }
        public CampusUserBuilder role(Role role) { this.role = role; return this; }
        public CampusUserBuilder authProvider(String authProvider) { this.authProvider = authProvider; return this; }
        public CampusUserBuilder passwordHash(String passwordHash) { this.passwordHash = passwordHash; return this; }
        public CampusUserBuilder enabled(boolean enabled) { this.enabled = enabled; return this; }
        public CampusUserBuilder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }
        public CampusUserBuilder updatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; return this; }
        public CampusUserBuilder lastLoginAt(LocalDateTime lastLoginAt) { this.lastLoginAt = lastLoginAt; return this; }
        public CampusUserBuilder profilePictureUrl(String profilePictureUrl) { this.profilePictureUrl = profilePictureUrl; return this; }

        public CampusUser build() {
            return new CampusUser(id, fullName, email, username, role, authProvider, passwordHash, enabled, createdAt, updatedAt, lastLoginAt, profilePictureUrl);
        }
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    public Role getRole() { return role; }
    public void setRole(Role role) { this.role = role; }
    public String getAuthProvider() { return authProvider; }
    public void setAuthProvider(String authProvider) { this.authProvider = authProvider; }
    public String getPasswordHash() { return passwordHash; }
    public void setPasswordHash(String passwordHash) { this.passwordHash = passwordHash; }
    public boolean isEnabled() { return enabled; }
    public void setEnabled(boolean enabled) { this.enabled = enabled; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
    public LocalDateTime getLastLoginAt() { return lastLoginAt; }
    public void setLastLoginAt(LocalDateTime lastLoginAt) { this.lastLoginAt = lastLoginAt; }
    public String getProfilePictureUrl() { return profilePictureUrl; }
    public void setProfilePictureUrl(String profilePictureUrl) { this.profilePictureUrl = profilePictureUrl; }

}