package agrismart.agrismart.service;

import agrismart.agrismart.dto.AuthResponse;
import agrismart.agrismart.dto.LoginRequest;
import agrismart.agrismart.dto.RegisterRequest;
import agrismart.agrismart.model.User;
import agrismart.agrismart.model.Role;
import agrismart.agrismart.repository.UserRepository;
import agrismart.agrismart.repository.RoleRepository;
import agrismart.agrismart.config.JwtUtil;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriUtils;

import java.nio.charset.StandardCharsets;
import java.util.Collections;
import java.util.Date;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class AuthService {
    private static final long VERIFICATION_CODE_TTL_MS = 10 * 60 * 1000;
    private static final String FACEBOOK_DEBUG_TOKEN_URL = "https://graph.facebook.com/debug_token?input_token=%s&access_token=%s|%s";
    private static final String FACEBOOK_ME_URL = "https://graph.facebook.com/me?fields=id,email,first_name,last_name,name,picture.type(large)&access_token=%s";

    private final Map<String, PendingSignup> pendingSignups = new ConcurrentHashMap<>();
    private final Map<String, VerificationCodeEntry> passwordResetCodes = new ConcurrentHashMap<>();
    private final RestTemplate restTemplate = new RestTemplate();

    private static class PendingSignup {
        private final RegisterRequest request;
        private final String code;
        private final long expiresAt;

        private PendingSignup(RegisterRequest request, String code, long expiresAt) {
            this.request = request;
            this.code = code;
            this.expiresAt = expiresAt;
        }
    }

    private static class VerificationCodeEntry {
        private final String code;
        private final long expiresAt;

        private VerificationCodeEntry(String code, long expiresAt) {
            this.code = code;
            this.expiresAt = expiresAt;
        }
    }

    private static class FacebookProfile {
        private final String facebookId;
        private final String email;
        private final String firstName;
        private final String lastName;
        private final String pictureUrl;

        private FacebookProfile(String facebookId, String email, String firstName, String lastName, String pictureUrl) {
            this.facebookId = facebookId;
            this.email = email;
            this.firstName = firstName;
            this.lastName = lastName;
            this.pictureUrl = pictureUrl;
        }
    }

    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private VerificationEmailService verificationEmailService;

    @Value("${google.client.id}")
    private String googleClientId;

    @Value("${facebook.app.id:}")
    private String facebookAppId;

    @Value("${facebook.app.secret:}")
    private String facebookAppSecret;

    public void requestSignupVerificationCode(RegisterRequest request) {
        String normalizedEmail = normalizeEmail(request.getEmail());

        if (userRepository.existsByEmail(normalizedEmail)) {
            throw new RuntimeException("EMAIL_ALREADY_EXISTS");
        }

        request.setEmail(normalizedEmail);
        String code = generateCode();
        long expiresAt = System.currentTimeMillis() + VERIFICATION_CODE_TTL_MS;
        pendingSignups.put(normalizedEmail, new PendingSignup(request, code, expiresAt));
        verificationEmailService.sendSignupCode(normalizedEmail, code);
    }

    public AuthResponse verifySignupCode(String email, String code) {
        String normalizedEmail = normalizeEmail(email);
        PendingSignup pendingSignup = pendingSignups.get(normalizedEmail);

        if (pendingSignup == null) {
            throw new RuntimeException("SIGNUP_CODE_NOT_FOUND");
        }

        if (System.currentTimeMillis() > pendingSignup.expiresAt) {
            pendingSignups.remove(normalizedEmail);
            throw new RuntimeException("SIGNUP_CODE_EXPIRED");
        }

        if (!pendingSignup.code.equals(code)) {
            throw new RuntimeException("SIGNUP_CODE_INVALID");
        }

        if (userRepository.existsByEmail(normalizedEmail)) {
            pendingSignups.remove(normalizedEmail);
            throw new RuntimeException("EMAIL_ALREADY_EXISTS");
        }

        RegisterRequest request = pendingSignup.request;

        Role role = roleRepository.findByNameIgnoreCase(request.getRole())
            .orElseThrow(() -> new RuntimeException("Role not found: " + request.getRole()));

        User user = new User(
            normalizedEmail,
            passwordEncoder.encode(request.getPassword()),
            request.getFirstName(),
            request.getLastName(),
            role.getId()
        );
        user.setOrganization(request.getOrganization());

        markUserLoggedIn(user);
        pendingSignups.remove(normalizedEmail);

        String token = jwtUtil.generateToken(user.getEmail(), role.getName());
        AuthResponse response = new AuthResponse(token, user.getEmail(), role.getName(), user.getFirstName(), user.getLastName());
        response.setProfilePictureUrl(user.getProfilePictureUrl());
        return response;
    }

    public void requestPasswordResetCode(String email) {
        String normalizedEmail = normalizeEmail(email);
        Optional<User> userOpt = userRepository.findByEmail(normalizedEmail);

        if (userOpt.isEmpty()) {
            throw new RuntimeException("USER_NOT_FOUND");
        }

        String code = generateCode();
        long expiresAt = System.currentTimeMillis() + VERIFICATION_CODE_TTL_MS;
        passwordResetCodes.put(normalizedEmail, new VerificationCodeEntry(code, expiresAt));
        verificationEmailService.sendPasswordResetCode(normalizedEmail, code);
    }

    public void confirmPasswordReset(String email, String code, String newPassword) {
        String normalizedEmail = normalizeEmail(email);
        VerificationCodeEntry codeEntry = passwordResetCodes.get(normalizedEmail);

        if (codeEntry == null) {
            throw new RuntimeException("RESET_CODE_NOT_FOUND");
        }

        if (System.currentTimeMillis() > codeEntry.expiresAt) {
            passwordResetCodes.remove(normalizedEmail);
            throw new RuntimeException("RESET_CODE_EXPIRED");
        }

        if (!codeEntry.code.equals(code)) {
            throw new RuntimeException("RESET_CODE_INVALID");
        }

        User user = userRepository.findByEmail(normalizedEmail)
            .orElseThrow(() -> new RuntimeException("USER_NOT_FOUND"));

        user.setPasswordHash(passwordEncoder.encode(newPassword));
        userRepository.save(user);
        passwordResetCodes.remove(normalizedEmail);
    }

    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already exists");
        }
        
        // Lookup roleId from role name
        Role role = roleRepository.findByNameIgnoreCase(request.getRole())
            .orElseThrow(() -> new RuntimeException("Role not found: " + request.getRole()));

        User user = new User(
                request.getEmail(),
                passwordEncoder.encode(request.getPassword()),
                request.getFirstName(),
                request.getLastName(),
                role.getId()
        );
        user.setOrganization(request.getOrganization());

        markUserLoggedIn(user);

        String token = jwtUtil.generateToken(user.getEmail(), role.getName());
        AuthResponse response = new AuthResponse(token, user.getEmail(), role.getName(), user.getFirstName(), user.getLastName());
        response.setProfilePictureUrl(user.getProfilePictureUrl());
        return response;
    }

    public AuthResponse login(LoginRequest request) {
        Optional<User> userOpt = userRepository.findByEmail(request.getEmail());
        if (userOpt.isEmpty()) {
            throw new RuntimeException("USER_NOT_FOUND");
        }

        User user = userOpt.get();
        ensureAccountActive(user);

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new RuntimeException("INVALID_PASSWORD");
        }
        
        // Lookup role name from roleId
        Role role = roleRepository.findById(user.getRoleId())
            .orElseThrow(() -> new RuntimeException("Role not found"));

        markUserLoggedIn(user);

        String token = jwtUtil.generateToken(user.getEmail(), role.getName());
        AuthResponse response = new AuthResponse(token, user.getEmail(), role.getName(), user.getFirstName(), user.getLastName());
        response.setProfilePictureUrl(user.getProfilePictureUrl());
        return response;
    }

    /**
     * Google Sign-Up: verify Google ID token, create new user with VIEWER role.
     * If user already exists, throw error with specific message.
     */
    public AuthResponse googleSignup(String credential) {
        GoogleIdToken.Payload payload = verifyGoogleToken(credential);
        
        String email = payload.getEmail();
        String firstName = (String) payload.get("given_name");
        String lastName = (String) payload.get("family_name");
        String pictureUrl = (String) payload.get("picture");
        
        if (firstName == null) firstName = "Utilisateur";
        if (lastName == null) lastName = "Google";

        // Check if user already exists
        if (userRepository.existsByEmail(email)) {
            throw new RuntimeException("GOOGLE_ACCOUNT_EXISTS");
        }

        // Find the VIEWER role
        Role role = roleRepository.findByNameIgnoreCase("viewer")
            .orElseThrow(() -> new RuntimeException("Role VIEWER not found. Please restart the server."));

        // Create user with random password (they'll use Google to login)
        User user = new User(
            email,
            passwordEncoder.encode(UUID.randomUUID().toString()),
            firstName,
            lastName,
            role.getId()
        );
        user.setAccountType("GOOGLE");
        user.setOrganization("Client AgriSmart");
        user.setProfilePictureUrl(pictureUrl);

        markUserLoggedIn(user);

        String token = jwtUtil.generateToken(user.getEmail(), role.getName());
        AuthResponse response = new AuthResponse(token, user.getEmail(), role.getName(), user.getFirstName(), user.getLastName());
        response.setProfilePictureUrl(pictureUrl);
        return response;
    }

    /**
     * Google Login: verify Google ID token, find existing user and log them in.
     * If user doesn't exist, throw error.
     */
    public AuthResponse googleLogin(String credential) {
        GoogleIdToken.Payload payload = verifyGoogleToken(credential);
        
        String email = payload.getEmail();

        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isEmpty()) {
            throw new RuntimeException("GOOGLE_NO_ACCOUNT");
        }

        User user = userOpt.get();
        ensureAccountActive(user);
        
        Role role = roleRepository.findById(user.getRoleId())
            .orElseThrow(() -> new RuntimeException("Role not found"));

        markUserLoggedIn(user);

        String token = jwtUtil.generateToken(user.getEmail(), role.getName());
        AuthResponse response = new AuthResponse(token, user.getEmail(), role.getName(), user.getFirstName(), user.getLastName());
        response.setProfilePictureUrl(user.getProfilePictureUrl());
        return response;
    }

    public AuthResponse facebookSignup(String accessToken) {
        FacebookProfile profile = verifyFacebookAccessToken(accessToken);

        if (profile.email.isBlank()) {
            throw new RuntimeException("FACEBOOK_EMAIL_REQUIRED");
        }

        if (userRepository.existsByEmail(profile.email)) {
            throw new RuntimeException("FACEBOOK_ACCOUNT_EXISTS");
        }

        Role role = roleRepository.findByNameIgnoreCase("viewer")
            .orElseThrow(() -> new RuntimeException("Role VIEWER not found. Please restart the server."));

        User user = new User(
            profile.email,
            passwordEncoder.encode(UUID.randomUUID().toString()),
            profile.firstName,
            profile.lastName,
            role.getId()
        );
        user.setAccountType("FACEBOOK");
        user.setOrganization("Client AgriSmart");
        user.setProfilePictureUrl(profile.pictureUrl);
        user.setFacebookId(profile.facebookId);

        markUserLoggedIn(user);

        String token = jwtUtil.generateToken(user.getEmail(), role.getName());
        AuthResponse response = new AuthResponse(token, user.getEmail(), role.getName(), user.getFirstName(), user.getLastName());
        response.setProfilePictureUrl(user.getProfilePictureUrl());
        return response;
    }

    public AuthResponse facebookLogin(String accessToken) {
        FacebookProfile profile = verifyFacebookAccessToken(accessToken);

        Optional<User> userOpt = Optional.empty();
        if (!profile.email.isBlank()) {
            userOpt = userRepository.findByEmail(profile.email);
        }

        if (userOpt.isEmpty() && !profile.facebookId.isBlank()) {
            userOpt = userRepository.findByFacebookId(profile.facebookId);
        }

        if (userOpt.isEmpty()) {
            throw new RuntimeException("FACEBOOK_NO_ACCOUNT");
        }

        User user = userOpt.get();
        ensureAccountActive(user);

        if ((user.getFacebookId() == null || user.getFacebookId().isBlank()) && !profile.facebookId.isBlank()) {
            user.setFacebookId(profile.facebookId);
        }

        if ((user.getProfilePictureUrl() == null || user.getProfilePictureUrl().isBlank()) && !profile.pictureUrl.isBlank()) {
            user.setProfilePictureUrl(profile.pictureUrl);
        }

        Role role = roleRepository.findById(user.getRoleId())
            .orElseThrow(() -> new RuntimeException("Role not found"));

        markUserLoggedIn(user);

        String token = jwtUtil.generateToken(user.getEmail(), role.getName());
        AuthResponse response = new AuthResponse(token, user.getEmail(), role.getName(), user.getFirstName(), user.getLastName());
        response.setProfilePictureUrl(user.getProfilePictureUrl());
        return response;
    }

    /**
     * Verify Google ID token and return the payload.
     */
    private GoogleIdToken.Payload verifyGoogleToken(String credential) {
        try {
            GoogleIdTokenVerifier verifier = new GoogleIdTokenVerifier.Builder(
                new NetHttpTransport(), GsonFactory.getDefaultInstance())
                .setAudience(Collections.singletonList(googleClientId))
                .build();

            GoogleIdToken idToken = verifier.verify(credential);
            if (idToken == null) {
                throw new RuntimeException("Invalid Google token");
            }
            return idToken.getPayload();
        } catch (RuntimeException e) {
            throw e;
        } catch (Exception e) {
            throw new RuntimeException("Failed to verify Google token: " + e.getMessage());
        }
    }

    private FacebookProfile verifyFacebookAccessToken(String accessToken) {
        if (accessToken == null || accessToken.isBlank()) {
            throw new RuntimeException("FACEBOOK_TOKEN_INVALID");
        }

        if (facebookAppId == null || facebookAppId.isBlank() || facebookAppSecret == null || facebookAppSecret.isBlank()) {
            throw new RuntimeException("FACEBOOK_TOKEN_INVALID");
        }

        try {
            String encodedAccessToken = UriUtils.encode(accessToken, StandardCharsets.UTF_8);
            String debugUrl = String.format(FACEBOOK_DEBUG_TOKEN_URL, encodedAccessToken, facebookAppId, facebookAppSecret);
            String debugResponse = restTemplate.getForObject(debugUrl, String.class);
            JsonObject debugRoot = JsonParser.parseString(debugResponse).getAsJsonObject();
            JsonObject debugNode = debugRoot.has("data") && debugRoot.get("data").isJsonObject()
                ? debugRoot.getAsJsonObject("data")
                : new JsonObject();

            boolean isValid = debugNode.has("is_valid") && debugNode.get("is_valid").getAsBoolean();
            String appId = debugNode.has("app_id") ? debugNode.get("app_id").getAsString() : "";

            if (!isValid || !facebookAppId.equals(appId)) {
                throw new RuntimeException("FACEBOOK_TOKEN_INVALID");
            }

            String profileUrl = String.format(FACEBOOK_ME_URL, encodedAccessToken);
            String profileResponse = restTemplate.getForObject(profileUrl, String.class);
            JsonObject profileNode = JsonParser.parseString(profileResponse).getAsJsonObject();

            String facebookId = profileNode.has("id") ? profileNode.get("id").getAsString().trim() : "";
            if (facebookId.isBlank()) {
                throw new RuntimeException("FACEBOOK_TOKEN_INVALID");
            }

            String email = normalizeEmail(profileNode.has("email") ? profileNode.get("email").getAsString() : "");
            String firstName = profileNode.has("first_name") ? profileNode.get("first_name").getAsString().trim() : "";
            String lastName = profileNode.has("last_name") ? profileNode.get("last_name").getAsString().trim() : "";
            String fullName = profileNode.has("name") ? profileNode.get("name").getAsString().trim() : "";

            String pictureUrl = "";
            if (profileNode.has("picture") && profileNode.get("picture").isJsonObject()) {
                JsonObject pictureNode = profileNode.getAsJsonObject("picture");
                if (pictureNode.has("data") && pictureNode.get("data").isJsonObject()) {
                    JsonObject dataNode = pictureNode.getAsJsonObject("data");
                    if (dataNode.has("url")) {
                        pictureUrl = dataNode.get("url").getAsString().trim();
                    }
                }
            }

            if (firstName.isBlank() && !fullName.isBlank()) {
                String[] parts = fullName.split("\\s+", 2);
                firstName = parts[0];
                lastName = parts.length > 1 ? parts[1] : "Facebook";
            }

            if (firstName.isBlank()) {
                firstName = "Utilisateur";
            }

            if (lastName.isBlank()) {
                lastName = "Facebook";
            }

            return new FacebookProfile(facebookId, email, firstName, lastName, pictureUrl);
        } catch (RuntimeException e) {
            throw e;
        } catch (Exception e) {
            throw new RuntimeException("FACEBOOK_TOKEN_INVALID");
        }
>>>>>>> origin/mohamed
    }

    public Optional<User> findByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    private String normalizeEmail(String email) {
        return email == null ? "" : email.trim().toLowerCase();
    }

    private String generateCode() {
        return String.format("%06d", (int) (Math.random() * 1_000_000));
    }

    private void ensureAccountActive(User user) {
        String status = normalizeStatus(user.getStatus());
        if (!"ACTIVE".equals(status)) {
            throw new RuntimeException("ACCOUNT_INACTIVE");
        }
    }

    private String normalizeStatus(String status) {
        return status == null ? "ACTIVE" : status.trim().toUpperCase();
    }

    private void markUserLoggedIn(User user) {
        Date now = new Date();
        user.setLastLoginAt(now);
        user.setUpdatedAt(now);
        userRepository.save(user);
    }
}
