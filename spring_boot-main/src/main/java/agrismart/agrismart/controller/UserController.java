package agrismart.agrismart.controller;

import agrismart.agrismart.dto.UserResponse;
import agrismart.agrismart.dto.ChangePasswordRequest;
import agrismart.agrismart.model.User;
import agrismart.agrismart.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Optional;
import java.util.Date;
import java.util.Map;
import java.util.stream.Collectors;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "http://localhost:4200")
public class UserController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @GetMapping
    public ResponseEntity<List<User>> getAllUsers() {
        List<User> users = userRepository.findAll();
        return ResponseEntity.ok(users);
    }

    @GetMapping("/{id}")
    public ResponseEntity<UserResponse> getUserById(@PathVariable String id) {
        Optional<User> user = userRepository.findById(id);
        return user.map(u -> ResponseEntity.ok(UserResponse.fromUser(u)))
                   .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @GetMapping("/email/{email}")
    public ResponseEntity<UserResponse> getUserByEmail(@PathVariable String email) {
        Optional<User> user = userRepository.findByEmail(email);
        return user.map(u -> ResponseEntity.ok(UserResponse.fromUser(u)))
                   .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<User> updateUser(@PathVariable String id, @RequestBody User userDetails) {
        Optional<User> user = userRepository.findById(id);
        if (user.isPresent()) {
            User existingUser = user.get();
            existingUser.setFirstName(userDetails.getFirstName());
            existingUser.setLastName(userDetails.getLastName());
            existingUser.setOrganization(userDetails.getOrganization());
            if (userDetails.getAccountType() != null) {
                existingUser.setAccountType(userDetails.getAccountType());
            }
            if (userDetails.getProfilePictureUrl() != null) {
                existingUser.setProfilePictureUrl(userDetails.getProfilePictureUrl());
            }
            if (userDetails.getRoleId() != null && !userDetails.getRoleId().isBlank()) {
                existingUser.setRoleId(userDetails.getRoleId());
            }
            if (userDetails.getStatus() != null && !userDetails.getStatus().isBlank()) {
                existingUser.setStatus(userDetails.getStatus());
            }
            existingUser.setUpdatedAt(new Date());
            return ResponseEntity.ok(userRepository.save(existingUser));
        }
        return ResponseEntity.notFound().build();
    }

    @PutMapping("/{id}/password")
    public ResponseEntity<Map<String, String>> updatePassword(@PathVariable String id, @RequestBody ChangePasswordRequest request) {
        Optional<User> user = userRepository.findById(id);
        if (user.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        String currentPassword = request.getCurrentPassword() == null ? "" : request.getCurrentPassword().trim();
        String newPassword = request.getNewPassword() == null ? "" : request.getNewPassword().trim();

        if (currentPassword.isBlank() || newPassword.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Mot de passe invalide."));
        }

        if (newPassword.length() < 8) {
            return ResponseEntity.badRequest().body(Map.of("message", "Le nouveau mot de passe doit contenir au moins 8 caractères."));
        }

        User existingUser = user.get();
        if (!passwordEncoder.matches(currentPassword, existingUser.getPasswordHash())) {
            return ResponseEntity.badRequest().body(Map.of("message", "Mot de passe actuel incorrect."));
        }

        existingUser.setPasswordHash(passwordEncoder.encode(newPassword));
        existingUser.setUpdatedAt(new Date());
        userRepository.save(existingUser);

        return ResponseEntity.ok(Map.of("message", "Mot de passe mis à jour avec succès."));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable String id) {
        if (userRepository.existsById(id)) {
            userRepository.deleteById(id);
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
    }

    /**
     * DEBUG endpoint to check current user's authorities.
     * Helps diagnose role/permission issues.
     */
    @GetMapping("/me/debug")
    public ResponseEntity<Map<String, Object>> debugCurrentUser(Authentication auth) {
        if (auth == null) {
            return ResponseEntity.ok(Map.of("authenticated", false, "message", "No authentication found"));
        }

        List<String> authorities = auth.getAuthorities().stream()
            .map(GrantedAuthority::getAuthority)
            .collect(Collectors.toList());

        return ResponseEntity.ok(Map.of(
            "authenticated", true,
            "principal", auth.getName(),
            "authorities", authorities,
            "authClass", auth.getClass().getSimpleName()
        ));
    }
}
