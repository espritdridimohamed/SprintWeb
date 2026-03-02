package agrismart.agrismart.controller;

import agrismart.agrismart.dto.AuthResponse;
import agrismart.agrismart.dto.EmailRequest;
import agrismart.agrismart.dto.FacebookAuthRequest;
import agrismart.agrismart.dto.GoogleAuthRequest;
import agrismart.agrismart.dto.LoginRequest;
import agrismart.agrismart.dto.RegisterRequest;
import agrismart.agrismart.dto.ResetPasswordConfirmRequest;
import agrismart.agrismart.dto.VerifyCodeRequest;
import agrismart.agrismart.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:4200")
public class AuthController {

    @Autowired
    private AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@RequestBody RegisterRequest request) {
        AuthResponse response = authService.register(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        try {
            AuthResponse response = authService.login(request);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            String code = e.getMessage();
            HttpStatus status = HttpStatus.BAD_REQUEST;
            String message;

            switch (code) {
                case "ACCOUNT_INACTIVE":
                    status = HttpStatus.FORBIDDEN;
                    message = "Account locked or inactive. Contact the administration for more information.";
                    break;
                case "USER_NOT_FOUND":
                case "INVALID_PASSWORD":
                    status = HttpStatus.UNAUTHORIZED;
                    message = "Identifiants invalides.";
                    break;
                default:
                    message = "Login failed: " + code;
                    break;
            }

            return ResponseEntity.status(status).body(Map.of("error", code, "message", message));
        }
    }

    @PostMapping("/google")
    public ResponseEntity<?> googleAuth(@RequestBody GoogleAuthRequest request) {
        try {
            AuthResponse response;
            if ("signup".equalsIgnoreCase(request.getMode())) {
                response = authService.googleSignup(request.getCredential());
            } else {
                response = authService.googleLogin(request.getCredential());
            }
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            String code = e.getMessage();
            HttpStatus status = HttpStatus.BAD_REQUEST;
            String message;

            switch (code) {
                case "GOOGLE_ACCOUNT_EXISTS":
                    message = "Vous avez déjà un compte avec cet e-mail. Veuillez vous connecter.";
                    status = HttpStatus.CONFLICT;
                    break;
                case "GOOGLE_NO_ACCOUNT":
                    message = "Aucun compte trouvé avec cet e-mail. Veuillez d'abord créer un compte.";
                    status = HttpStatus.NOT_FOUND;
                    break;
                case "ACCOUNT_INACTIVE":
                    message = "Account locked or inactive. Contact the administration for more information.";
                    status = HttpStatus.FORBIDDEN;
                    break;
                default:
                    message = "Erreur d'authentification Google: " + code;
                    break;
            }
            return ResponseEntity.status(status).body(Map.of("error", code, "message", message));
        }
    }

    @PostMapping("/facebook")
    public ResponseEntity<?> facebookAuth(@RequestBody FacebookAuthRequest request) {
        try {
            AuthResponse response;
            if ("signup".equalsIgnoreCase(request.getMode())) {
                response = authService.facebookSignup(request.getAccessToken());
            } else {
                response = authService.facebookLogin(request.getAccessToken());
            }
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            String code = e.getMessage();
            HttpStatus status = HttpStatus.BAD_REQUEST;
            String message;

            switch (code) {
                case "FACEBOOK_ACCOUNT_EXISTS":
                    message = "Vous avez déjà un compte avec cet e-mail. Veuillez vous connecter.";
                    status = HttpStatus.CONFLICT;
                    break;
                case "FACEBOOK_NO_ACCOUNT":
                    message = "Aucun compte trouvé pour ce profil Facebook. Veuillez d'abord créer un compte.";
                    status = HttpStatus.NOT_FOUND;
                    break;
                case "FACEBOOK_EMAIL_REQUIRED":
                    message = "Facebook n'a pas fourni d'adresse e-mail. Veuillez utiliser l'inscription classique.";
                    status = HttpStatus.BAD_REQUEST;
                    break;
                case "FACEBOOK_TOKEN_INVALID":
                    message = "Token Facebook invalide ou expiré.";
                    status = HttpStatus.UNAUTHORIZED;
                    break;
                case "ACCOUNT_INACTIVE":
                    message = "Account locked or inactive. Contact the administration for more information.";
                    status = HttpStatus.FORBIDDEN;
                    break;
                default:
                    message = "Erreur d'authentification Facebook: " + code;
                    break;
            }
            return ResponseEntity.status(status).body(Map.of("error", code, "message", message));
        }
    }

    @PostMapping("/signup/request-code")
    public ResponseEntity<?> requestSignupCode(@RequestBody RegisterRequest request) {
        try {
            authService.requestSignupVerificationCode(request);
            return ResponseEntity.ok(Map.of("message", "Verification code sent to your email."));
        } catch (RuntimeException e) {
            return mapVerificationError(e.getMessage());
        }
    }

    @PostMapping("/signup/verify-code")
    public ResponseEntity<?> verifySignupCode(@RequestBody VerifyCodeRequest request) {
        try {
            AuthResponse response = authService.verifySignupCode(request.getEmail(), request.getCode());
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return mapVerificationError(e.getMessage());
        }
    }

    @PostMapping("/password-reset/request-code")
    public ResponseEntity<?> requestPasswordResetCode(@RequestBody EmailRequest request) {
        try {
            authService.requestPasswordResetCode(request.getEmail());
            return ResponseEntity.ok(Map.of("message", "Reset code sent to your email."));
        } catch (RuntimeException e) {
            return mapVerificationError(e.getMessage());
        }
    }

    @PostMapping("/password-reset/confirm")
    public ResponseEntity<?> confirmPasswordReset(@RequestBody ResetPasswordConfirmRequest request) {
        try {
            authService.confirmPasswordReset(request.getEmail(), request.getCode(), request.getNewPassword());
            return ResponseEntity.ok(Map.of("message", "Password reset successful."));
        } catch (RuntimeException e) {
            return mapVerificationError(e.getMessage());
        }
    }

    private ResponseEntity<Map<String, String>> mapVerificationError(String code) {
        HttpStatus status = HttpStatus.BAD_REQUEST;
        String message;

        switch (code) {
            case "EMAIL_ALREADY_EXISTS":
                status = HttpStatus.CONFLICT;
                message = "This email is already registered.";
                break;
            case "USER_NOT_FOUND":
                status = HttpStatus.NOT_FOUND;
                message = "No account found with this email.";
                break;
            case "SIGNUP_CODE_NOT_FOUND":
            case "RESET_CODE_NOT_FOUND":
                status = HttpStatus.NOT_FOUND;
                message = "Verification code not found. Please request a new one.";
                break;
            case "SIGNUP_CODE_EXPIRED":
            case "RESET_CODE_EXPIRED":
                status = HttpStatus.GONE;
                message = "Verification code expired. Please request a new one.";
                break;
            case "SIGNUP_CODE_INVALID":
            case "RESET_CODE_INVALID":
                status = HttpStatus.BAD_REQUEST;
                message = "Invalid verification code.";
                break;
            case "EMAIL_SEND_FAILED":
                status = HttpStatus.INTERNAL_SERVER_ERROR;
                message = "Failed to send email. Please try again later.";
                break;
            default:
                message = "Operation failed: " + code;
                break;
        }

        return ResponseEntity.status(status).body(Map.of("error", code, "message", message));
    }
}
