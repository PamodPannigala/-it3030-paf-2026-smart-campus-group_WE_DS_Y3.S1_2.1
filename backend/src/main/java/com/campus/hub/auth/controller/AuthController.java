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
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import java.time.LocalDateTime;
import java.util.Map;
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
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthenticatedUserResolver authenticatedUserResolver;
    private final CampusUserRepository campusUserRepository;
    private final PasswordEncoder passwordEncoder;
    private final PasswordResetTokenRepository passwordResetTokenRepository;
    private final AuthenticationManager authenticationManager;

    @GetMapping("/me")
    public AuthUserResponse me(Authentication authentication) {
        CampusUser user = authenticatedUserResolver.resolve(authentication);
        return new AuthUserResponse(
                user.getId(),
                user.getFullName(),
                user.getEmail(),
                user.getRole(),
                user.getAuthProvider()
        );
    }

    @PostMapping("/signup")
    public AuthUserResponse signup(@Valid @RequestBody SignupRequest request) {
        campusUserRepository.findByEmailIgnoreCase(request.email()).ifPresent(existing -> {
            throw new IllegalArgumentException("Email is already registered");
        });

        CampusUser user = CampusUser.builder()
                .fullName(request.fullName().trim())
                .email(request.email().trim())
                .role(Role.USER) // never create admins via signup
                .authProvider("LOCAL")
                .passwordHash(passwordEncoder.encode(request.password()))
                .enabled(true)
                .build();

        CampusUser saved = campusUserRepository.save(user);
        return new AuthUserResponse(
                saved.getId(),
                saved.getFullName(),
                saved.getEmail(),
                saved.getRole(),
                saved.getAuthProvider()
        );
    }

    @PostMapping("/login")
    public AuthUserResponse login(
            @Valid @RequestBody LoginRequest request,
            HttpServletRequest httpServletRequest,
            HttpServletResponse httpServletResponse
    ) {
        Authentication auth = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.email(), request.password())
        );

        SecurityContextImpl context = new SecurityContextImpl();
        context.setAuthentication(auth);
        SecurityContextHolder.setContext(context);

        SecurityContextRepository repo = new HttpSessionSecurityContextRepository();
        repo.saveContext(context, httpServletRequest, httpServletResponse);

        CampusUser user = campusUserRepository.findByEmailIgnoreCase(request.email())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        return new AuthUserResponse(user.getId(), user.getFullName(), user.getEmail(), user.getRole(), user.getAuthProvider());
    }

    @PostMapping("/forgot-password")
    public Map<String, String> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        CampusUser user = campusUserRepository.findByEmailIgnoreCase(request.email())
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
}
