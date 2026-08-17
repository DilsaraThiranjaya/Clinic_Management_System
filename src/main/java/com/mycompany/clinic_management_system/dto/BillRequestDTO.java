package com.mycompany.clinic_management_system.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

/**
 * Data Transfer Object for billing generation request.
 */
public class BillRequestDTO {

    @NotNull(message = "Appointment number is required")
    private Long appointmentNumber;

    @Positive(message = "Custom total cost must be positive if provided")
    private Double customTotalCost;

    private String notes;

    public BillRequestDTO() {
    }

    public BillRequestDTO(Long appointmentNumber) {
        this.appointmentNumber = appointmentNumber;
    }

    public BillRequestDTO(Long appointmentNumber, Double customTotalCost) {
        this.appointmentNumber = appointmentNumber;
        this.customTotalCost = customTotalCost;
    }

    public Long getAppointmentNumber() {
        return appointmentNumber;
    }

    public void setAppointmentNumber(Long appointmentNumber) {
        this.appointmentNumber = appointmentNumber;
    }

    public Double getCustomTotalCost() {
        return customTotalCost;
    }

    public void setCustomTotalCost(Double customTotalCost) {
        this.customTotalCost = customTotalCost;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }
}
