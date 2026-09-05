package com.mycompany.clinic_management_system.dto;

import com.mycompany.clinic_management_system.model.Role;

/**
 * Data Transfer Object for authentication response containing JWT token.
 */
public class AuthResponseDTO {

    private String token;
    private String type = "Bearer";
    private Long id;
    private String username;
    private Role role;
    private long expiresIn;
    private Long patientId;
    private String fullName;

    public AuthResponseDTO() {
    }

    public AuthResponseDTO(String token, Long id, String username, Role role, long expiresIn) {
        this.token = token;
        this.type = "Bearer";
        this.id = id;
        this.username = username;
        this.role = role;
        this.expiresIn = expiresIn;
    }

    public AuthResponseDTO(String token, Long id, String username, Role role, long expiresIn, Long patientId, String fullName) {
        this.token = token;
        this.type = "Bearer";
        this.id = id;
        this.username = username;
        this.role = role;
        this.expiresIn = expiresIn;
        this.patientId = patientId;
        this.fullName = fullName;
    }


    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public Role getRole() {
        return role;
    }

    public void setRole(Role role) {
        this.role = role;
    }

    public long getExpiresIn() {
        return expiresIn;
    }

    public void setExpiresIn(long expiresIn) {
        this.expiresIn = expiresIn;
    }

    public Long getPatientId() {
        return patientId;
    }

    public void setPatientId(Long patientId) {
        this.patientId = patientId;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }
}
