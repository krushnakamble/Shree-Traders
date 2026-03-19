package com.shoperp.dto;

public class LoginResponse {
    private boolean success;
    private String message;
    private String token; // We can use JWT later, dummy for now
    private String email;
    private String role;

    public LoginResponse() {}

    public LoginResponse(boolean success, String message, String token, String email, String role) {
        this.success = success;
        this.message = message;
        this.token = token;
        this.email = email;
        this.role = role;
    }

    public boolean isSuccess() { return success; }
    public void setSuccess(boolean success) { this.success = success; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }
}
