package com.mycompany.clinic_management_system.model;

import com.fasterxml.jackson.annotation.JsonCreator;

/**
 * System user access roles.
 */
public enum Role {
    ADMIN,
    STAFF,
    DOCTOR,
    PATIENT;

    @JsonCreator
    public static Role fromString(String value) {
        if (value == null) {
            return null;
        }
        String upper = value.trim().toUpperCase();
        if ("DENTIST".equals(upper)) {
            return DOCTOR;
        }
        return Role.valueOf(upper);
    }
}
