package com.campus.hub.dto;

import com.campus.hub.entity.Role;

/**
 * DTO for providing a concise summary of user information.
 * Manually implemented as a class to support standard JavaBean conventions.
 */
public class UserSummaryResponse {

        private Long id;
        private String fullName;
        private String email;
        private String username;
        private Role role;
        private String authProvider;
        private boolean enabled;

        // --- Constructors ---

        /**
         * Default constructor required for JSON serialization and deserialization.
         */
        public UserSummaryResponse() {
        }

        /**
         * All-args constructor to match the original record's canonical constructor.
         */
        public UserSummaryResponse(Long id, String fullName, String email, String username,
                        Role role, String authProvider, boolean enabled) {
                this.id = id;
                this.fullName = fullName;
                this.email = email;
                this.username = username;
                this.role = role;
                this.authProvider = authProvider;
                this.enabled = enabled;
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

        public boolean isEnabled() {
                return enabled;
        }

        public void setEnabled(boolean enabled) {
                this.enabled = enabled;
        }
}