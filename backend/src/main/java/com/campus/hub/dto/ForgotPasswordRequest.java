package com.campus.hub.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

/**
 * DTO for password recovery requests.
 */
public class ForgotPasswordRequest {

        @Email(message = "email must be valid")
        @NotBlank(message = "email is required")
        private String email;

        public ForgotPasswordRequest() {
        }

        public ForgotPasswordRequest(String email) {
                this.email = email;
        }

        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        public String email() { return email; }

}