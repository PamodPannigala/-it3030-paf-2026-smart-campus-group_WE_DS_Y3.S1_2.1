package com.campus.hub.auth.controller;

import com.campus.hub.auth.dto.AuthUserResponse;
import com.campus.hub.auth.dto.ForgotPasswordRequest;
import com.campus.hub.auth.dto.LoginRequest;
import com.campus.hub.auth.dto.ResetPasswordRequest;
import com.campus.hub.auth.dto.SignupRequest;
import com.campus.hub.auth.entity.PasswordResetToken;
import com.campus.hub.auth.repository.PasswordResetTokenRepository;
import com.campus.hub.security.AuthenticatedUserResolver;
import com.campus.hub.user.entity.CampusUser;
import com.campus.hub.user.entity.Role;
import com.campus.hub.user.repository.CampusUserRepository;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import java.time.LocalDateTime;
import java.util.Locale;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.context.SecurityContextImpl;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.context.HttpSessionSecurityContextRepository;
import org.springframework.security.web.context.SecurityContextRepository;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Controller for handling authentication-related requests including login, signup,
 * and password recovery.
 */
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthenticatedUserResolver authenticatedUserResolver;
    private final CampusUserRepository campusUserRepository;
    private final PasswordEncoder passwordEncoder;
    private final PasswordResetTokenRepository passwordResetTokenRepository;
    private final AuthenticationManager authenticationManager;
    private final SecurityContextRepository securityContextRepository;

    /**
     * Retrieves the currently authenticated user's profile information.
     *
     * @param authentication the current security context authentication object
     * @return the profile details of the authenticated user
     */
    @GetMapping("/me")
    public AuthUserResponse me(Authentication authentication) {
        CampusUser user = authenticatedUserResolver.resolve(authentication);
        return new AuthUserResponse(
                user.getId(),
                user.getFullName(),
                user.getEmail(),
                user.getUsername(),
                user.getRole(),
                user.getAuthProvider(),
                user.getProfilePictureUrl()
        );
    }

    /**
     * Registers a new user account with the provided details.
     *
     * @param request the signup request containing name, email, username, and password
     * @return the details of the created user
     */
    @PostMapping("/signup")
    @org.springframework.web.bind.annotation.ResponseStatus(org.springframework.http.HttpStatus.CREATED)
    public AuthUserResponse signup(@Valid @RequestBody SignupRequest request) {
        String normalizedEmail = normalizeEmail(request.email());
        String normalizedName = normalizeName(request.fullName());
        String normalizedUsername = normalizeUsername(request.username());

        campusUserRepository.findByEmailIgnoreCase(normalizedEmail).ifPresent(existing -> {
            throw new IllegalArgumentException("Email is already registered");
        });
        if (campusUserRepository.existsByUsernameIgnoreCase(normalizedUsername)) {
            throw new IllegalArgumentException("Username is already taken");
        }

        CampusUser user = CampusUser.builder()
                .fullName(normalizedName)
                .email(normalizedEmail)
                .username(normalizedUsername)
                .role(Role.USER)
                .authProvider("LOCAL")
                .passwordHash(passwordEncoder.encode(request.password()))
                .enabled(true)
                .build();

        CampusUser saved = campusUserRepository.save(user);
        return new AuthUserResponse(
                saved.getId(),
                saved.getFullName(),
                saved.getEmail(),
                saved.getUsername(),
                saved.getRole(),
                saved.getAuthProvider(),
                saved.getProfilePictureUrl()
        );
    }

    /**
     * Authenticates a user using their credentials and starts a security session.
     *
     * @param request the login request containing username/email and password
     * @param httpServletRequest the current servlet request
     * @param httpServletResponse the current servlet response
     * @return the profile details of the logged-in user
     */
    @PostMapping("/login")
    public AuthUserResponse login(
            @Valid @RequestBody LoginRequest request,
            HttpServletRequest httpServletRequest,
            HttpServletResponse httpServletResponse
    ) {
        CampusUser existingUser = resolveUserForPasswordLogin(request.usernameOrEmail());

        if (existingUser.getPasswordHash() == null || existingUser.getPasswordHash().isBlank()) {
            throw new IllegalArgumentException("This account uses Google login. Continue with Google.");
        }

        Authentication auth = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(existingUser.getEmail(), request.password())
        );

        SecurityContextImpl context = new SecurityContextImpl();
        context.setAuthentication(auth);
        SecurityContextHolder.setContext(context);

        securityContextRepository.saveContext(context, httpServletRequest, httpServletResponse);

        // Security Update for Member 4
        existingUser.setLastLoginAt(LocalDateTime.now());
        campusUserRepository.save(existingUser);

        return new AuthUserResponse(
                existingUser.getId(),
                existingUser.getFullName(),
                existingUser.getEmail(),
                existingUser.getUsername(),
                existingUser.getRole(),
                existingUser.getAuthProvider(),
                existingUser.getProfilePictureUrl()
        );
    }

    /**
     * Initiates a password reset process by generating a temporary token.
     *
     * @param request the request containing the user's email
     * @return a map containing the reset token (for demo purposes)
     */
    @PostMapping("/forgot-password")
    public Map<String, String> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        String normalizedEmail = normalizeEmail(request.email());
        CampusUser user = campusUserRepository.findByEmailIgnoreCase(normalizedEmail)
                .orElseThrow(() -> new IllegalArgumentException("No account for that email"));

        String token = UUID.randomUUID().toString();
        PasswordResetToken reset = PasswordResetToken.builder()
                .user(user)
                .token(token)
                .expiresAt(LocalDateTime.now().plusMinutes(30))
                .used(false)
                .build();
        passwordResetTokenRepository.save(reset);

        // For assignment/demo without email sending, return the token.
        return Map.of("token", token);
    }

    /**
     * Resets the user's password using a valid reset token.
     *
     * @param request the request containing the token and new password
     * @return a status map indicating success or failure
     */
    @PostMapping("/reset-password")
    public Map<String, String> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        PasswordResetToken token = passwordResetTokenRepository.findByToken(request.token())
                .orElseThrow(() -> new IllegalArgumentException("Invalid token"));

        if (token.isUsed() || token.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new IllegalArgumentException("Token expired or already used");
        }

        CampusUser user = token.getUser();
        user.setPasswordHash(passwordEncoder.encode(request.newPassword()));
        campusUserRepository.save(user);

        token.setUsed(true);
        passwordResetTokenRepository.save(token);

        return Map.of("status", "ok");
    }

    private String normalizeEmail(String email) {
        return email == null ? "" : email.trim().toLowerCase(Locale.ROOT);
    }

    private String normalizeName(String fullName) {
        String name = fullName == null ? "" : fullName.trim();
        if (name.isEmpty()) {
            throw new IllegalArgumentException("fullName is required");
        }
        return name;
    }

    private String normalizeUsername(String username) {
        if (username == null) {
            throw new IllegalArgumentException("username is required");
        }
        String normalized = username.trim().toLowerCase(Locale.ROOT);
        if (normalized.length() < 3) {
            throw new IllegalArgumentException("username is required");
        }
        return normalized;
    }

    private CampusUser resolveUserForPasswordLogin(String raw) {
        String trimmed = raw == null ? "" : raw.trim();
        if (trimmed.isEmpty()) {
            throw new IllegalArgumentException("Invalid email or password");
        }
        Optional<CampusUser> byEmail = trimmed.contains("@")
                ? campusUserRepository.findByEmailIgnoreCase(normalizeEmail(trimmed))
                : Optional.empty();
        if (byEmail.isPresent()) {
            return byEmail.get();
        }
        return campusUserRepository.findByUsernameIgnoreCase(trimmed.toLowerCase(Locale.ROOT))
                .orElseThrow(() -> new IllegalArgumentException("Invalid email or password"));
    }
}
