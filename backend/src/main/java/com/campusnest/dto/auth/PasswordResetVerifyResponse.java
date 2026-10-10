package com.campusnest.dto.auth;

public class PasswordResetVerifyResponse {

    private boolean valid;
    private String username;
    private String message;

    public PasswordResetVerifyResponse() {}

    public PasswordResetVerifyResponse(boolean valid, String username, String message) {
        this.valid = valid;
        this.username = username;
        this.message = message;
    }

    public boolean isValid() { return valid; }
    public void setValid(boolean valid) { this.valid = valid; }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
}
