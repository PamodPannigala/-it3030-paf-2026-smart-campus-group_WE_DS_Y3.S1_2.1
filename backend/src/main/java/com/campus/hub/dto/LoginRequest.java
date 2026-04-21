package com.campus.hub.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * DTO for handling login credentials.
 */
public class LoginRequest {

    @NotBlank(message = "Username or email is required")
    @Size(max = 255, message = "Login is too long")
    private String usernameOrEmail;

    @NotBlank(message = "password is required")
    private String password;

    public LoginRequest() {
    }

    public LoginRequest(String usernameOrEmail, String password) {
        this.usernameOrEmail = usernameOrEmail;
        this.password = password;
    }

    public String getUsernameOrEmail() { return usernameOrEmail; }
    public void setUsernameOrEmail(String usernameOrEmail) { this.usernameOrEmail = usernameOrEmail; }
    public String usernameOrEmail() { return usernameOrEmail; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
    public String password() { return password; }

}