package com.campus.hub.security;

import com.campus.hub.user.entity.CampusUser;
import com.campus.hub.user.entity.Role;
import com.campus.hub.user.repository.CampusUserRepository;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserService;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.OAuth2Error;
import org.springframework.security.oauth2.core.user.DefaultOAuth2User;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CustomOAuth2UserService implements OAuth2UserService<OAuth2UserRequest, OAuth2User> {

    private final CampusUserRepository campusUserRepository;
    private final DefaultOAuth2UserService delegate = new DefaultOAuth2UserService();

    @Value("${app.seed.admin-email:}")
    private String seedAdminEmail;

    @Value("${app.seed.admin-name:System Admin}")
    private String seedAdminName;

    @Override
    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {
        OAuth2User oauth2User = delegate.loadUser(userRequest);
        Map<String, Object> attributes = oauth2User.getAttributes();

        String email = readString(attributes, "email");
        if (email == null) {
            throw new OAuth2AuthenticationException(new OAuth2Error("invalid_user_info"), "Email is missing in OAuth2 user info");
        }

        String fullName = readString(attributes, "name");
        if (fullName == null) {
            fullName = isSeedAdmin(email) && !seedAdminName.isBlank() ? seedAdminName : email;
        }

        String provider = userRequest.getClientRegistration().getRegistrationId().toUpperCase(Locale.ROOT);

        CampusUser user = campusUserRepository.findByEmailIgnoreCase(email)
                .map(existing -> updateExistingUser(existing, fullName, provider, email))
                .orElseGet(() -> createNewUser(email, fullName, provider));

        user = campusUserRepository.save(user);

        List<GrantedAuthority> authorities = List.of(
                new SimpleGrantedAuthority("ROLE_" + user.getRole().name())
        );

        String nameAttributeKey = userRequest.getClientRegistration()
                .getProviderDetails()
                .getUserInfoEndpoint()
                .getUserNameAttributeName();

        if (nameAttributeKey == null || !attributes.containsKey(nameAttributeKey)) {
            nameAttributeKey = attributes.containsKey("email") ? "email" : "sub";
        }

        return new DefaultOAuth2User(authorities, attributes, nameAttributeKey);
    }

    private CampusUser createNewUser(String email, String fullName, String provider) {
        Role role = isSeedAdmin(email) ? Role.ADMIN : Role.USER;
        return CampusUser.builder()
                .email(email)
                .fullName(fullName)
                .role(role)
                .authProvider(provider)
                .enabled(true)
                .build();
    }

    private CampusUser updateExistingUser(CampusUser existing, String fullName, String provider, String email) {
        existing.setFullName(fullName);
        existing.setAuthProvider(provider);
        existing.setEnabled(true);
        if (isSeedAdmin(email)) {
            existing.setRole(Role.ADMIN);
        }
        return existing;
    }

    private boolean isSeedAdmin(String email) {
        return seedAdminEmail != null
                && !seedAdminEmail.isBlank()
                && seedAdminEmail.equalsIgnoreCase(email);
    }

    private String readString(Map<String, Object> attributes, String key) {
        Object value = attributes.get(key);
        if (value == null) {
            return null;
        }
        String text = value.toString().trim();
        return text.isEmpty() ? null : text;
    }
}
