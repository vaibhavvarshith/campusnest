package com.campusnest.dto.auth;

import jakarta.validation.constraints.NotBlank;

public class ForgotPasswordRequest {

    @NotBlank(message = "Account identifier is required")
    private String identifier;

    private String portal; // admin, librarian, student, faculty

    public ForgotPasswordRequest() {}

    public ForgotPasswordRequest(String identifier, String portal) {
        this.identifier = identifier;
        this.portal = portal;
    }

    public String getIdentifier() { return identifier; }
    public void setIdentifier(String identifier) { this.identifier = identifier; }

    public String getPortal() { return portal; }
    public void setPortal(String portal) { this.portal = portal; }
}
