package agrismart.agrismart.dto;

import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
public class GoogleAuthRequest {
    private String credential; // Google ID token
    private String mode;       // "signup" or "login"

    public String getCredential() { return credential; }
    public void setCredential(String credential) { this.credential = credential; }

    public String getMode() { return mode; }
    public void setMode(String mode) { this.mode = mode; }
}
