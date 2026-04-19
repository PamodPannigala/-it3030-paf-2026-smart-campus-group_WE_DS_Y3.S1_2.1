package com.campus.hub.security;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class OAuth2LoginSuccessHandler implements AuthenticationSuccessHandler {

    private final AuthenticatedUserResolver userResolver;
    private final com.campus.hub.repository.CampusUserRepository userRepository;

    @Value("${app.oauth2.success-redirect:http://localhost:5173/oauth-success}")
    private String successRedirectUrl;

    @Override
    public void onAuthenticationSuccess(
            HttpServletRequest request,
            HttpServletResponse response,
            Authentication authentication
    ) throws IOException, ServletException {
        try {
            com.campus.hub.entity.CampusUser user = userResolver.resolve(authentication);
            user.setLastLoginAt(java.time.LocalDateTime.now());
            userRepository.save(user);
        } catch (Exception e) {
            // Log error but don't block login
        }
        response.sendRedirect(successRedirectUrl);
    }
}
