package agrismart.agrismart.dto;

import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
public class FacebookAuthRequest {
    private String accessToken;
    private String mode; // "signup" or "login"

    public String getAccessToken() { return accessToken; }
    public void setAccessToken(String accessToken) { this.accessToken = accessToken; }

    public String getMode() { return mode; }
    public void setMode(String mode) { this.mode = mode; }
}
