package com.campus.hub.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

/**
 * DTO for user registration requests.
 */
public class SignupRequest {

	@NotBlank(message = "fullName is required")
	@Size(max = 255, message = "fullName is too long")
	private String fullName;

	@NotBlank(message = "username is required")
	@Size(min = 3, max = 32, message = "username must be 3–32 characters")
	@Pattern(regexp = "^[a-zA-Z0-9_]+$", message = "username may only contain letters, digits, and underscores")
	private String username;

	@Email(message = "email must be valid")
	@NotBlank(message = "email is required")
	private String email;

	@NotBlank(message = "password is required")
	@Size(min = 6, message = "password must be at least 6 characters")
	private String password;

	public SignupRequest() {
	}

	public SignupRequest(String fullName, String username, String email, String password) {
		this.fullName = fullName;
		this.username = username;
		this.email = email;
		this.password = password;
	}

	public String getFullName() { return fullName; }
	public void setFullName(String fullName) { this.fullName = fullName; }
	public String fullName() { return fullName; }

	public String getUsername() { return username; }
	public void setUsername(String username) { this.username = username; }
	public String username() { return username; }

	public String getEmail() { return email; }
	public void setEmail(String email) { this.email = email; }
	public String email() { return email; }

	public String getPassword() { return password; }
	public void setPassword(String password) { this.password = password; }
	public String password() { return password; }

}