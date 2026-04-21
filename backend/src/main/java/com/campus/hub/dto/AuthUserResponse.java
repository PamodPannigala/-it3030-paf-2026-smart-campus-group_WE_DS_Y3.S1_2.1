package com.campus.hub.dto;

import com.campus.hub.entity.Role;

/**
 * DTO for sending user profile information to the frontend.
 * Converted from a record to a class to support standard JavaBean conventions.
 */
public class AuthUserResponse {

    private Long id;
    private String fullName;
    private String email;
    private String username;
    private Role role;
    private String authProvider;
    private String profilePictureUrl;

    // --- Constructors ---

    /**
     * Default constructor required by JSON libraries like Jackson.
     */
    public AuthUserResponse() {
    }

    /**
     * Constructor with all fields to match the previous record behavior.
     */
    public AuthUserResponse(Long id, String fullName, String email, String username, 
                            Role role, String authProvider, String profilePictureUrl) {
        this.id = id;
        this.fullName = fullName;
        this.email = email;
        this.username = username;
        this.role = role;
        this.authProvider = authProvider;
        this.profilePictureUrl = profilePictureUrl;
    }

    // --- Getters and Setters ---

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public Role getRole() {
        return role;
    }

    public void setRole(Role role) {
        this.role = role;
    }

    public String getAuthProvider() {
        return authProvider;
    }

    public void setAuthProvider(String authProvider) {
        this.authProvider = authProvider;
    }

    public String getProfilePictureUrl() {
        return profilePictureUrl;
    }

    public void setProfilePictureUrl(String profilePictureUrl) {
        this.profilePictureUrl = profilePictureUrl;
    }
}