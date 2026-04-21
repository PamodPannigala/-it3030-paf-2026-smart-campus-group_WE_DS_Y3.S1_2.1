package com.campus.hub.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
  * DTO for processing password reset operations.
  */
public class ResetPasswordRequest {

        @NotBlank(message = "token is required")
        private String token;

        @NotBlank(message = "newPassword is required")
        @Size(min = 6, message = "newPassword must be at least 6 characters")
        private String newPassword;

        public ResetPasswordRequest() {
        }

        public ResetPasswordRequest(String token, String newPassword) {
                this.token = token;
                this.newPassword = newPassword;
        }

        public String getToken() { return token; }
        public void setToken(String token) { this.token = token; }
        public String token() { return token; }

        public String getNewPassword() { return newPassword; }
        public void setNewPassword(String newPassword) { this.newPassword = newPassword; }
        public String newPassword() { return newPassword; }

}